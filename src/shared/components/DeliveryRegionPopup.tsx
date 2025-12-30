"use client";

import React, { useEffect, useMemo, useState } from "react";
import Modal from "@/shared/components/ui/Modal";
import RegionSelector from "@/features/region/components/RegionSelector";
import { clientRequest } from "@/shared/lib/http/client";

type PriceMap = {
  [key: string]: string;
};

type RegionRow = {
  id: string;
  region: string;
  sido?: string;
  sigungu?: string;
  handled: boolean;
  prices: PriceMap;
  selected?: boolean;
};

type MemberProductPriceRequest = {
  categoryName: string;
  price: number;
  isAvailable: boolean;
};

type MemberRegionPriceRequest = {
  sido: string;
  sigungu: string;
  handled: boolean;
  prices: MemberProductPriceRequest[];
};

interface Props {
  onClose: () => void;
  onSave?: (
    rows: {
      id: string;
      region: string;
      sido?: string;
      sigungu?: string;
      handled: boolean;
      prices: { [key: string]: number };
      selected?: boolean;
    }[]
  ) => void;
  modalOpenRef: React.MutableRefObject<boolean>;
}

const columns = [
  "축하",
  "근조",
  "오브제",
  "동양",
  "서양",
  "꽃",
  "관엽",
  "쌀",
  "기타",
  "과일",
];

function makeEmptyRow(): RegionRow {
  const prices: PriceMap = {};
  columns.forEach((c) => (prices[c] = ""));
  return {
    id: Date.now().toString() + Math.random().toString(36).slice(2, 8),
    region: "",
    handled: true,
    prices,
    selected: false,
  };
}

function buildApiPayload(rows: RegionRow[]): MemberRegionPriceRequest[] {
  return rows
    .filter((r) => r.sido && r.sigungu)
    .map((r) => ({
      sido: r.sido!,
      sigungu: r.sigungu!,
      handled: r.handled,
      prices: Object.entries(r.prices).map(([category, value]) => {
        const price = value === "" ? 0 : Number(value);
        return {
          categoryName: category,
          price,
          isAvailable: r.handled && price > 0,
        };
      }),
    }));
}

async function saveRegionsAndPrices(payload: MemberRegionPriceRequest[]) {
  const res = await clientRequest({
    url: "/api/members/me/regions-prices",
    method: "POST",
    data: payload,
  });

  if (res.code !== 200) {
    throw new Error(res.message || "조회 실패");
  }

  return res;
}

async function fetchRegionsAndPrices(): Promise<MemberRegionPriceRequest[]> {
  const res = await clientRequest({
    url: "/api/members/me/regions-prices",
    method: "GET",
  });
  console.log("POST response =", res);
  // if (!res.success) {
  //   throw new Error("조회 실패");
  // }

  return res.data;
}

function mapApiDataToRows(data: MemberRegionPriceRequest[]): RegionRow[] {
  return data.map((r) => {
    const prices: PriceMap = {};

    columns.forEach((c) => {
      const found = r.prices.find((p) => p.categoryName === c);
      prices[c] = found && found.isAvailable ? String(found.price) : "";
    });

    return {
      id: `${r.sido}-${r.sigungu}`,
      region: `${r.sido} ${r.sigungu}`,
      sido: r.sido,
      sigungu: r.sigungu,
      handled: r.handled,
      prices,
      selected: false,
    };
  });
}

export default function DeliveryRegionPopup({ onClose, modalOpenRef }: Props) {
  const [rows, setRows] = useState<RegionRow[]>(() => [makeEmptyRow()]);
  const [now, setNow] = useState<string>(new Date().toLocaleString());
  const [isOpenRegionModal, setIsOpenRegionModal] = useState<boolean>(false);
  const [activeRowId, setActiveRowId] = useState<string | null>(null);

  const closeRegionModal = () => {
    setIsOpenRegionModal(false);
  };

  useEffect(() => {
    modalOpenRef.current = true;

    const load = async () => {
      try {
        const data = await fetchRegionsAndPrices();

        if (data.length > 0) {
          setRows(mapApiDataToRows(data));
        } else {
          setRows([makeEmptyRow()]);
        }
      } catch (e) {
        console.error(e);
        setRows([makeEmptyRow()]);
      }
    };

    load();

    return () => {
      modalOpenRef.current = false;
    };
  }, []);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date().toLocaleString()), 1000);
    return () => clearInterval(t);
  }, []);

  const toggleSelect = (id: string) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, selected: !r.selected } : r))
    );
  };

  const addRow = () => {
    const newRow = makeEmptyRow();
    setRows((prev) => [...prev, newRow]);
    setActiveRowId(newRow.id);
    setIsOpenRegionModal(true);
  };
  const deleteSelected = () =>
    setRows((prev) => prev.filter((r) => !r.selected));
  const updateRegion = (
    id: string,
    value: string,
    sido?: string,
    sigungu?: string
  ) =>
    setRows((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, region: value, sido, sigungu } : r
      )
    );
  const toggleHandled = (id: string) =>
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, handled: !r.handled } : r))
    );
  const updatePrice = (id: string, col: string, value: string) =>
    setRows((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, prices: { ...r.prices, [col]: value } } : r
      )
    );

  const header = useMemo(() => ["", "지역", ...columns], []);

  const [saving, setSaving] = useState(false);
  const handleSave = async () => {
    if (saving) return;

    // 1️⃣ 필수 지역 검증
    if (rows.some((r) => !r.sido || !r.sigungu)) {
      alert("지역을 선택하지 않은 행이 있습니다.");
      return;
    }

    const payload = buildApiPayload(rows);

    try {
      setSaving(true);
      const res = await saveRegionsAndPrices(payload);
      alert(res.message || "저장되었습니다.");
      onClose(); // 팝업 닫기
    } catch (e) {
      console.error("저장 중 오류 {}", e);
      alert("저장 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  return (
    // <div className="absolute right-0 mt-2 w-[calc(100vw-3rem)] max-w-[1100px] bg-white rounded-lg shadow-lg border border-gray-200 z-50">
    <div
      className="
    fixed
    top-20
    left-1/2
    -translate-x-1/2
    w-[calc(100vw-3rem)]
    max-w-[1100px]
    bg-white
    rounded-lg
    shadow-lg
    border
  "
    >
      <div className="flex items-center justify-between p-2 border-b">
        <div className="flex items-center gap-1">
          <div className="text-base">📍</div>
          <div className="font-semibold text-sm">배송지역 설정</div>
        </div>
        <div className="flex items-center gap-1">
          <div className="text-xs text-gray-500">{now}</div>
          <button
            onClick={onClose}
            className="text-xs px-2 py-1 border rounded"
          >
            닫기
          </button>
        </div>
      </div>

      <div className="p-2">
        <div className="border rounded">
          <div className="max-h-[60vh] overflow-auto">
            <table className="min-w-full table-fixed">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  {header.map((h, idx) => (
                    <th
                      key={String(h) + idx}
                      className={`p-1 text-left text-xs font-medium text-gray-600 border-b ${
                        idx === 0 ? "w-6" : idx === 1 ? "w-28" : "w-12"
                      }`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b last:border-0">
                    <td className="p-2 align-top w-6">
                      <input
                        type="checkbox"
                        checked={!!r.selected}
                        onChange={() => toggleSelect(r.id)}
                      />
                    </td>
                    <td className="p-1 align-top w-28">
                      <div className="flex items-center gap-1">
                        <input
                          value={r.region}
                          readOnly
                          placeholder="지역 선택"
                          className="border rounded px-2 py-1 text-xs w-20"
                        />
                        <button
                          type="button"
                          onMouseDown={(e) => e.stopPropagation()}
                          onClick={() => {
                            setActiveRowId(r.id);
                            setIsOpenRegionModal(true);
                          }}
                          className="text-xs px-2 py-1 border rounded"
                        >
                          선택
                        </button>

                        <label className="text-xs text-gray-400 flex items-center gap-1">
                          <input
                            type="checkbox"
                            checked={!r.handled}
                            onChange={() => toggleHandled(r.id)}
                          />
                          <span className="text-xs">미취급</span>
                        </label>
                      </div>
                    </td>

                    {columns.map((col) => (
                      <td key={col} className="p-1 align-top w-12">
                        {r.handled ? (
                          <input
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={r.prices[col] ?? ""}
                            onChange={(e) => {
                              const v = e.target.value.replace(/[^0-9]/g, "");
                              updatePrice(r.id, col, v);
                            }}
                            className="border rounded px-2 py-1 text-xs w-10"
                            placeholder="0"
                          />
                        ) : (
                          <div className="text-xs text-gray-400 italic">
                            미취급
                          </div>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 p-2 border-t">
        <button
          onClick={addRow}
          className="px-2 py-1 bg-primary text-white rounded text-xs"
        >
          지역 추가
        </button>
        <button
          onClick={deleteSelected}
          className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs"
        >
          선택 삭제
        </button>
        <button
          onClick={handleSave}
          className="px-2 py-1 bg-green-600 text-white rounded text-xs"
        >
          저장
        </button>
      </div>

      {/* 지역 선택 모달 */}
      <Modal
        isOpen={isOpenRegionModal}
        title="지역 추가"
        hasFooter={false}
        onCancel={() => {
          closeRegionModal();
        }}
        size="lg"
      >
        <RegionSelector
          onRegionSelect={(sido: string, sigungu: string) => {
            if (!activeRowId) return;
            const regionLabel = `${sido} ${sigungu}`;
            updateRegion(activeRowId, regionLabel, sido, sigungu);
            setIsOpenRegionModal(false);
            setActiveRowId(null);
          }}
        />
      </Modal>
    </div>
  );
}

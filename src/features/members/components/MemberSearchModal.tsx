"use client";

import { useEffect, useState } from "react";
import MemberList from "@/features/members/components/MemberList";
import InteractiveSvgMap from "@/features/region/components/InteractiveSvgMap";
import RegionSelector from "@/features/region/components/RegionSelector";
import { useRouter } from "next/navigation";
import { clientRequest } from "@/shared/lib/http/client";

export type ShopItem = {
  shopId?: string;
  shopName: string;
  region: string;
  phone?: string;
};

type Member = {
  id?: string;
  name?: string;
  phone?: string;
  tel?: string;
  mobile?: string;
  shopId?: string;
  shopName?: string;
  memo?: string;
  tags?: string[];
  prices?: Record<string, number | string>;
};

interface MemberSearchModalProps {
  open: boolean;
  onClose: () => void;
  onSelectMember: (shop: ShopItem) => void;
}

type Rank = "Bronze" | "Silver" | "Gold" | "Platinum" | "Diamond";
type SearchMember = {
  id?: string;
  name?: string;
  phone?: string;
  region?: string;
  memo?: string;
  tags?: string[];
  prices?: Record<string, number | string>;
  rank?: Rank;
};

export default function MemberSearchModal({
  open,
  onClose,
  onSelectMember,
}: MemberSearchModalProps) {
  const [selectedSido, setSelectedSido] = useState<string | null>(null);
  const [selectedSigungu, setSelectedSigungu] = useState<string | null>(null);
  const [memberList, setMemberList] = useState<Member[]>([]);
  const [viewMode, setViewMode] = useState<"map" | "list">("list");
  const [memberType, setMemberType] = useState<"partners" | "premium">(
    "partners"
  );
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [selectedProvince, setSelectedProvince] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [members, setMembers] = useState<SearchMember[]>([]);

  const SIDO_SVG_MAP: Record<string, string> = {
    서울특별시: "/maps_all/seoul/seoul-gu.svg",
    부산광역시: "/maps_all/busan/busan-gu.svg",
    대구광역시: "/maps_all/daegu/daegu-gu.svg",
    인천광역시: "/maps_all/incheon/incheon-gu.svg",
    광주광역시: "/maps_all/gwangju/gwangju-gu.svg",
    대전광역시: "/maps_all/daejeon/daejeon-gu.svg",
    울산광역시: "/maps_all/ulsan/ulsan-gu.svg",
    세종특별자치시: "/maps_all/sejong/sejong-gu.svg",
    경기도: "/maps_all/gyeonggi/gyeonggi-gu.svg",
    강원도: "/maps_all/gangwon/gangwon-gu.svg",
    충청북도: "/maps_all/chungbuk/chungbuk-gu.svg",
    충청남도: "/maps_all/chungnam/chungnam-gu.svg",
    전라북도: "/maps_all/jeonbuk/jeonbuk-gu.svg",
    전라남도: "/maps_all/jeonnam/jeonnam-gu.svg",
    경상북도: "/maps_all/gyeongbuk/gyeongbuk-gu.svg",
    경상남도: "/maps_all/gyeongnam/gyeongnam-gu.svg",
    제주특별자치도: "/maps_all/jeju/jeju-gu.svg",
  };

  const SLUG_TO_SIDO: Record<string, string> = {
    seoul: "서울특별시",
    busan: "부산광역시",
    daegu: "대구광역시",
    incheon: "인천광역시",
    gwangju: "광주광역시",
    daejeon: "대전광역시",
    ulsan: "울산광역시",
    sejong: "세종특별자치시",
    gyeonggi: "경기도",
    gangwon: "강원도",
    chungbuk: "충청북도",
    chungnam: "충청남도",
    jeonbuk: "전라북도",
    jeonnam: "전라남도",
    gyeongbuk: "경상북도",
    gyeongnam: "경상남도",
    jeju: "제주특별자치도",
  };

  const sampleMembers: Member[] = [
    {
      id: "m1",
      name: "채플꽃화1",
      memo: "장례/플로팅",
      tags: ["신규회원", "야간배송"],
      prices: { 축하: 38, 근조: 38, 동양: 70, 서양: 70, 꽃: 70, 관엽: 80 },
      phone: "02-123-4567",
    },
    {
      id: "m2",
      name: "앨로플라워1",
      memo: "",
      tags: ["프리미엄"],
      prices: { 축하: 38 },
      phone: "02-234-5678",
    },
  ];

  useEffect(() => {
    setMemberList(members as Member[]);
  }, [members]);

  function mapPrices(
    prices?: Array<{
      categoryName: string;
      price: number;
      isAvailable: boolean;
    }>
  ): Record<string, number> {
    if (!prices) return {};

    return prices
      .filter((p) => p.isAvailable) // 사용 가능한 것만
      .reduce((acc, cur) => {
        acc[cur.categoryName] = cur.price;
        return acc;
      }, {} as Record<string, number>);
  }
  const rankWeight = (rank?: Rank) => {
    switch (rank) {
      case "Diamond":
        return 5;
      case "Platinum":
        return 4;
      case "Gold":
        return 3;
      case "Silver":
        return 2;
      case "Bronze":
        return 1;
      default:
        return 0;
    }
  };

  async function searchMembers(params: {
    name?: string;
    sido?: string;
    sigungu?: string | null;
    productName?: string;
  }): Promise<SearchMember[]> {
    const qs = new URLSearchParams();

    if (params.name) qs.append("name", params.name);
    if (params.sido) qs.append("sido", params.sido);
    if (params.sigungu) qs.append("sigungu", params.sigungu);
    if (params.productName) qs.append("productName", params.productName);

    const res = await clientRequest({
      url: `/api/members/search/combined?${qs.toString()}`,
      method: "GET",
    });

    console.log("searchMembers response:", res);

    // ✅ ApiResponse 규약 기준 파싱
    if (res.code !== 200) {
      throw new Error(res.message || "회원 검색 실패");
    }

    // Page<MemberResponse> → content만 반환
    // return res.data?.content ?? [];
    return (res.data?.content ?? []).map((m: any) => ({
      id: String(m.id),
      name: m.name,
      phone: m.phone,
      region: m.region,
      memo: m.memo,
      tags: m.tags,
      rank: m.rank,
      prices: mapPrices(m.prices),
    }));
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) {
      document.addEventListener("keydown", onKey);
      return () => document.removeEventListener("keydown", onKey);
    }
  }, [open, onClose]);

  const onSearch = async (prov: string | null, district: string | null) => {
    if (!prov) return;

    try {
      const data = await searchMembers({
        name: searchKeyword.trim() || undefined,
        sido: prov,
        sigungu: district,
      });

      // 프리미엄 필터 (임시: 추후 서버로 이동 가능)
      let filtered = data;
      if (memberType === "premium") {
        filtered = filtered.filter(
          (m) =>
            ["Gold", "Platinum", "Diamond"].includes(m.rank || "") ||
            (m.tags || []).includes("프리미엄")
        );
      }

      // 정렬
      filtered = [...filtered].sort((a, b) => {
        const wb = rankWeight(b.rank);
        const wa = rankWeight(a.rank);
        if (wb !== wa) return wb - wa;
        return (a.name || "").localeCompare(b.name || "", "ko");
      });

      setMembers(filtered);
      setSelectedProvince(prov);
      setSelectedDistrict(district);
    } catch (e) {
      console.error(e);
      setMembers([]);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1000]">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div
        className="absolute inset-0 flex items-center justify-center p-4"
        aria-modal="true"
        role="dialog"
      >
        <div className="relative bg-white w-[min(90vw,1300px)] h-[80vh] rounded-2xl shadow-xl border border-gray-200 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">회원검색</h2>
            <button
              className="inline-flex items-center justify-center rounded-lg p-2 text-gray-600 hover:bg-gray-100"
              onClick={onClose}
              aria-label="닫기"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 grid grid-cols-[420px,1fr] gap-0 overflow-hidden">
            {/* Left - identical region selection flow */}
            <div className="border-r border-gray-200 h-full p-0 flex flex-col">
              {/* Left column: tabs header */}
              <div className="p-4 border-b border-gray-200 flex-shrink-0">
                <div className="flex gap-2">
                  <button
                    className={`flex-1 py-2 rounded-md border text-sm ${
                      viewMode === "map" ? "bg-primary text-white" : "bg-white"
                    }`}
                    onClick={() => setViewMode("map")}
                  >
                    지도보기
                  </button>
                  <button
                    className={`flex-1 py-2 rounded-md border text-sm ${
                      viewMode === "list" ? "bg-primary text-white" : "bg-white"
                    }`}
                    onClick={() => setViewMode("list")}
                  >
                    목록보기
                  </button>
                </div>
              </div>

              {/* Left column: fixed map area with height constraints */}
              <div className="p-4 flex-shrink-0">
                {viewMode === "map" ? (
                  !selectedSido ? (
                    <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
                      <div className="w-full h-[40vh] max-h-[320px]">
                        <InteractiveSvgMap
                          svgPath="/maps_all/korea-sido.svg"
                          onRegionClick={(region) => {
                            const sido = SLUG_TO_SIDO[region] || region;
                            if (SIDO_SVG_MAP[sido]) {
                              setSelectedSido(sido);
                              setSelectedSigungu(null);
                            }
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <button
                        className="mb-3 text-sm px-3 py-1.5 rounded bg-gray-200 hover:bg-gray-300 transition font-medium"
                        onClick={() => {
                          setSelectedSido(null);
                          setSelectedSigungu(null);
                          setMemberList([]);
                        }}
                      >
                        ◀ 전국 지도로 돌아가기
                      </button>
                      <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
                        <div className="w-full h-[40vh] max-h-[320px]">
                          <InteractiveSvgMap
                            svgPath={
                              SIDO_SVG_MAP[selectedSido] ||
                              SIDO_SVG_MAP["서울특별시"]
                            }
                            highlightId={selectedSigungu || undefined}
                            onRegionClick={(region) => {
                              setSelectedSigungu(region);
                              onSearch(selectedSido, region);
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )
                ) : (
                  <div className="max-h-[320px] h-[40vh] overflow-hidden">
                    <RegionSelector
                      onRegionSelect={(sido, sigungu) => {
                        setSelectedSido(sido);
                        setSelectedSigungu(sigungu);
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Left column: footer with search input/button */}
              <div className="border-t border-gray-200 bg-white p-4 flex-shrink-0 box-border">
                <div className="flex items-center gap-3 w-full">
                  <input
                    type="text"
                    placeholder="회원 이름 검색"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    className="flex-1 min-w-0 px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    className="shrink-0 px-4 py-2 bg-primary text-white rounded-md"
                    onClick={() => onSearch(selectedSido, selectedSigungu)}
                  >
                    검색
                  </button>
                </div>
              </div>
            </div>

            {/* Right - member list with selection */}
            <div className="h-full flex flex-col">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  {selectedSido && selectedSigungu ? (
                    <span>
                      지역:{" "}
                      <span className="font-semibold text-gray-900">
                        {selectedSido} {selectedSigungu}
                      </span>
                    </span>
                  ) : (
                    <span className="text-gray-500">지역을 선택하세요.</span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    className={`px-3 py-1 rounded ${
                      memberType === "partners"
                        ? "bg-primary text-white"
                        : "bg-gray-100"
                    }`}
                    onClick={() => setMemberType("partners")}
                  >
                    파트너스회원
                  </button>
                  <button
                    className={`px-3 py-1 rounded ${
                      memberType === "premium"
                        ? "bg-primary text-white"
                        : "bg-gray-100"
                    }`}
                    onClick={() => setMemberType("premium")}
                  >
                    프리미엄회원
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-auto">
                <MemberList
                  members={memberList}
                  onSelect={(m) => {
                    const shop: ShopItem = {
                      shopId: m.id ?? m.shopId ?? undefined,
                      shopName: m.name ?? m.shopName ?? "",
                      region: `${selectedSido ?? ""} ${
                        selectedSigungu ?? ""
                      }`.trim(),
                      phone: m.phone ?? m.tel ?? m.mobile ?? undefined,
                    };
                    onSelectMember(shop);
                    onClose();
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

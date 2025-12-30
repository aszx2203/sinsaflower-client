import { UseFormRegister, UseFormWatch, UseFormSetValue } from "react-hook-form";
import React, { useState } from "react";
import { OrderFormValue } from "../../types/orderFormValue";
import Modal from "@/shared/components/ui/Modal";
import PostCode from "react-daum-postcode";

interface Props {
  register: UseFormRegister<OrderFormValue>;
  watch: UseFormWatch<OrderFormValue>;
  setValue?: UseFormSetValue<OrderFormValue>;
  disabled?: boolean;
}

export default function DeliveryFields({
  register,
  watch,
  setValue,
  disabled = false,
}: Props) {
  const HOURS = Array.from({ length: 16 }, (_, i) => i + 8); // 8 ~ 23
  const MINUTES = [0, 10, 20, 30, 40, 50];
  const deliveryHours = watch("deliveryHours");
  const needDetail = deliveryHours && deliveryHours !== "default";

  // 지역별 필독 사항 토글 및 선택 상태
  const [showRegionNotes, setShowRegionNotes] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [isOpenPlaceSearch, setIsOpenPlaceSearch] = useState(false);

  const REGIONS: string[] = [
    "근조지정",
    "서울",
    "경기",
    "인천",
    "부산",
    "대구",
    "울산",
    "대전",
    "세종",
    "제주",
    "강원",
    "경남",
    "경북",
    "전남",
    "전북",
    "충남",
    "충북",
    "성당",
  ];

  // 안내문 매핑 (초기 예시 문구, 실제 운영 문구로 교체 가능)
  const REGION_NOTES: Record<string, string> = {
    근조지정:
      "근조 지정 문구 및 리본 색상/문구 기준을 확인해 주세요.",
    서울: "서울 지역 특이사항 및 주요 행사장 반입 규정 안내.",
    경기: "경기 지역 배송 가능 시간대 및 추가 비용 안내.",
    인천: "인천 지역 섬지역/공항 인근 배송 유의사항.",
    부산:
      "부산 지역 일부 호텔/예식장 예약 필수, 당일 건 제한 등 유의.",
    대구: "대구 지역 행사장 반입 시간대 및 주차 유의사항.",
    울산: "울산 지역 산업단지 인근 배송 접근성 안내.",
    대전: "대전 지역 예식장 반입 동선 및 시간 확인.",
    세종: "세종 지역 신규 행사장 안내 및 주소 확인 권장.",
    제주: "제주 지역 항공/선편 일정에 따른 배송 제약.",
    강원: "강원 산간 지역 추가 소요시간 및 비용 안내.",
    경남: "경남 지역 일부 권역 당일 건 제한.",
    경북: "경북 지역 권역별 반입 규정 요약.",
    전남: "전남 지역 도서/벽지 배송 유의사항.",
    전북: "전북 지역 주요 행사장 접근 동선 확인.",
    충남: "충남 지역 공휴일/야간 반입 제한 안내.",
    충북: "충북 지역 시/군별 반입 가능 시간 상이.",
    성당: "성당 행사 리본 문구 및 진입 동선 사전 확인.",
  };

  type DaumPostcodeData = {
    address: string;
    addressType: "R" | "J";
    bname?: string;
    buildingName?: string;
    roadAddress?: string;
    jibunAddress?: string;
  };

  return (
    <>
      {/* 배송사진 비공개 */}
      <tr>
        <th>배송사진 비공개</th>
        <td colSpan={3}>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              {...register("hideDeliveryPhoto")}
              disabled={disabled}
            />
            비공개
          </label>
        </td>
      </tr>

      {/* 주문고객/받는고객 */}
      <tr>
        <th>주문고객명</th>
        <td>
          <input
            {...register("orderCustomerName")}
            className="border p-0.5 text-xs w-full"
            disabled={disabled}
          />
        </td>
        <th>
          받는고객명 <span className="text-red-500">*</span>
        </th>
        <td>
          <input
            {...register("receiverName", { required: true })}
            className="border p-0.5 text-xs w-full"
            disabled={disabled}
          />
        </td>
      </tr>

      {/* 전화번호 */}
      <tr>
        <th>주문고객전화</th>
        <td>
          <input
            {...register("orderCustomerPhone")}
            className="border p-0.5 text-xs w-full"
            disabled={disabled}
          />
        </td>
        <th>
          받는고객전화 <span className="text-red-500">*</span>
        </th>
        <td>
          <input
            {...register("receiverPhone", { required: true })}
            className="border p-0.5 text-xs w-full"
            disabled={disabled}
          />
        </td>
      </tr>

      {/* 핸드폰 */}
      <tr>
        <th>주문고객핸드폰</th>
        <td>
          <input
            {...register("orderCustomerMobile")}
            className="border p-0.5 text-xs w-full"
            disabled={disabled}
          />
        </td>
        <th>
          받는고객핸드폰 <span className="text-red-500">*</span>
        </th>
        <td>
          <input
            {...register("receiverMobile", { required: true })}
            className="border p-0.5 text-xs w-full"
            disabled={disabled}
          />
        </td>
      </tr>

      {/* 배달일시 */}
      <tr>
        <th>배달일시{!disabled && <span className="sf-req">*</span>}</th>
        <td colSpan={3}>
          <input
            type="date"
            {...register("deliveryDate", { required: true })}
            className="border p-0.5 text-xs"
            disabled={disabled}
          />
          <select
            {...register("deliveryHours")}
            className="border p-0.5 text-xs ml-2"
            disabled={disabled}
          >
            <option value="default">기본시간</option>
            {HOURS.map((h) => (
              <option key={h} value={String(h)}>
                {h}시
              </option>
            ))}
          </select>

          {/* 기본시간이 아닌 경우: 디테일 영역 */}
          {needDetail && (
            <div className="inline-flex items-center gap-2 ml-2">
              <select
                {...register("deliveryMinutes", {
                  required: needDetail,
                  valueAsNumber: true,
                })}
                className="border p-0.5 text-xs"
                defaultValue={0}
                disabled={disabled}
              >
                {MINUTES.map((m) => (
                  <option key={m} value={m}>
                    {String(m).padStart(2, "0")}분
                  </option>
                ))}
              </select>
              <select
                {...register("deliveryType")}
                className="border p-0.5"
                disabled={disabled}
              >
                <option value="까지">까지</option>
                <option value="예식">예식</option>
                <option value="행사">행사</option>
              </select>

              <span className="ml-2">행사시간:</span>
              <select
                {...register("eventHours", { valueAsNumber: true })}
                className="border p-0.5 text-xs"
                defaultValue={0}
                disabled={disabled}
              >
                {HOURS.map((h) => (
                  <option key={h} value={h}>
                    {h}시
                  </option>
                ))}
              </select>
              <select
                {...register("eventMinutes", { valueAsNumber: true })}
                className="border p-0.5 text-xs"
                defaultValue={0}
                disabled={disabled}
              >
                {MINUTES.map((m) => (
                  <option key={m} value={m}>
                    {m}분
                  </option>
                ))}
              </select>
            </div>
          )}
        </td>
      </tr>

      {/* 배달장소 */}
      <tr>
        <th>
          <div className="flex items-center gap-2">
            <span>
              배달장소{!disabled && <span className="sf-req">*</span>}
            </span>
            {!disabled && (
              <button
                type="button"
                className="sf-btn-img--md"
                onClick={() => setShowRegionNotes((v) => !v)}
              >
                필독사항
              </button>
            )}
          </div>
        </th>
        <td colSpan={3}>
          <div className="flex gap-2">
            <input
              {...register("deliveryPlace", { required: true })}
              className="border p-0.5 text-xs w-1/2"
              disabled={disabled}
            />
            {!disabled && (
              <button
                type="button"
                className="sf-btn-img--md"
                onClick={() => setIsOpenPlaceSearch(true)}
              >
                행사장 검색
              </button>
            )}
          </div>
        </td>
      </tr>

      {/* 지역별 필독 사항 */}
      {showRegionNotes && (
        <tr>
          <th>지역별 필독 사항</th>
          <td colSpan={3}>
            <div className="border border-gray-300 rounded-md p-2 mb-3">
              <div className="flex flex-wrap gap-1">
              {REGIONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  className={`${
                    selectedRegion === r
                      ? "bg-primary/10 border-primary text-primary"
                      : "bg-white hover:bg-gray-50 border-gray-300 text-gray-800"
                  } border rounded-sm px-2 py-0.5 text-[11px]`}
                  onClick={() => !disabled && setSelectedRegion(r)}
                  disabled={disabled}
                >
                  {r}
                </button>
              ))}
              </div>
            </div>
            <div className="border p-3 text-sm whitespace-pre-line">
              {selectedRegion
                ? REGION_NOTES[selectedRegion]
                : "지역 버튼을 눌러 안내문을 확인하세요."}
            </div>
          </td>
        </tr>
      )}

      {/* 행사장 주소 검색 모달 */}
      {isOpenPlaceSearch && (
        <Modal
          isOpen={isOpenPlaceSearch}
          title="행사장 검색"
          hasFooter={false}
          onCancel={() => setIsOpenPlaceSearch(false)}
          size="md"
        >
          <PostCode
            onComplete={(data: DaumPostcodeData) => {
              const {
                address,
                addressType,
                bname,
                buildingName,
                roadAddress,
                jibunAddress,
              } = data;
              const base = address || roadAddress || jibunAddress || "";
              let extra = "";
              if (addressType === "R") {
                if (bname) extra += bname;
                if (buildingName) extra += extra ? `, ${buildingName}` : buildingName;
              }
              const full = extra ? `${base} (${extra})` : base;
              if (setValue) {
                setValue("deliveryPlace", full, { shouldValidate: true });
              }
              setIsOpenPlaceSearch(false);
            }}
            className="border"
          />
        </Modal>
      )}
    </>
  );
}

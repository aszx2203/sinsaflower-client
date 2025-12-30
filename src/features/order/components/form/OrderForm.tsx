"use client";

import { useForm } from "react-hook-form";
import { useState, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import BasicInfoFields from "../fields/BasicInfoFields";
import ProductFields from "../fields/ProductFields";
import DeliveryFields from "../fields/DeliveryFields";
import MessageFields from "../fields/MessageFields";
import AdditionalInfoFields from "../fields/AdditionalInfoFields";
import { OrderFormValue } from "../../types/orderFormValue";
import MemberSearchModal from "@/features/members/components/MemberSearchModal";
import { clientRequest } from "@/shared/lib/http/client";

interface OrderFormProps {
  mode?: "create" | "view";
  initialData?: Partial<OrderFormValue>;
  orderNumber?: string;
  focusSection?: "consignee" | "top";
}

function toOrderCreateRequest(form: OrderFormValue) {
  return {
    orderType: form.orderType,

    // 상점
    shopName: form.shopName,
    phone: form.phone,

    // 상품
    productName: form.productName,
    productDetail: form.productDetail,
    quantity: form.quantity,
    originPrice: form.originPrice,
    price: form.price,
    payment: form.payment,

    // ⭐ 주문자 (필수)
    orderCustomerName: form.orderCustomerName,
    orderCustomerPhone: form.orderCustomerPhone,
    orderCustomerMobile: form.orderCustomerMobile,

    // ⭐ 수령자 (필수)
    receiverName: form.receiverName,
    receiverPhone: form.receiverPhone,
    receiverMobile: form.receiverMobile,

    // 배송
    deliveryDate: form.deliveryDate,
    deliveryHours: form.deliveryHours,
    deliveryMinutes: form.deliveryMinutes,
    deliveryType: form.deliveryType,
    deliveryPlace: form.deliveryPlace,

    // 기타
    card: form.card,
    request: form.request,
    hideDeliveryPhoto: form.hideDeliveryPhoto,

    // 옵션
    options: Object.entries(form.options || {})
      .filter(([_, v]) => v.checked)
      .map(([name, v]) => ({
        optionName: name,
        checked: v.checked,
        price: v.price,
      })),

    // 메시지
    messages: (form.messages || [])
      .filter((m) => m?.text)
      .map((m, idx) => ({
        text: m.text,
        sortOrder: idx,
      })),

    // 발송자
    senders: (form.senderList || [])
      .filter((s) => s?.name)
      .map((s, idx) => ({
        name: s.name,
        phone: s.phone,
        sortOrder: idx,
        isMain: idx === 0,
      })),
  };
}

const OrderForm = ({
  mode = "create",
  initialData,
  orderNumber,
  focusSection,
}: OrderFormProps) => {
  const isViewMode = mode === "view";
  const consigneeRowRef = useState<HTMLTableRowElement | null>(null)[0] as unknown as React.MutableRefObject<HTMLTableRowElement | null>;

  const { register, handleSubmit, setValue, watch, control, getValues } =
    useForm<OrderFormValue>({
      defaultValues: {
        orderType: "",
        autoSido: "",
        autoSigungu: "",
        originPrice: 0,
        price: 0,
        payment: 0,
        quantity: 1,
        senderList: [{}],
        messages: [{}],
        ...initialData,
      },
    });

  const [isMemberSearchOpen, setIsMemberSearchOpen] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    const floristId = searchParams.get("floristId");
    const shopName = searchParams.get("shopName");
    const phone = searchParams.get("phone");
    const region = searchParams.get("region");
    const orderTypeParam = searchParams.get("orderType");
    if (floristId || shopName || phone || region) {
      setValue("receiverShopId", floristId ?? "");
      setValue("shopName", shopName ?? "");
      setValue("phone", phone ?? "");
      setValue("region", region ?? "");
      // If coming from member selection, default to '회원 선택 발주'
      if (orderTypeParam === "member" || floristId || shopName) {
        setValue("orderType", "member");
        // Clear auto-assignment fields when selecting member flow
        setValue("autoSido", "");
        setValue("autoSigungu", "");
      }
    }
  }, [searchParams, setValue]);

  async function createOrder(payload: OrderFormValue) {
    return clientRequest({
      url: "/api/orders",
      method: "POST",
      data: payload,
    });
  }

  const handleSelectMember = useCallback(
    (shop: {
      shopId?: string;
      shopName: string;
      region: string;
      phone?: string;
    }) => {
      setValue("receiverShopId", shop.shopId ?? "");
      setValue("region", shop.region ?? "");
      setValue("shopName", shop.shopName ?? "");
      setValue("phone", shop.phone ?? "");
      setIsMemberSearchOpen(false);
    },
    [setValue]
  );

  const onSubmit = (data: OrderFormValue) => {
    if (isViewMode) return;
    console.log("폼 제출:", data);
    const payload = toOrderCreateRequest(data);
    createOrder(payload)
      .then((response) => {
        alert("주문이 성공적으로 생성되었습니다.");
        // 추가 처리 로직 (예: 리다이렉트)
      })
      .catch((error) => {
        alert("주문 생성 중 오류가 발생했습니다.");
        console.error("주문 생성 오류:", error);
      });
  };

  useEffect(() => {
    if (!isViewMode) return;
    if (focusSection === "consignee") {
      // 스크롤이 가능하도록 약간 지연 후 실행
      setTimeout(() => {
        const el = consigneeRowRef?.current || document.getElementById("consignee-anchor");
        el?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    }
  }, [focusSection, isViewMode]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {isViewMode && (
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-800">주문정보</h2>
          {orderNumber && (
            <p className="text-sm text-gray-600 mt-1">
              주문번호: {orderNumber}
            </p>
          )}
        </div>
      )}

      <table className={`sf-table sf-table--form ${isViewMode ? "text-[11px]" : ""}`}>
        <tbody>
          <BasicInfoFields
            register={register}
            watch={watch}
            setValue={setValue}
            disabled={isViewMode}
            onOpenMemberSearch={() => setIsMemberSearchOpen(true)}
          />
          <ProductFields
            register={register}
            setValue={setValue}
            watch={watch}
            control={control}
            disabled={isViewMode}
          />
          <DeliveryFields
            register={register}
            watch={watch}
            setValue={setValue}
            disabled={isViewMode}
          />
          <MessageFields
            register={register}
            control={control}
            setValue={setValue}
            getValues={getValues}
            disabled={isViewMode}
          />
          {/* focus용 앵커 */}
          {isViewMode && (
            <tr>
              <td colSpan={4}><div id="consignee-anchor" /></td>
            </tr>
          )}

          <AdditionalInfoFields
            register={register}
            control={control}
            disabled={isViewMode}
            consigneeRef={consigneeRowRef}
          />
        </tbody>
      </table>

      {!isViewMode && (
        <div className="w-full m-auto flex gap-3 text-sm justify-center my-6">
          <button type="submit" className="sf-btn sf-btn--primary sf-btn--md">
            발주하기
          </button>
          <button
            type="button"
            className="sf-btn sf-btn--secondary sf-btn--md"
            onClick={() => alert("미리보기")}
          >
            미리보기
          </button>
        </div>
      )}

      {isMemberSearchOpen && (
        <MemberSearchModal
          open={isMemberSearchOpen}
          onClose={() => setIsMemberSearchOpen(false)}
          onSelectMember={handleSelectMember}
        />
      )}
    </form>
  );
};

export default OrderForm;

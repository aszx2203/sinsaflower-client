"use client";

import { useEffect, useState } from "react";
import Modal from "@/shared/components/ui/Modal";

type IncomingOrder = {
  orderNumber: string;
  region: string;
  deliveryDate: string;
  productType: string;
  basePrice: number;
  notes: string;
};

export default function HeaderWaitIndicator() {
  const [isWaiting, setIsWaiting] = useState(false);
  const [order, setOrder] = useState<IncomingOrder | null>(null);
  const [showPopup, setShowPopup] = useState(false);

  const formatCurrency = (n: number) => new Intl.NumberFormat("ko-KR").format(n ?? 0);

  useEffect(() => {
    const onWaitStart = () => setIsWaiting(true);
    const onWaitCancel = () => setIsWaiting(false);
    const onOrderArrived = (e: Event) => {
      const ce = e as CustomEvent<IncomingOrder>;
      setIsWaiting(false);
      setOrder(ce.detail || null);
      setShowPopup(true);
    };
    const onOrderClear = () => setOrder(null);

    window.addEventListener("sf_wait_start", onWaitStart as EventListener);
    window.addEventListener("sf_wait_cancel", onWaitCancel as EventListener);
    window.addEventListener("sf_order_arrived", onOrderArrived as EventListener);
    window.addEventListener("sf_order_clear", onOrderClear as EventListener);

    return () => {
      window.removeEventListener("sf_wait_start", onWaitStart as EventListener);
      window.removeEventListener("sf_wait_cancel", onWaitCancel as EventListener);
      window.removeEventListener("sf_order_arrived", onOrderArrived as EventListener);
      window.removeEventListener("sf_order_clear", onOrderClear as EventListener);
    };
  }, []);

  const accept = () => {
    if (order) {
      window.dispatchEvent(new CustomEvent("sf_order_accept", { detail: order }));
    }
    window.dispatchEvent(new CustomEvent("sf_order_clear"));
    setShowPopup(false);
  };
  const reject = () => {
    if (order) {
      window.dispatchEvent(new CustomEvent("sf_order_reject", { detail: order }));
    }
    window.dispatchEvent(new CustomEvent("sf_order_clear"));
    setShowPopup(false);
  };

  if (!isWaiting && !order) return null;

  return (
    <div className="ml-4 flex items-center gap-3">
      {isWaiting && !order ? (
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200">
          <span className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent" />
          <span className="text-xs text-blue-700">주문 실시간 대기 중</span>
          <button
            className="text-xs px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
            onClick={() => window.dispatchEvent(new CustomEvent("sf_wait_cancel"))}
          >
            대기 취소
          </button>
        </div>
      ) : null}

      {/* 주문 도착 팝업 */}
      <Modal
        isOpen={!!order && showPopup}
        title="자동 배정 주문 도착"
        hasFooter={false}
        size="lg"
        onCancel={() => setShowPopup(false)}
      >
        {order && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="text-gray-500">주문번호</div>
              <div className="col-span-2 font-medium">#{order.orderNumber}</div>
              <div className="text-gray-500">지역</div>
              <div className="col-span-2">{order.region}</div>
              <div className="text-gray-500">배달일</div>
              <div className="col-span-2">{order.deliveryDate}</div>
              <div className="text-gray-500">상품</div>
              <div className="col-span-2">{order.productType}</div>
              <div className="text-gray-500">금액</div>
              <div className="col-span-2">₩ {formatCurrency(order.basePrice)}</div>
              <div className="text-gray-500">메모</div>
              <div className="col-span-2 whitespace-pre-wrap text-gray-700">{order.notes || "-"}</div>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                className="px-4 py-2 rounded-md bg-primary text-white hover:bg-primary/90"
                onClick={accept}
              >
                승락
              </button>
              <button
                className="px-4 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300"
                onClick={reject}
              >
                거절
              </button>
              <button
                className="px-4 py-2 rounded-md bg-white border border-gray-300 hover:bg-gray-50"
                onClick={() => setShowPopup(false)}
              >
                닫기
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

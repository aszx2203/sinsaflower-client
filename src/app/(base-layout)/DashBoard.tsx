"use client";
import React, { useState, useEffect, useMemo } from "react";
// import { useRouter } from "next/navigation";
import { useAuth } from "@/shared/context/auth.context";

const PRODUCT_KEYS = [
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
] as const;
type ProductKey = typeof PRODUCT_KEYS[number];

const Dashboard = () => {
  const { dashboardInfo, refreshDashboardInfo, isAuthenticated } =
    useAuth();

  // router not used in this view currently
  const [loading] = useState(false);
  const [error] = useState("");
  const defaultDisabledProducts = useMemo<Record<ProductKey, boolean>>(
    () =>
      PRODUCT_KEYS.reduce(
        (acc, k) => {
          acc[k] = false;
          return acc;
        },
        {} as Record<ProductKey, boolean>
      ),
    []
  );

  const [disabledProducts, setDisabledProducts] = useState<Record<ProductKey, boolean>>(defaultDisabledProducts);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const [waitTimer, setWaitTimer] = useState<null | number>(null);

  useEffect(() => {
    if (isAuthenticated) {
      refreshDashboardInfo();
    }
  }, [isAuthenticated, refreshDashboardInfo]);

  // Load previously saved 미취급상품 설정 from localStorage
  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem("sf_unhandled_products") : null;
      if (raw) {
        const parsed = JSON.parse(raw);
        const next: Record<ProductKey, boolean> = { ...defaultDisabledProducts };
        PRODUCT_KEYS.forEach((k) => {
          if (typeof parsed?.[k] === "boolean") next[k] = parsed[k];
        });
        setDisabledProducts(next);
      }
    } catch {}
  }, [defaultDisabledProducts]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("ko-KR").format(amount);
  };

  // order click is handled elsewhere; removed unused handler

  const handleSaveUnhandledProducts = () => {
    setSaveStatus("saving");
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("sf_unhandled_products", JSON.stringify(disabledProducts));
      }
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch {
      setSaveStatus("error");
    }
  };

  // 주문 실시간 대기 시작
  const startWaitingForOrder = () => {
    // 열기 + 더미 도착 타이머 시작 (상단 헤더 인디케이터에 표시)
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("sf_wait_start"));
    }
    // 5초 후 더미 주문 도착
    const tid = window.setTimeout(() => {
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("sf_order_arrived", {
            detail: {
              orderNumber: `SF-${Date.now().toString().slice(-6)}`,
              region: "서울특별시 강남구",
              deliveryDate: new Date().toLocaleDateString(),
              productType: "근조",
              basePrice: 70000,
              notes: "근조3단, 리본 문구 요청: 故인 의 명복을 빕니다",
            },
          })
        );
      }
    }, 5000);
    setWaitTimer(tid);
  };

  // 대기 취소
  // 헤더에서 대기 취소 이벤트를 받으면 타이머 정리
  useEffect(() => {
    const onCancel = () => {
      if (waitTimer) {
        window.clearTimeout(waitTimer);
        setWaitTimer(null);
      }
    };
    window.addEventListener("sf_wait_cancel", onCancel as EventListener);
    return () => {
      window.removeEventListener("sf_wait_cancel", onCancel as EventListener);
    };
  }, [waitTimer]);

  if (loading) {
    return (
      <div className="min-h-64 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">대시보드를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl shadow-sm">
          {error}
        </div>
      )}

      {/* Banner (static content; inline waiting moved to header) */}
      <div className="sf-card bg-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              상담/가입/정산 문의
            </h3>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary mb-1">
              1670-5800
            </div>
          </div>
        </div>
        <div className="bg-white/60 h-32 flex items-center justify-center rounded-2xl border border-white/40">
          <div className="text-center">
            <div className="text-4xl mb-2">🎉</div>
            <p className="text-gray-600 font-medium">신규 회원 특별 혜택</p>
            <p className="text-sm text-gray-500">
              지금 가입하고 다양한 혜택을 받아보세요
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* 주문 실시간 대기 */}
        <div className="sf-card hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-800">대기</div>
              <div className="text-sm text-gray-500">상태</div>
            </div>
          </div>
          <h3 className="font-semibold text-gray-800 mb-2">주문 실시간 대기</h3>
          <button
            onClick={startWaitingForOrder}
            className="inline-flex items-center bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            주문 실시간 대기
          </button>
        </div>
        {/* 미확인 수주 */}
        <div className="sf-card hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center">
              <svg
                className="w-6 h-6 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-800">
                {dashboardInfo.unconfirmedOrders || 0}
              </div>
              <div className="text-sm text-gray-500">건</div>
            </div>
          </div>
          <h3 className="font-semibold text-gray-800 mb-2">미확인 수주</h3>
          <a
            href="/all-received-orders"
            className="inline-flex items-center bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            확인하기
            <svg
              className="w-4 h-4 ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </a>
        </div>

        {/* 당월 총 발주 금액 */}
        <div className="sf-card hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center">
              <svg
                className="w-6 h-6 text-orange-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-800">
                {/* 당월 발주 금액 총합 */}
                {`₩ ${formatCurrency(
                  (dashboardInfo.monthlyPurchaseTotal ??
                    dashboardInfo.totalPurchases ??
                    0) as number
                )}`}
              </div>
              <div className="text-sm text-gray-500">원</div>
            </div>
          </div>
          <h3 className="font-semibold text-gray-800 mb-2">당월 총 발주 금액</h3>
          <a
            href="/all-received-orders"
            className="inline-flex items-center bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            확인하기
            <svg
              className="w-4 h-4 ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </a>
        </div>

        {/* 당월 총 수주 금액 */}
        <div className="sf-card hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
              <svg
                className="w-6 h-6 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                />
              </svg>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-800">
                {`₩ ${formatCurrency(
                  (dashboardInfo.monthlySalesTotal ??
                    dashboardInfo.totalSales ??
                    0) as number
                )}`}
              </div>
              <div className="text-sm text-gray-500">원</div>
            </div>
          </div>
          <h3 className="font-semibold text-gray-800 mb-2">당월 총 수주 금액</h3>
          <a
            href="/settlement-detail"
            className="inline-flex items-center bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            정산보기
            <svg
              className="w-4 h-4 ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </a>
        </div>
      </div>

      

      {/* Settings */}
      <div className="sf-card">
        <h3 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-6">
          설정 관리
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          {/* 부재중 설정 */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-2xl border border-blue-100">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mr-3">
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-800">부재중 설정</h4>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    시작일
                  </label>
                  <input
                    type="date"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    종료일
                  </label>
                  <input
                    type="date"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 rounded-xl text-sm font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg">
                  설정
                </button>
                <button className="flex-1 bg-gray-200 text-gray-600 py-2 rounded-xl text-sm font-medium hover:bg-gray-300 transition-all duration-200">
                  해제
                </button>
              </div>
            </div>
          </div>

          {/* 미취급상품 설정 */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-5 rounded-2xl border border-purple-100">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mr-3">
                <svg
                  className="w-5 h-5 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-800">미취급상품 설정</h4>
            </div>
            <div className="text-sm">
              <div className="flex items-center bg-white/60 border border-purple-100 rounded-xl p-2">
                <div className="w-10 md:w-12 text-gray-700 font-medium mr-2">상품</div>
                <div className="flex flex-wrap gap-x-2 gap-y-1 leading-tight">
                  {PRODUCT_KEYS.map((label) => (
                    <label key={label} className="flex items-center px-1 py-0.5 rounded hover:bg-white/70 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!disabledProducts[label]}
                        onChange={(e) =>
                          setDisabledProducts((prev) => ({ ...prev, [label]: e.target.checked }))
                        }
                        className="mr-1 h-4 w-4 text-purple-600 rounded focus:ring-purple-500"
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={handleSaveUnhandledProducts}
                className="px-4 py-2 rounded-xl bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 transition shadow"
              >
                {saveStatus === "saving" ? "저장 중..." : "저장"}
              </button>
              {saveStatus === "saved" && (
                <span className="text-xs text-gray-600">저장됨</span>
              )}
              {saveStatus === "error" && (
                <span className="text-xs text-red-600">저장 실패</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

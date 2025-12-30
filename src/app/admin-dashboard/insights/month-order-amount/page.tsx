"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export default function MonthOrderAmountInsight() {
  const router = useRouter();

  const summary = useMemo(() => ({ total: 12400000, count: 142 }), []);

  const topShops = useMemo(
    () => [
      { name: "채플꽃화1", amount: 1200000 },
      { name: "앨로플라워", amount: 980000 },
      { name: "루비플라워", amount: 870000 },
    ],
    []
  );

  const formatWon = (n: number) =>
    new Intl.NumberFormat("ko-KR").format(n) + "원";

  // 금액 정렬 (기본: 내림차순)
  const [amountSortDir, setAmountSortDir] = useState<"asc" | "desc">("desc");
  const sortedTopShops = useMemo(() => {
    const dir = amountSortDir === "asc" ? 1 : -1;
    return [...topShops].sort((a, b) => (a.amount - b.amount) * dir);
  }, [topShops, amountSortDir]);

  const SortButtons = ({
    active,
    dir,
    onAsc,
    onDesc,
  }: {
    active: boolean;
    dir: "asc" | "desc";
    onAsc: () => void;
    onDesc: () => void;
  }) => (
    <span className="inline-flex items-center ml-1 gap-0.5 align-middle">
      <button
        type="button"
        className={`leading-none text-[10px] px-1 py-0.5 rounded ${
          active && dir === "asc"
            ? "bg-gray-900 text-white"
            : "text-gray-500 hover:text-gray-700"
        }`}
        title="오름차순"
        onClick={() => setAmountSortDir("asc")}
      >
        ▲
      </button>
      <button
        type="button"
        className={`leading-none text-[10px] px-1 py-0.5 rounded ${
          active && dir === "desc"
            ? "bg-gray-900 text-white"
            : "text-gray-500 hover:text-gray-700"
        }`}
        title="내림차순"
        onClick={() => setAmountSortDir("desc")}
      >
        ▼
      </button>
    </span>
  );

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        이번 달 발주 금액
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        현 월 기준 발주 합계 및 상위 화원
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="rounded-xl bg-white shadow border p-5">
          <div className="text-sm text-gray-500">월간 합계</div>
          <div className="mt-2 text-3xl font-bold text-gray-900">
            {formatWon(summary.total)}
          </div>
        </div>
        <div className="rounded-xl bg-white shadow border p-5">
          <div className="text-sm text-gray-500">주문 건수</div>
          <div className="mt-2 text-3xl font-bold text-gray-900">
            {summary.count}건
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-white shadow border">
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">
            상위 발주 화원
          </h2>
          <div className="text-sm text-gray-600 select-none">
            <span className="inline-flex items-center">
              금액
              <SortButtons
                active={true}
                dir={amountSortDir}
                onAsc={() => setAmountSortDir("asc")}
                onDesc={() => setAmountSortDir("desc")}
              />
            </span>
          </div>
        </div>
        <ul className="divide-y">
          {sortedTopShops.map((s) => (
            <li
              key={s.name}
              className="flex items-center justify-between px-5 py-3"
            >
              <span className="text-gray-800">{s.name}</span>
              <span className="font-medium">{formatWon(s.amount)}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 flex gap-3">
        <button
          onClick={() =>
            router.push(
              "/admin-dashboard/orders?preset=this-month&kind=order&aggregate=amount"
            )
          }
          className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm shadow hover:bg-gray-700"
        >
          통합 주문 리스트로 이동
        </button>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 rounded-lg bg-white border text-sm shadow-sm hover:bg-gray-50"
        >
          대시보드로 돌아가기
        </button>
      </div>
    </div>
  );
}

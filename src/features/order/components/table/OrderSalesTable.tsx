"use client";

import TruncateText from "@/shared/components/ui/TruncateText";
import { OrderPurchaseValue } from "../../types/orderPurchaseValue";
import { OrderFilter } from "../../types/orderFilter";
import { useEffect, useState } from "react";
import { getOrders } from "../../services/order.service";
import { useOrderSearch } from "../../context/order-search.context";
import OrderNumberCell from "./OrderNumberCell";

const dummyData: OrderPurchaseValue[] = [
  //다 똑같은데 Response에 발주화원 필요함
  {
    orderNumber: "877915",
    orderType: "선택발주",
    orderDate: "25-07-22",
    orderTime: "18:43",
    deliveryDate: "25-07-31",
    deliveryTime: "기본시간",
    sender: "",
    receiver: "고인 OOO",
    corpAddress: "강원 속초시",
    corpName: "다경플라워",
    productName: "근조3단",
    deliveryAddress: "강원도 강릉시 사천면 방동길 38 (방동리,강릉아산병원)",
    originPrice: 0,
    payment: 200000,
    sms: "성공",
    fax: "거부",
    deliveryStatus: "배송완료",
    consignee: "최다경",
    isDelivery: true,
    onSite: false,
  },
];

export function OrderSalesTable() {
  const { filter, searchSignal } = useOrderSearch();
  const [orders, setOrders] = useState<OrderPurchaseValue[]>(dummyData);

  // 서비스 붙이고나서 주석풀기
  // useEffect(() => {
  //   async function fetchOrders() {
  //     const res = await getOrders(filter);
  //     setOrders(res);
  //   }
  //   fetchOrders();
  // }, [filter, searchSignal]); // 검색 버튼 눌릴 때마다 실행

  return (
    <div className="overflow-x-auto">
      <table className="sf-table sf-table--list">
        <thead>
          <tr>
            <th className="w-10">순번</th>
            <th className="w-24">주문번호</th>
            <th className="w-10">구분</th>
            <th className="w-64">
              주문접수일
              <br />
              배송요구일
            </th>
            <th className="w-40">발주화원</th>
            <th className="w-40">수주회원</th>
            <th className="w-64">
              상품명
              <br />
              배송지
            </th>
            <th className="w-24">
              원청액
              <br />
              결제액
            </th>
            <th className="w-20">
              문자
              <br />
              팩스
            </th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order, i) => (
            <tr key={order.orderNumber} className="text-center">
              {/* 순번 */}
              <td className="font-medium text-gray-600 ">{i + 1}</td>
              {/* 주문번호 */}
              <OrderNumberCell orderNumber={order.orderNumber} />
              {/* 구분 */}
              <td>
                <span className="inline-block px-2 py-1 bg-primary/10 text-primary font-medium rounded-md text-xs">
                  {order.orderType}
                </span>
              </td>
              {/* 주문접수일,배송요구일 */}
              <td className="text-left">
                <div className="text-gray-700 ">
                  {order.orderDate} {order.orderTime}
                </div>
                <div className="">
                  <span className="text-primary font-medium">
                    {order.deliveryDate}
                  </span>{" "}
                  <span className="text-danger font-medium">
                    {order.deliveryTime}
                  </span>
                </div>
              </td>
              {/* 발주화원 */}
              <td>
                <div className="text-gray-500 ">{order.corpAddress}</div>
                <div className="font-medium text-gray-700 ">
                  {order.corpName}
                </div>
              </td>
              {/* 수주회원 */}
              <td>
                <div className="text-gray-500 ">{order.corpAddress}</div>
                <div className="font-medium text-gray-700 ">
                  {order.corpName}
                </div>
              </td>
              {/* 상품명, 배송지 */}
              <td>
                <div className="font-bold text-gray-800 mb-1 ">
                  {order.productName}
                </div>
                <div className="text-gray-600 ">
                  <TruncateText text={order.deliveryAddress} />
                </div>
              </td>
              {/* 원청액, 결제액 */}
              <td className="text-right pr-2">
                <div className="text-gray-500 ">
                  {order.originPrice.toLocaleString()}
                </div>
                <div className="font-bold text-primary ">
                  {order.payment.toLocaleString()}
                </div>
              </td>
              {/* 팩스/전송 */}
              <td>
                <div
                  className={`font-medium  ${
                    order.sms === "성공" ? "text-success" : "text-danger"
                  }`}
                >
                  {order.sms}
                </div>
                <div
                  className={`font-medium  ${
                    order.fax === "성공" ? "text-success" : "text-danger"
                  }`}
                >
                  {order.fax}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

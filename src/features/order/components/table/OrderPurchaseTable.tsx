"use client";

import TruncateText from "@/shared/components/ui/TruncateText";
import OrderStatusTag from "../list/OrderStatusTag";
import Image from "next/image";
import { OrderPurchaseValue } from "../../types/orderPurchaseValue";
import { OrderFilter } from "../../types/orderFilter";
import { useEffect, useState } from "react";
import OrderDetailModal from "../OrderDetailModal";
import { getOrders } from "../../services/order.service";
import { useOrderSearch } from "../../context/order-search.context";
import OrderNumberCell from "./OrderNumberCell";

// const dummyData: OrderPurchaseValue[] = [
//   {
//     orderNumber: "8779154",
//     orderType: "직",
//     orderDate: "25-07-22",
//     orderTime: "18:43",
//     deliveryDate: "25-07-31",
//     deliveryTime: "기본시간",
//     sender: "",
//     receiver: "고인 OOO",
//     corpAddress: "강원 속초시",
//     corpName: "다경플라워",
//     productName: "근조3단",
//     deliveryAddress: "강원도 강릉시 사천면 방동길 38 (방동리,강릉아산병원)",
//     originPrice: 0,
//     payment: 200000,
//     sms: "성공",
//     fax: "거부",
//     deliveryStatus: "배송완료",
//     consignee: "최다경",
//     isDelivery: true,
//     onSite: false,
//   },
//   {
//     orderNumber: "877916",
//     orderType: "직",
//     orderDate: "25-07-22",
//     orderTime: "18:43",
//     deliveryDate: "25-07-31",
//     deliveryTime: "기본시간",
//     sender: "",
//     receiver: "고인 OOO",
//     corpAddress: "강원 속초시",
//     corpName: "다경플라워",
//     productName: "근조3단",
//     deliveryAddress: "강원도 강릉시 사천면 방동길 38 (방동리,강릉아산병원)",
//     originPrice: 0,
//     payment: 200000,
//     sms: "성공",
//     fax: "거부",
//     deliveryStatus: "배송준비",
//     consignee: "최다경",
//     isDelivery: true,
//     onSite: false,
//   },
//   {
//     orderNumber: "877917",
//     orderType: "직",
//     orderDate: "25-07-22",
//     orderTime: "18:43",
//     deliveryDate: "25-07-31",
//     deliveryTime: "기본시간",
//     sender: "",
//     receiver: "고인 OOO",
//     corpAddress: "강원 속초시",
//     corpName: "다경플라워",
//     productName: "근조3단",
//     deliveryAddress: "강원도 강릉시 사천면 방동길 38 (방동리,강릉아산병원)",
//     originPrice: 0,
//     payment: 200000,
//     sms: "성공",
//     fax: "거부",
//     deliveryStatus: "주문접수",
//     consignee: "최다경",
//     isDelivery: false,
//     onSite: true,
//   },
//   {
//     orderNumber: "877918",
//     orderType: "직",
//     orderDate: "25-07-22",
//     orderTime: "18:43",
//     deliveryDate: "25-07-31",
//     deliveryTime: "기본시간",
//     sender: "",
//     receiver: "고인 OOO",
//     corpAddress: "강원 속초시",
//     corpName: "다경플라워",
//     productName: "근조3단",
//     deliveryAddress: "강원도 강릉시 사천면 방동길 38 (방동리,강릉아산병원)",
//     originPrice: 0,
//     payment: 200000,
//     sms: "성공",
//     fax: "거부",
//     deliveryStatus: "미확인",
//     consignee: "최다경",
//     isDelivery: false,
//     onSite: false,
//   },
//   {
//     orderNumber: "877919",
//     orderType: "본",
//     orderDate: "25-07-22",
//     orderTime: "18:43",
//     deliveryDate: "25-07-31",
//     deliveryTime: "기본시간",
//     sender: "",
//     receiver: "고인 OOO",
//     corpAddress: "강원 속초시",
//     corpName: "다경플라워",
//     productName: "근조3단",
//     deliveryAddress: "강원도 강릉시 사천면 방동길 38 (방동리,강릉아산병원)",
//     originPrice: 0,
//     payment: 200000,
//     sms: "성공",
//     fax: "거부",
//     deliveryStatus: "배송완료",
//     consignee: "최다경",
//     isDelivery: true,
//     onSite: false,
//   },
//   {
//     orderNumber: "877920",
//     orderType: "본",
//     orderDate: "25-07-22",
//     orderTime: "18:43",
//     deliveryDate: "25-07-31",
//     deliveryTime: "기본시간",
//     sender: "",
//     receiver: "고인 OOO",
//     corpAddress: "강원 속초시",
//     corpName: "다경플라워",
//     productName: "근조3단",
//     deliveryAddress: "강원도 강릉시 사천면 방동길 38 (방동리,강릉아산병원)",
//     originPrice: 0,
//     payment: 200000,
//     sms: "성공",
//     fax: "거부",
//     deliveryStatus: "배송완료",
//     consignee: "최다경",
//     isDelivery: true,
//     onSite: false,
//   },
// ];

export function OrderPurchaseTable() {
  const { filter, searchSignal } = useOrderSearch();
// <<<<<<< phase/dev
//   const [orders, setOrders] = useState<OrderPurchaseValue[]>([]);
// =======
//   const [orders, setOrders] = useState<OrderPurchaseValue[]>(dummyData);
//   const [detailOrderNumber, setDetailOrderNumber] = useState<string | null>(null);
//   const [detailFocus, setDetailFocus] = useState<"consignee" | "top" | null>(null);
// >>>>>>> phase/dev

  // 서비스 붙이고나서 주석풀기
  useEffect(() => {
    async function fetchOrders() {
      const page = await getOrders(filter);
      setOrders(page.content ?? []);
    }
    fetchOrders();
  }, [filter, searchSignal]);

  return (
    <>
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
              <th className=" ">주문자</th>
              <th className="w-36">받는분</th>
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
              <th className="w-52">
                배송상태
                <br />
                인수자
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, i) => (
              <tr key={order.orderNumber} className="text-center">
                <td className="font-medium text-gray-600 text-sm">{i + 1}</td>
                <OrderNumberCell orderNumber={order.orderNumber} />
                <td>
                  <span className="inline-block px-2 py-1 bg-primary/10 text-primary font-medium rounded-md text-xs">
                    {order.orderType}
                  </span>
                </td>
                <td className="text-left">
                  <div className="text-gray-700 text-sm">
                    {order.orderDate} {order.orderTime}
                  </div>
                  <div className="text-sm">
                    <span className="text-primary font-medium">
                      {order.deliveryDate}
                    </span>{" "}
                    <span className="text-danger font-medium">
                      {order.deliveryTime}
                    </span>
                  </div>
                </td>
                <td className="text-gray-600 text-sm">{order.sender || "-"}</td>
                <td className="font-medium text-gray-800 text-sm">
                  {order.receiver}
                </td>
                <td>
                  <div className="text-gray-500 text-sm">
                    {order.corpAddress}
                  </div>
                  <div className="font-medium text-gray-700 text-sm">
                    {order.corpName}
                  </div>
                </td>
                <td>
                  <div className="font-bold text-gray-800 mb-1 text-sm">
                    {order.productName}
                  </div>
                  <div className="text-gray-600 text-sm">
                    <TruncateText text={order.deliveryAddress} />
                  </div>
                </td>
                <td className="text-right pr-2">
                  <div className="text-gray-500 text-sm">
                    {order.originPrice.toLocaleString()}
                  </div>
                  <div className="font-bold text-primary text-sm">
                    {order.payment.toLocaleString()}
                  </div>
                </td>
                <td>
                  <div
                    className={`font-medium text-sm ${
                      order.sms === "성공" ? "text-success" : "text-danger"
                    }`}
                  >
                    {order.sms}
                  </div>
                  <div
                    className={`font-medium text-sm ${
                      order.fax === "성공" ? "text-success" : "text-danger"
                    }`}
                  >
                    {order.fax}
                  </div>
                </td>
                <td>
                  <div className="mb-2">
                    <select
                      className={"w-full text-xs px-2 py-1 rounded border bg-gray-100 text-gray-600 cursor-not-allowed"}
                      disabled
                      defaultValue={order.deliveryStatus}
                      title="수주자만 변경 가능합니다"
                    >
                      <option value="미확인">미확인</option>
                      <option value="주문접수">주문접수</option>
                      <option value="배송준비">배송준비</option>
                      <option value="배송완료">배송완료</option>
                    </select>
                  </div>
                  <div className="flex gap-1 mb-1 items-center">
                    <span
                      className={`px-1 py-1 text-xs rounded font-medium transition-all duration-200 ${
                        order.isDelivery
                          ? "bg-green-500 text-white shadow-sm"
                          : "bg-gray-600 text-white shadow-sm"
                      }`}
                    >
                      배송
                    </span>
                    <span
                      className={`px-1 py-1 text-xs rounded font-medium transition-all duration-200 ${
                        order.onSite
                          ? "bg-green-500 text-white shadow-sm"
                          : "bg-gray-600 text-white shadow-sm"
                      }`}
                    >
                      현장
                    </span>
                    <button
                      className="text-gray-700 text-xs underline hover:text-primary"
                      onClick={() => { setDetailOrderNumber(order.orderNumber); setDetailFocus("consignee"); }}
                      title="주문정보 보기"
                    >
                      {order.consignee}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {detailOrderNumber && (
        <OrderDetailModal
          isOpen={true}
          orderNumber={detailOrderNumber}
          onClose={() => { setDetailOrderNumber(null); setDetailFocus(null); }}
          focusSection={detailFocus || undefined}
        />
      )}
    </>
  );
}

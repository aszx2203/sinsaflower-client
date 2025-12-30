import { clientRequest } from "@/shared/lib/http/client";
import { OrderFormValue } from "../types/orderFormValue";
import { OrderFilter } from "../types/orderFilter";
import { OrderPurchaseValue } from "../types/orderPurchaseValue";
type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

type PageResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
};
//발주
export async function createOrder(orderFormData: OrderFormValue) {
  const { productImage, ...rest } = orderFormData;

  const formData = new FormData();
  formData.append(
    "request",
    new Blob([JSON.stringify(rest)], { type: "application/json" })
  );
  if (productImage) formData.append("productImage", productImage);

  return clientRequest({
    url: "/api/orders/create",
    method: "POST",
    data: formData,
  });
}

//발주리스트 조회(월별)
export async function getMonthOrders(month: string) {
  return clientRequest({
    url: "/api/orders/purchase",
    method: "GET",
    params: { month },
  });
}

export async function getOrders(
  filter: OrderFilter
): Promise<PageResponse<OrderPurchaseValue>> {
  const res = await clientRequest({
    url: "/api/orders/purchase",
    method: "GET",
    params: { filter },
  });
  console.log("getOrders res:", res);

  // 🔥 여기서 data 한 번만 벗겨서 반환
  return {
    ...res.data,
    content: res.data.content.map(mapOrderPurchase), // 🔥 여기서 변환
  };
}

//발주리스트 요약
export async function getOrderSummary() {
  return clientRequest({
    url: "/api/orders/purchase/summary",
    method: "GET",
  });
}

export async function getOrderByNumber(
  orderNumber: string
): Promise<OrderFormValue> {
  // TODO: 실제 API 호출로 변경
  // 현재는 더미 데이터 반환
  const res = await clientRequest({
    url: "/api/orders/" + orderNumber,
    method: "GET",
  });
  console.log("getOrderByNumber res:", res);
  console.log("mapOrderResponseToForm res:", mapOrderResponseToForm(res.data));
  return mapOrderResponseToForm(res.data);

  // return {
  //   specialNote: "당일 배송 특이사항",
  //   region: "강원도",
  //   shopName: "춘천시 플라워뱅크1",
  //   phone: "010-1234-5678",
  //   productName: "근조31",
  //   productDetail: "근조3단",
  //   quantity: 1,
  //   originPrice: 0,
  //   price: 50000,
  //   payment: 50000,
  //   orderCustomerName: "",
  //   orderCustomerPhone: "",
  //   orderCustomerMobile: "",
  //   receiverName: "이지원",
  //   receiverPhone: "010-9876-5432",
  //   receiverMobile: "010-9876-5432",
  //   deliveryDate: "2025-08-09",
  //   deliveryHours: "default",
  //   deliveryMinutes: "0",
  //   deliveryType: "까지",
  //   eventHours: "12",
  //   eventMinutes: "18",
  //   deliveryPlace:
  //     "강원특별자치도 강릉시 강릉대로419번길 42 동인병원장례식장 3호실",
  //   messages: [{ text: "삼가 故人의 冥福을 빕니다" }],
  //   senderList: [{ name: "전국자치단체공무직본부 서울지역지부" }],
  //   options: {},
  //   card: "",
  //   request: "현장사진부탁합니다",
  //   hideDeliveryPhoto: true,
  //   productImage: new File([], ""),
  // };
}

export function mapOrderPurchase(api: any): OrderPurchaseValue {
  const { orderDate, orderTime } = splitCreatedAt(api.createdAt);
  return {
    orderNumber: api.orderNumber,
    orderType: api.orderType === "DIRECT" ? "직" : "본",

    orderDate,
    orderTime,

    deliveryDate: formatDate(api.deliveryDate),
    deliveryTime: formatDeliveryTime(api.deliveryTime, api.deliveryMinutes),

    sender: api.sender ?? "",
    receiver: api.receiver,

    corpAddress: api.corpAddress,
    corpName: api.corpName,

    productName: api.productName,
    deliveryAddress: api.deliveryAddress,

    originPrice: api.originPrice ?? 0,
    payment: api.payment ?? 0,

    sms: "성공", // 서버 미제공 → UI 고정
    fax: "거부",

    deliveryStatus: mapDeliveryStatus(api.deliveryStatus),
    consignee: api.consignee ?? "",

    isDelivery: Boolean(api.isDelivery),
    onSite: Boolean(api.onSite),
  };
}

function formatDate(date?: string): string {
  if (!date) return "";
  // 2025-07-22 → 25-07-22
  return date.slice(2);
}

function formatTime(time?: string): string {
  if (!time) return "";
  // 18:43:00 → 18:43
  return time.slice(0, 5);
}

function formatDeliveryTime(hours?: number | string, minutes?: number): string {
  const h = Number(hours ?? 0);
  const m = Number(minutes ?? 0);

  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function splitCreatedAt(createdAt?: string) {
  if (!createdAt) {
    return {
      orderDate: "",
      orderTime: "",
    };
  }

  const date = new Date(createdAt);

  const year = String(date.getFullYear()).slice(2); // 25
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");

  return {
    orderDate: `${year}-${month}-${day}`,
    orderTime: `${hour}:${minute}`,
  };
}

function mapDeliveryStatus(status?: string): string {
  switch (status) {
    case "DELIVERED":
      return "배송완료";
    case "READY":
      return "배송준비";
    case "RECEIVED":
      return "주문접수";
    default:
      return "미확인";
  }
}

export function mapOrderResponseToForm(data: any): OrderFormValue {
  return {
    orderType: data.orderType ?? "",
    region: data.regionName ?? "",
    shopName: data.shopName,
    phone: data.phone,

    productName: data.productName,
    productDetail: data.productDetail ?? "",
    quantity: data.quantity,
    originPrice: data.originPrice,
    price: data.price,
    payment: data.payment,

    orderCustomerName: data.orderCustomerName ?? "",
    orderCustomerPhone: data.orderCustomerPhone ?? "",
    orderCustomerMobile: data.orderCustomerMobile ?? "",

    receiverName: data.receiverName,
    receiverPhone: data.receiverPhone,
    receiverMobile: data.receiverMobile,

    deliveryDate: data.deliveryDate,
    deliveryHours: padTime(data.deliveryHours),
    deliveryMinutes: padTime(data.deliveryMinutes),

    deliveryType: data.deliveryType ?? "",
    eventHours: padTime(data.eventHours),
    eventMinutes: padTime(data.eventMinutes),

    deliveryPlace: data.deliveryPlace,
    card: data.card,
    request: data.request,
    hideDeliveryPhoto: data.hideDeliveryPhoto,

    messages: (data.messages ?? []).map((m: any) => ({
      text: m.text,
    })),

    senderList: (data.senders ?? []).map((s: any) => ({
      name: s.name,
    })),

    options: mapOptions(data.options),

    productImage: undefined, // ❗ File은 서버에서 안 옴
  };
}

function padTime(value?: string | number | null): string {
  if (value === null || value === undefined) return "";
  return String(value).padStart(2, "0");
}

function mapOptions(options: any[] = []) {
  return options.reduce((acc, opt, index) => {
    const key = opt.optionName ?? `option_${index}`;

    acc[key] = {
      checked: true,
      price: opt.price ?? 0,
    };

    return acc;
  }, {} as OrderFormValue["options"]);
}

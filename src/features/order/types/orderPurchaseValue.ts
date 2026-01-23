export type OrderPurchaseValue = {
  orderNumber: string; //주문번호
  orderType: string; //구분(회원 선택/지역 자동 배정)
  orderDate: string; //주문접수일
  orderTime: string; //주문접수시각
  deliveryDate: string; //배송요구일
  deliveryTime: string; //배송요구시간(기본시간, 즉시배송, 11:00...)
  sender: string; //주문자
  receiver: string; //받는분
  corpName: string; //재이플라워
  corpAddress: string; //강원 속초시
  productName: string; //상품명
  deliveryAddress: string; //배송지
  originPrice: number; //원청액
  payment: number; //결제액
  sms: string; //문자 성공(성공/거부/실패)
  fax: string; //팩스 성공(성공/거부/실패)
  deliveryStatus: string; //배송상태(미확인/주문접수/배송준비/배송완료) //주문거절은?
  consignee: string; //인수자
  isDelivery: boolean; //배송 활성화
  onSite: boolean; //현장 활성화
};

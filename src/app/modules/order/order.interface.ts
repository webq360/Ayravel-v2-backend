import { Types } from "mongoose";

export type TShipping = {
  name: string;
  type: "free" | "percentage" | "amount";
};

export type TTotalAmount = {
  subTotal: number;
  tax: number;
  shipping: TShipping;
  discount: number;
  total: number;
};

export type TCustomerInfo = {
  firstName: string;
  lastName: string;
  pickupLocation: string;
  email?: string;
  phone: string;
  altPhone?: string;
  address: string;
  country: string;
  city: string;
  area: string;
  zone: string;
  postalCode?: string;
};

export type TPaymentInfo = {
  cardNumber: string;
  expireDate: string;
  cvc: string;
  nameOnCard: string;
};

export type TOrderInfo = {
  orderBy: Types.ObjectId;
  productInfo: Types.ObjectId;
  trackingNumber: number;
  status:
    | "pending"
    | "processing"
    | "at-local-facility"
    | "out-for-delivery"
    | "cancelled"
    | "completed";
  isCancelled: boolean;
  quantity: number;
  totalAmount: TTotalAmount;
};

export type TOrder = {
  orderId?: string;
  orderInfo: TOrderInfo[];
  customerInfo: TCustomerInfo;
  paymentInfo: TPaymentInfo | "cash-on";
  deliveryCharge: number;
  totalAmount: number;
  courierProvider?: 'steadfast' | 'pathao';
  createdAt?: Date;
  updatedAt?: Date;
};

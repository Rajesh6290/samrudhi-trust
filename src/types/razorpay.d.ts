declare module "razorpay" {
  export interface RazorpayOrder {
    id: string;
    entity: string;
    amount: number;
    amount_paid: number;
    amount_due: number;
    currency: string;
    receipt: string;
    status: string;
    attempts: number;
    notes: Record<string, string>;
    created_at: number;
  }

  export interface RazorpayOrderOptions {
    amount: number;
    currency: string;
    receipt: string;
    notes?: Record<string, string>;
  }

  export interface RazorpayPayment {
    id: string;
    entity: string;
    amount: number;
    currency: string;
    status: string;
    order_id: string;
    invoice_id?: string;
    method: string;
    description?: string;
    email?: string;
    contact?: string;
    created_at: number;
    error_code?: string;
    error_description?: string;
  }

  export interface RazorpayRefund {
    id: string;
    entity: string;
    amount: number;
    currency: string;
    payment_id: string;
    status: string;
    speed: string;
    created_at: number;
  }

  export interface RazorpayRefundOptions {
    amount?: number;
    speed?: string;
    notes?: Record<string, string>;
    receipt?: string;
  }

  export interface RazorpayPaymentList {
    items: RazorpayPayment[];
    count: number;
  }

  export interface RazorpayConfig {
    key_id: string;
    key_secret: string;
  }

  export interface RazorpayOrders {
    create(options: RazorpayOrderOptions): Promise<RazorpayOrder>;
    fetch(orderId: string): Promise<RazorpayOrder>;
    fetchPayments(orderId: string): Promise<RazorpayPaymentList>;
  }

  export interface RazorpayPayments {
    fetch(paymentId: string): Promise<RazorpayPayment>;
    refund(
      paymentId: string,
      options: RazorpayRefundOptions
    ): Promise<RazorpayRefund>;
  }

  export interface RazorpayRefunds {
    fetch(refundId: string): Promise<RazorpayRefund>;
  }

  export default class Razorpay {
    constructor(config: RazorpayConfig);
    orders: RazorpayOrders;
    payments: RazorpayPayments;
    refunds: RazorpayRefunds;
  }
}

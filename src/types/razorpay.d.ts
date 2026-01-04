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
  }

  export interface RazorpayConfig {
    key_id: string;
    key_secret: string;
  }

  export interface RazorpayOrders {
    create(options: RazorpayOrderOptions): Promise<RazorpayOrder>;
  }

  export interface RazorpayPayments {
    fetch(paymentId: string): Promise<RazorpayPayment>;
  }

  export default class Razorpay {
    constructor(config: RazorpayConfig);
    orders: RazorpayOrders;
    payments: RazorpayPayments;
  }
}

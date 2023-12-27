export class SubscriptionListRes {
  object: string;
  url: string;
  has_more: boolean;
  data: SubscriptionInfo[];
}

class SubscriptionInfo {
  id: string;
  object: string;
  cancel_at: number;
  cancel_at_period_end: boolean;
  canceled_at: number;
  cancellation_details: {
    comment: null;
    feedback: null;
    reason: null;
  };
  collection_method: string;
  created: number;
  currency: string;
  current_period_end: number;
  current_period_start: number;
  customer: string;
  days_until_due: number;
  default_payment_method: string;
  default_source: string;
  default_tax_rates: [];
  description: string;
  discount: number;
  ended_at: number;
}

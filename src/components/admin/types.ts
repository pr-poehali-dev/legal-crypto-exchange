export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  created_at: string;
  blocked?: boolean;
}

export interface Offer {
  id: number;
  user_id: number;
  offer_type: string;
  amount: number;
  rate: number;
  meeting_time: string;
  meeting_time_end?: string;
  status: string;
  created_at: string;
  username: string;
  phone: string;
}

export interface Deal {
  id: number;
  user_id: number;
  username: string;
  email: string;
  phone: string;
  deal_type: string;
  amount: number;
  rate: number;
  total: number;
  status: string;
  partner_name: string;
  created_at: string;
  updated_at: string;
}
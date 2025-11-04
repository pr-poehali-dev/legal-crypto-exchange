export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  created_at: string;
  blocked?: boolean;
}

export interface Reservation {
  id: number;
  buyer_name: string;
  buyer_phone?: string;
  buyer_email?: string;
  meeting_time: string;
  meeting_office: string;
  created_at: string;
  status: string;
  user_id?: number;
  amount?: number;
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
  email?: string;
  reservations?: Reservation[];
  reserved_by?: number;
  reserved_by_username?: string;
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
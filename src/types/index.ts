export interface User {
  id?: string;
  mobile: string;
  name?: string; // Keep for backward compatibility
  first_name?: string;
  last_name?: string;
  verified?: boolean;
  referral_type?: string;
  refered_by_name?: string;
  refered_by_mobile?: string;
  isFormFilled?: boolean;
  email?: string;
  address?: string;
  phone?: string;
  city?: string;
  state?: string;
  pincode?: string;
  occupation?: string;
  income_level?: string;
  family_size?: number;
  [key: string]: any; // Allow dynamic custom fields
}

export interface CreateUserRequest {
  mobile: string;
  name: string;
  referral_type: string;
}

export interface UserParams {
  page?: number;
  limit?: number;
  role?: string;
  created_date?: string;
  verified?: boolean;
}

export interface Order {
  id: string;
  breedId: string;
  calfCount: number;
  buffaloCount: number;
  numUnits: number;
  baseUnitCost: number;
  unitCost: number;
  totalCost: number;
  paymentMode: string;
  paymentType: string;
  paymentStatus: string;
  submittedAt: string;
  placedAt: string;
  withCpf: boolean;
  cpfUnitCost: number;
  coinsRedeemed?: number;
  status?: string;
  fulfillmentStage?: string;
  approvalDate?: string;
  lockInPeriod?: number[];
  comments?: string;
}

export interface Referral {
  id: string;
  first_name: string;
  last_name: string;
  name: string;
  mobile: string;
  email?: string;
  role: string;
  verified: boolean;
  isFormFilled: boolean;
  user_created_date: string;
  city?: string;
  state?: string;
  pincode?: string;
  occupation?: string;
  gender?: string;
  referral_code?: string;
  referal_code?: string;
  otp_verified?: boolean;
  isTestAccount?: boolean;
  isQuit?: boolean;
  isabletoreferr?: boolean;
  aadhar_front_image_url?: string;
  aadhar_back_image_url?: string;
  panCardUrl?: string;
  otp?: string;
  otp_created_at?: string;
  paymentSessionDate?: string;
  aadhar_number?: string;
  dob?: string;
}

export interface Stats {
  total_orders: number;
  purchased_orders: number;
  pending_orders: number;
  rejected_orders: number;
  delivered_orders: number;
  non_delivered_orders: number;
  total_coins: number;
  total_referrals: number;
}

export interface CustomerDetails {
  user: User;
  stats: Stats;
  orders: Order[];
  referrals: Referral[];
}

export interface NetworkStats {
  total_distributed_coins: number;
  total_target_coins: number;
  user_count: number;
  page: number;
  limit: number;
  total_purchased_units?: number;
  total_target_units?: number;
}

export interface NetworkUser {
  id: string;
  mobile: string;
  name: string;
  total_coins: number;
  referral_count: number;
  role: string;
  created_date: string;
  [key: string]: any;
}

export interface NetworkResponse {
  statuscode: number;
  status: string;
  stats: NetworkStats;
  users: NetworkUser[];
}

export interface NetworkUserStats {
  total_coins: number;
  paid_orders_count: number;
  direct_referrals_count: number;
  total_network_size: number;
}

export interface NetworkTreeItem {
  mobile: string;
  name: string;
  referrals: NetworkTreeItem[];
}

export interface NetworkUserDetailsResponse {
  statuscode: number;
  status: string;
  user: any; // Using any for now as the user object has many fields overlapping with generic User but with differences
  stats: NetworkUserStats;
  network_tree: NetworkTreeItem[];
}

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
  status?: string;
  statuscode?: number;
}

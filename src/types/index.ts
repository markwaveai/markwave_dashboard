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
  referral_code?: string;
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
  aadhar_front_image_url?: string;
  aadhar_back_image_url?: string;
  panCardUrl?: string;
  aadhar_number?: string;
  pan_number?: string; // or whatever the field name is, likely standardizing
  referral_count?: number;
  earned_coins?: number;
  used_coins?: number;
  referral_coins?: number;
  [key: string]: any; // Allow dynamic custom fields
}

export interface CreateUserRequest {
  mobile: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  referred_by_code: string;
  isabletorefer: boolean;
  isTestAccount: boolean;
}

export interface UserParams {
  page?: number;
  limit?: number;
  role?: string;
  created_date?: string;
  verified?: boolean;
  search?: string;
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
  referral_earned_coins?: number;
  earned_coins?: number;
  used_coins?: number;
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
  units_purchased?: number;
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
  spending_coins: number;
  remaining_coins: number;
  paid_orders_count: number;
  paid_units_count: number;
  direct_referrals_count: number;
  indirect_referrals_count: number;
  total_network_size: number;
  direct_referrals_units?: number;
  indirect_referrals_units?: number;
  current_reward?: string;
  achieved_rewards?: string[];
  achieved_rewards_list?: { threshold: number; reward: string }[];
  next_milestone?: { threshold: number; reward: string } | null;
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

export interface Farm {
  id: string;
  location: string;
  strength: number;
  currentUnits: number;
  availableUnits: number;
  status: 'ACTIVE' | 'INACTIVE' | 'FULL';
  isSelfBenefitsActive: boolean;
  isReferralBenefitsActive: boolean;
  createdAt: string;
}

export interface CreateFarmRequest {
  location: string;
  strength: number;
  status: string;
  isSelfBenefitsActive?: boolean;
  isReferralBenefitsActive?: boolean;
}

export interface AssignAdminToFarmRequest {
  admin_mobile: string;
}

export interface SelfBenefit {
  id: string;
  title: string;
  description: string;
  units_required: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateSelfBenefitRequest {
  id?: string;
  title: string;
  description: string;
  units_required: number;
  is_active: boolean;
}
export interface ReferralMilestone {
  id: string;
  threshold: number;
  reward: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateReferralMilestoneRequest {
  threshold: number;
  reward: string;
  is_active: boolean;
}

export interface ReferralConfig {
  stage1_percentage: number;
  stage2_percentage: number;
  stage1_active: boolean;
  stage2_active: boolean;
  is_global_active: boolean;
  id: string;
  updated_at: string;
}

export interface UpdateReferralConfigRequest {
  stage1_percentage?: number;
  stage2_percentage?: number;
  stage1_active?: boolean;
  stage2_active?: boolean;
  is_global_active?: boolean;
}

export interface RoleChangeRequest {
  id?: string;
  _id?: string; // Some MongoDB-like APIs use _id
  request_id: string;
  requester_mobile: string;
  requester_name: string;
  target_mobile: string | null;
  target_name: string;
  current_role: string;
  requested_role: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  created_at: string;
  updated_at: string;
  [key: string]: any; // Catch-all for other potential ID fields like 'uuid' or 'reference_id'
}

export interface RoleChangeRequestResponse {
  statuscode: number;
  status: string;
  data: RoleChangeRequest[];
}

export interface Market {
  id: string;
  name: string;
  state: string;
  location: string;
  status?: string; // Keep for UI compatibility if needed
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMarketRequest {
  name: string;
  state: string;
  location: string;
  isActive: boolean;
}

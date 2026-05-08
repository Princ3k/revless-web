export type TravelerType = "employee" | "spouse" | "companion" | "parent";
export type ZedTier = "low" | "medium" | "high";
export type TenantRequestStatus = "pending" | "approved" | "rejected";
export type AgreementDocumentStatus = "pending" | "approved";

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface User {
  id: string;
  email: string;
  tenant_id: string | null;
  search_credits: number;
}

export interface FlightLeg {
  carrier_iata: string;
  carrier_name: string;
  origin: string;
  destination: string;
  departure_time: string;
  arrival_time: string;
  duration_minutes: number;
}

export interface StaleRule {
  rule_id: string;
  carrier_iata: string;
  carrier_name: string;
  confidence_score: number;
}

export interface Itinerary {
  legs: FlightLeg[];
  total_duration_minutes: number;
  total_zed_tier: ZedTier;
  requires_verification: boolean;
  stale_rules: StaleRule[];
  boarding_probability: number;
}

export interface RouteSearchResponse {
  origin: string;
  destination: string;
  date: string;
  traveler_type: TravelerType;
  itineraries: Itinerary[];
  total_raw: number;
  total_filtered: number;
}

export interface SearchHistoryItem {
  id: string;
  origin: string;
  destination: string;
  travel_date: string;
  traveler_type: TravelerType;
  total_raw: number;
  total_filtered: number;
  created_at: string;
}

export interface MatrixRuleRow {
  rule_id: string;
  carrier_iata: string;
  carrier_name: string;
  traveler_type: TravelerType;
  zed_tier: ZedTier;
  is_unaccompanied_allowed: boolean;
  confidence_score: number;
  is_verified: boolean;
  is_stale: boolean;
}

export interface PendingDocumentSummary {
  id: string;
  carrier_iata: string;
  carrier_name: string;
  approval_count: number;
  required_approvals: number;
  status: string;
  created_at: string;
  uploader_email: string;
}

export interface AgreementMatrixResponse {
  rules: MatrixRuleRow[];
  pending_documents: PendingDocumentSummary[];
}

export interface AgreementVerificationResponse {
  rule_id: string;
  is_accurate: boolean;
  confidence_score: number;
  last_verified: string;
  user_search_credits: number;
}

export interface DocumentApproveResponse {
  document_id: string;
  approval_count: number;
  required_approvals: number;
  status: string;
  document_now_official: boolean;
  user_search_credits: number;
}

export interface TenantRequestRead {
  id: string;
  user_id: string;
  email_domain: string;
  airline_name: string;
  airline_code: string;
  message: string | null;
  status: TenantRequestStatus;
  created_at: string;
  resolved_at: string | null;
  admin_note: string | null;
}

export interface VerificationHistoryItem {
  id: string;
  rule_id: string;
  carrier_iata: string;
  carrier_name: string;
  is_accurate: boolean;
  created_at: string;
}

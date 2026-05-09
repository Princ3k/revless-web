import type {
  LoginResponse,
  User,
  RouteSearchResponse,
  TravelerType,
  SearchHistoryItem,
  AgreementMatrixResponse,
  AgreementVerificationResponse,
  DocumentApproveResponse,
  TenantRequestRead,
  VerificationHistoryItem,
} from "./types";

export const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://revless-api.onrender.com/api/v1";

const TOKEN_KEY = "revless_token";

export const auth = {
  getToken: () =>
    typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null,
  setToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clearToken: () => localStorage.removeItem(TOKEN_KEY),
};

class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
  }
}

async function request<T>(
  path: string,
  options: RequestInit & { token?: string } = {}
): Promise<T> {
  const { token, ...fetchOptions } = options;
  const resolvedToken = token ?? auth.getToken();

  const headers: Record<string, string> = {
    ...(fetchOptions.headers as Record<string, string>),
  };

  if (resolvedToken) {
    headers["Authorization"] = `Bearer ${resolvedToken}`;
  }

  if (
    fetchOptions.body &&
    typeof fetchOptions.body === "string" &&
    !headers["Content-Type"]
  ) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...fetchOptions,
    headers,
  });

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const json = await res.json();
      detail = json.detail ?? detail;
    } catch {
      // ignore
    }
    throw new ApiError(res.status, detail);
  }

  const text = await res.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}

export const api = {
  // Auth
  login: (email: string, password: string) => {
    const body = new URLSearchParams({ username: email, password });
    return request<LoginResponse>("/auth/login/access-token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });
  },

  register: (email: string, password: string) =>
    request<User>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  getMe: () => request<User>("/auth/me"),

  getMyVerifications: (limit = 30) =>
    request<VerificationHistoryItem[]>(`/auth/me/verifications?limit=${limit}`),

  // Search
  searchRoutes: (
    origin: string,
    destination: string,
    date: string,
    traveler_type: TravelerType
  ) =>
    request<RouteSearchResponse>(
      `/search/routes?origin=${origin}&destination=${destination}&date=${date}&traveler_type=${traveler_type}`
    ),

  getSearchHistory: (limit = 20) =>
    request<SearchHistoryItem[]>(`/search/history?limit=${limit}`),

  // Agreements
  getAgreementMatrix: () =>
    request<AgreementMatrixResponse>("/agreements/matrix"),

  verifyRule: (rule_id: string, is_accurate: boolean) =>
    request<AgreementVerificationResponse>("/agreements/verify", {
      method: "POST",
      body: JSON.stringify({ rule_id, is_accurate }),
    }),

  uploadDocument: (carrier_iata: string, file: File) => {
    const formData = new FormData();
    formData.append("carrier_iata", carrier_iata);
    formData.append("file", file);
    return request<{ document_id: string; status: string; carrier_iata: string }>(
      "/agreements/documents",
      { method: "POST", body: formData }
    );
  },

  approveDocument: (document_id: string) =>
    request<DocumentApproveResponse>(
      `/agreements/documents/${document_id}/approve`,
      { method: "POST" }
    ),

  // Tenant requests
  getMyTenantRequest: () =>
    request<TenantRequestRead | null>("/tenant-requests/me"),

  createTenantRequest: (
    airline_name: string,
    airline_code: string,
    message?: string
  ) =>
    request<TenantRequestRead>("/tenant-requests", {
      method: "POST",
      body: JSON.stringify({ airline_name, airline_code, message }),
    }),
};

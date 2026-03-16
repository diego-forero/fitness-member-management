import type {
  ApiError,
  CheckIn,
  ManagedPlan,
  Member,
  MemberSummary,
  Membership,
  MembershipPlan,
} from "@/types/api";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

class ApiRequestError extends Error {
  status: number;
  details: ApiError["details"];

  constructor(status: number, body: ApiError) {
    super(body.message);
    this.status = status;
    this.details = body.details;
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    let body: ApiError;
    try {
      body = await res.json();
    } catch {
      body = { message: `Request failed with status ${res.status}` };
    }
    throw new ApiRequestError(res.status, body);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json();
}

export { ApiRequestError };

export const api = {
  health: () => request<{ status: string }>("/api/health"),

  searchMembers: (query: string) =>
    request<Member[]>(`/api/members?query=${encodeURIComponent(query)}`),

  createMember: (data: { firstName: string; lastName: string; email: string }) =>
    request<Member>("/api/members", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getMemberSummary: (memberId: string) =>
    request<MemberSummary>(`/api/members/${memberId}/summary`),

  getPlans: () => request<MembershipPlan[]>("/api/plans"),

  getAdminPlans: () => request<ManagedPlan[]>("/api/plans/admin"),

  createPlan: (data: {
    code: string;
    name: string;
    description?: string | null;
    isActive?: boolean;
  }) =>
    request<ManagedPlan>("/api/plans", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updatePlan: (
    planId: string,
    data: {
      code?: string;
      name?: string;
      description?: string | null;
      isActive?: boolean;
    },
  ) =>
    request<ManagedPlan>(`/api/plans/${planId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  deletePlan: (planId: string) =>
    request<void>(`/api/plans/${planId}`, {
      method: "DELETE",
    }),

  assignMembership: (memberId: string, data: { planId: string; startDate: string }) =>
    request<Membership>(`/api/members/${memberId}/memberships`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  cancelMembership: (memberId: string, membershipId: string) =>
    request<Membership>(`/api/members/${memberId}/memberships/${membershipId}/cancel`, {
      method: "PATCH",
    }),

  recordCheckIn: (memberId: string) =>
    request<CheckIn>(`/api/members/${memberId}/check-ins`, {
      method: "POST",
    }),
};

export interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
  updatedAt?: string;
}

export interface MembershipPlan {
  id: string;
  code: string;
  name: string;
  description?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ActiveMembership {
  id: string;
  startsAt: string;
  plan: MembershipPlan;
}

export interface MemberSummary {
  member: Member;
  hasActiveMembership: boolean;
  activeMembership: ActiveMembership | null;
  lastCheckInAt: string | null;
  checkInCountLast30Days: number;
}

export interface Membership {
  id: string;
  memberId: string;
  planId: string;
  startsAt: string;
  cancellationEffectiveAt: string | null;
  createdAt: string;
  updatedAt: string;
  plan?: MembershipPlan;
}

export interface CheckIn {
  id: string;
  memberId: string;
  membershipId: string;
  checkedInAt: string;
}

export interface ApiError {
  message: string;
  details?: {
    formErrors?: string[];
    fieldErrors?: Record<string, string[]>;
  } | null;
}

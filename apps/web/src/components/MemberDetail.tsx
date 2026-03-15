import { useEffect, useState } from "react";
import { api, ApiRequestError } from "@/lib/api";
import type { MemberSummary, MembershipPlan } from "@/types/api";

interface MemberDetailProps {
  memberId: string;
  onBack: () => void;
}

export function MemberDetail({ memberId, onBack }: MemberDetailProps) {
  const [summary, setSummary] = useState<MemberSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [showAssign, setShowAssign] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const loadSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getMemberSummary(memberId);
      setSummary(data);
    } catch (e) {
      setError(e instanceof ApiRequestError ? e.message : "Failed to load member");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, [memberId]);

  const handleCheckIn = async () => {
    setActionLoading(true);
    setActionError(null);
    setActionFeedback(null);
    try {
      const result = await api.recordCheckIn(memberId);
      setActionFeedback(
        `Check-in recorded at ${new Date(result.checkedInAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}.`
      );
      await loadSummary();
    } catch (e) {
      setActionError(e instanceof ApiRequestError ? e.message : "Check-in failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!summary?.activeMembership) return;
    setActionLoading(true);
    setActionError(null);
    setActionFeedback(null);
    try {
      await api.cancelMembership(memberId, summary.activeMembership.id);
      setActionFeedback("Membership cancelled.");
      setConfirmCancel(false);
      await loadSummary();
    } catch (e) {
      setActionError(e instanceof ApiRequestError ? e.message : "Cancellation failed");
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const formatDateTime = (iso: string) =>
    new Date(iso).toLocaleString("en-US", {
      month: "short", day: "numeric", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

  if (loading) {
    return (
      <div className="space-y-4">
        <button onClick={onBack} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          ← Back to members
        </button>
        <div className="bg-card rounded-volt shadow-volt p-8 animate-pulse">
          <div className="h-8 bg-panel rounded w-48 mb-4" />
          <div className="h-4 bg-panel rounded w-64 mb-2" />
          <div className="h-4 bg-panel rounded w-32" />
        </div>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="space-y-4">
        <button onClick={onBack} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          ← Back to members
        </button>
        <div className="bg-card rounded-volt shadow-volt p-8 text-destructive">{error || "Member not found"}</div>
      </div>
    );
  }

  const { member, hasActiveMembership, activeMembership, lastCheckInAt, checkInCountLast30Days } = summary;

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
        ← Back to members
      </button>

      {actionFeedback && (
        <div className="px-4 py-3 bg-brand/10 text-foreground rounded-volt text-sm font-medium">
          {actionFeedback}
        </div>
      )}
      {actionError && (
        <div className="px-4 py-3 bg-destructive/10 text-destructive rounded-volt text-sm font-medium">
          {actionError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Profile */}
        <div className="lg:col-span-2 bg-card rounded-volt shadow-volt p-8">
          <h2 className="text-3xl font-bold mb-1">
            {member.firstName} {member.lastName}
          </h2>
          <p className="text-muted-foreground mb-6">{member.email}</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <Stat label="Status" value={hasActiveMembership ? "Active" : "No Plan"} highlight={hasActiveMembership} />
            <Stat label="Plan" value={activeMembership?.plan.name || "—"} />
            <Stat label="Last Check-in" value={lastCheckInAt ? formatDateTime(lastCheckInAt) : "Never"} />
            <Stat label="Check-ins (30d)" value={String(checkInCountLast30Days)} />
          </div>

          {activeMembership && (
            <p className="mt-4 text-xs text-muted-foreground">
              Membership started {formatDate(activeMembership.startsAt)}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-4">
          {hasActiveMembership && (
            <>
              <button
                onClick={handleCheckIn}
                disabled={actionLoading}
                className="w-full py-5 bg-brand hover:bg-brand-dark rounded-volt font-black text-lg uppercase tracking-tight text-primary-foreground shadow-volt transition-all duration-200 active:scale-[0.98] disabled:opacity-50"
              >
                {actionLoading ? "..." : "Record Check-In"}
              </button>

              {!confirmCancel ? (
                <button
                  onClick={() => setConfirmCancel(true)}
                  className="w-full py-3 bg-card hover:bg-panel rounded-volt font-semibold text-muted-foreground shadow-volt transition-all duration-200 text-sm"
                >
                  Cancel Membership
                </button>
              ) : (
                <div className="bg-card rounded-volt shadow-volt p-4 space-y-3">
                  <p className="text-sm font-medium">Are you sure you want to cancel this membership?</p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCancel}
                      disabled={actionLoading}
                      className="flex-1 py-2.5 bg-destructive text-destructive-foreground rounded-lg font-semibold text-sm disabled:opacity-50"
                    >
                      Yes, Cancel
                    </button>
                    <button
                      onClick={() => setConfirmCancel(false)}
                      className="flex-1 py-2.5 bg-panel rounded-lg font-semibold text-sm text-muted-foreground"
                    >
                      No, Keep
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {!hasActiveMembership && (
            <>
              {!showAssign ? (
                <button
                  onClick={() => setShowAssign(true)}
                  className="w-full py-5 bg-brand hover:bg-brand-dark rounded-volt font-black text-lg uppercase tracking-tight text-primary-foreground shadow-volt transition-all duration-200 active:scale-[0.98]"
                >
                  Assign Plan
                </button>
              ) : (
                <AssignMembershipPanel
                  memberId={memberId}
                  onSuccess={() => {
                    setShowAssign(false);
                    setActionFeedback("Membership assigned successfully.");
                    loadSummary();
                  }}
                  onCancel={() => setShowAssign(false)}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-1">{label}</p>
      <p className={`text-sm font-bold ${highlight ? "text-green-600" : ""}`}>{value}</p>
    </div>
  );
}

function AssignMembershipPanel({
  memberId,
  onSuccess,
  onCancel,
}: {
  memberId: string;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getPlans()
      .then((data) => {
        setPlans(data.filter((p) => p.isActive !== false));
        setPlansLoading(false);
      })
      .catch(() => {
        setError("Failed to load plans");
        setPlansLoading(false);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;
    setSubmitting(true);
    setError(null);
    try {
      await api.assignMembership(memberId, { planId: selectedPlan, startDate });
      onSuccess();
    } catch (e) {
      setError(e instanceof ApiRequestError ? e.message : "Failed to assign");
    } finally {
      setSubmitting(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="bg-card rounded-volt shadow-volt p-6">
      <h3 className="font-bold mb-4">Assign Membership</h3>
      {error && (
        <div className="mb-3 px-3 py-2 bg-destructive/10 text-destructive rounded-lg text-xs font-medium">
          {error}
        </div>
      )}
      {plansLoading ? (
        <p className="text-sm text-muted-foreground">Loading plans...</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider text-muted-foreground">
              Plan
            </label>
            <select
              value={selectedPlan}
              onChange={(e) => setSelectedPlan(e.target.value)}
              className="w-full bg-panel px-3 py-2.5 rounded-lg outline-none focus:ring-2 focus:ring-brand/50 text-sm text-foreground"
              required
            >
              <option value="">Select a plan</option>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider text-muted-foreground">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              max={today}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-panel px-3 py-2.5 rounded-lg outline-none focus:ring-2 focus:ring-brand/50 text-sm text-foreground"
              required
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 bg-brand hover:bg-brand-dark rounded-lg font-bold text-sm text-primary-foreground disabled:opacity-50 transition-all"
            >
              {submitting ? "Assigning..." : "Assign Plan"}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 rounded-lg font-semibold text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

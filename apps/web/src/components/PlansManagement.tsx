import { useEffect, useState } from "react";
import { api, ApiRequestError } from "@/lib/api";
import type { ManagedPlan } from "@/types/api";

interface PlansManagementProps {
  onBack: () => void;
}

type PlanFormState = {
  code: string;
  name: string;
  description: string;
  isActive: boolean;
};

const emptyFormState: PlanFormState = {
  code: "",
  name: "",
  description: "",
  isActive: true,
};

export function PlansManagement({ onBack }: PlansManagementProps) {
  const [plans, setPlans] = useState<ManagedPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [actionPlanId, setActionPlanId] = useState<string | null>(null);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [form, setForm] = useState<PlanFormState>(emptyFormState);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadPlans = async () => {
    setLoading(true);
    setLoadError(null);

    try {
      const data = await api.getAdminPlans();
      setPlans(data);
    } catch (error) {
      setLoadError(
        error instanceof ApiRequestError ? error.message : "Failed to load plans",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const resetForm = () => {
    setEditingPlanId(null);
    setForm({ ...emptyFormState });
    setFieldErrors({});
    setGeneralError(null);
  };

  const handleInputChange = <K extends keyof PlanFormState>(
    field: K,
    value: PlanFormState[K],
  ) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const validateForm = () => {
    const nextErrors: Record<string, string[]> = {};

    if (!form.code.trim()) {
      nextErrors.code = ["Code is required"];
    }

    if (!form.name.trim()) {
      nextErrors.name = ["Name is required"];
    }

    return nextErrors;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFeedback(null);
    setGeneralError(null);

    const clientErrors = validateForm();

    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      return;
    }

    setFieldErrors({});
    setSubmitting(true);

    try {
      const payload = {
        code: form.code.trim(),
        name: form.name.trim(),
        description: form.description.trim() || null,
        isActive: form.isActive,
      };

      if (editingPlanId) {
        await api.updatePlan(editingPlanId, payload);
        setFeedback("Plan updated successfully.");
      } else {
        await api.createPlan(payload);
        setFeedback("Plan created successfully.");
      }

      resetForm();
      await loadPlans();
    } catch (error) {
      if (error instanceof ApiRequestError) {
        if (error.details?.fieldErrors) {
          setFieldErrors(error.details.fieldErrors);
        } else {
          setGeneralError(error.message);
        }
      } else {
        setGeneralError("Something went wrong.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (plan: ManagedPlan) => {
    setFeedback(null);
    setGeneralError(null);
    setFieldErrors({});
    setEditingPlanId(plan.id);
    setForm({
      code: plan.code,
      name: plan.name,
      description: plan.description ?? "",
      isActive: plan.isActive,
    });
  };

  const handleToggleActive = async (plan: ManagedPlan) => {
    setActionPlanId(plan.id);
    setFeedback(null);
    setGeneralError(null);

    try {
      await api.updatePlan(plan.id, { isActive: !plan.isActive });
      setFeedback(
        plan.isActive ? "Plan deactivated successfully." : "Plan activated successfully.",
      );
      await loadPlans();
    } catch (error) {
      setGeneralError(
        error instanceof ApiRequestError ? error.message : "Failed to update plan",
      );
    } finally {
      setActionPlanId(null);
    }
  };

  const handleDelete = async (plan: ManagedPlan) => {
    const confirmed = window.confirm(
      `Delete "${plan.name}"? This only works if the plan has never been used.`,
    );

    if (!confirmed) {
      return;
    }

    setActionPlanId(plan.id);
    setFeedback(null);
    setGeneralError(null);

    try {
      await api.deletePlan(plan.id);
      if (editingPlanId === plan.id) {
        resetForm();
      }
      setFeedback("Plan deleted successfully.");
      await loadPlans();
    } catch (error) {
      setGeneralError(
        error instanceof ApiRequestError ? error.message : "Failed to delete plan",
      );
    } finally {
      setActionPlanId(null);
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const inputClass = (field: keyof PlanFormState) =>
    `w-full bg-panel px-4 py-3 rounded-lg outline-none transition-all text-foreground placeholder:text-muted-foreground ${
      fieldErrors[field]
        ? "ring-2 ring-destructive/50"
        : "focus:ring-2 focus:ring-brand/50"
    }`;

  return (
    <div className="space-y-4">
      <button
        onClick={onBack}
        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        ← Back to members
      </button>

      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-1">Plans</h2>
          <p className="text-muted-foreground">
            Create, update and retire membership plans without changing member history.
          </p>
        </div>
        <div className="px-4 py-2 rounded-volt bg-card border border-border text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Admin view
        </div>
      </div>

      {feedback && (
        <div className="px-4 py-3 bg-brand/10 text-foreground rounded-volt text-sm font-medium">
          {feedback}
        </div>
      )}

      {(generalError || loadError) && (
        <div className="px-4 py-3 bg-destructive/10 text-destructive rounded-volt text-sm font-medium">
          {generalError || loadError}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[360px_minmax(0,1fr)] gap-4">
        <div className="bg-card rounded-volt shadow-volt p-8 h-fit">
          <h3 className="text-2xl font-bold mb-1">
            {editingPlanId ? "Edit Plan" : "Create Plan"}
          </h3>
          <p className="text-muted-foreground mb-6">
            {editingPlanId
              ? "Update naming, availability or internal description."
              : "Add a new membership option for future assignments."}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5">Code</label>
              <input
                type="text"
                value={form.code}
                onChange={(event) => handleInputChange("code", event.target.value)}
                placeholder="MONTHLY_PLUS"
                className={inputClass("code")}
              />
              {fieldErrors.code?.map((message, index) => (
                <p key={index} className="text-destructive text-xs mt-1">
                  {message}
                </p>
              ))}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5">Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(event) => handleInputChange("name", event.target.value)}
                placeholder="Monthly Plus"
                className={inputClass("name")}
              />
              {fieldErrors.name?.map((message, index) => (
                <p key={index} className="text-destructive text-xs mt-1">
                  {message}
                </p>
              ))}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5">Description</label>
              <textarea
                value={form.description}
                onChange={(event) =>
                  handleInputChange("description", event.target.value)
                }
                placeholder="Optional notes about the plan."
                rows={4}
                className={`${inputClass("description")} resize-none`}
              />
              {fieldErrors.description?.map((message, index) => (
                <p key={index} className="text-destructive text-xs mt-1">
                  {message}
                </p>
              ))}
            </div>

            <label className="flex items-center gap-3 rounded-lg bg-panel px-4 py-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(event) =>
                  handleInputChange("isActive", event.target.checked)
                }
                className="h-4 w-4 accent-brand"
              />
              <span className="text-sm font-medium">
                Plan is active and available for new memberships
              </span>
            </label>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="bg-brand hover:bg-brand-dark px-6 py-2.5 rounded-volt font-bold text-primary-foreground transition-all duration-200 active:scale-[0.98] disabled:opacity-50"
              >
                {submitting
                  ? editingPlanId
                    ? "Saving..."
                    : "Creating..."
                  : editingPlanId
                    ? "Save Changes"
                    : "Create Plan"}
              </button>
              {editingPlanId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2.5 rounded-volt font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="bg-card rounded-volt shadow-volt overflow-hidden">
          <div className="px-6 py-5 border-b border-border flex items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold">Current Plans</h3>
              <p className="text-sm text-muted-foreground">
                Inactive plans stay visible here for admin control and auditability.
              </p>
            </div>
            <div className="text-sm text-muted-foreground tabular-nums">
              {plans.length} total
            </div>
          </div>

          {loading ? (
            <div className="px-6 py-12 text-center text-muted-foreground">
              Loading plans...
            </div>
          ) : plans.length === 0 ? (
            <div className="px-6 py-12 text-center text-muted-foreground">
              No plans yet. Create the first one from the panel.
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className="px-6 py-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"
                >
                  <div className="space-y-2 min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <h4 className="text-lg font-bold">{plan.name}</h4>
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                          plan.isActive
                            ? "bg-green-500/15 text-green-600"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {plan.isActive ? "Active" : "Inactive"}
                      </span>
                      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        {plan.code}
                      </span>
                    </div>

                    <p className="text-sm text-muted-foreground max-w-2xl">
                      {plan.description || "No description provided."}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      Updated {formatDate(plan.updatedAt)}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => handleEdit(plan)}
                      className="px-4 py-2 rounded-lg bg-panel hover:bg-background font-semibold text-sm transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleToggleActive(plan)}
                      disabled={actionPlanId === plan.id}
                      className="px-4 py-2 rounded-lg bg-card border border-border hover:bg-panel font-semibold text-sm transition-colors disabled:opacity-50"
                    >
                      {actionPlanId === plan.id
                        ? "Working..."
                        : plan.isActive
                          ? "Deactivate"
                          : "Activate"}
                    </button>
                    <button
                      onClick={() => handleDelete(plan)}
                      disabled={actionPlanId === plan.id}
                      className="px-4 py-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/15 font-semibold text-sm transition-colors disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

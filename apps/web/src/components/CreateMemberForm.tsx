import { useState } from "react";
import { api, ApiRequestError } from "@/lib/api";

interface CreateMemberFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function CreateMemberForm({ onSuccess, onCancel }: CreateMemberFormProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  const validate = () => {
    const errors: Record<string, string[]> = {};
    if (!firstName.trim()) errors.firstName = ["First name is required"];
    if (!lastName.trim()) errors.lastName = ["Last name is required"];
    if (!email.trim()) errors.email = ["Email is required"];
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = ["Invalid email address"];
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    const clientErrors = validate();
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      return;
    }
    setFieldErrors({});
    setSubmitting(true);
    try {
      await api.createMember({ firstName: firstName.trim(), lastName: lastName.trim(), email: email.trim() });
      onSuccess();
    } catch (e) {
      if (e instanceof ApiRequestError) {
        if (e.details?.fieldErrors) {
          setFieldErrors(e.details.fieldErrors);
        } else {
          setGeneralError(e.message);
        }
      } else {
        setGeneralError("Something went wrong.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (field: string) =>
    `w-full bg-panel px-4 py-3 rounded-lg outline-none transition-all text-foreground placeholder:text-muted-foreground ${
      fieldErrors[field] ? "ring-2 ring-destructive/50" : "focus:ring-2 focus:ring-brand/50"
    }`;

  return (
    <div className="bg-card rounded-volt shadow-volt p-8 max-w-lg">
      <h2 className="text-2xl font-bold mb-1">Create Member</h2>
      <p className="text-muted-foreground mb-6">Add a new member to the gym.</p>

      {generalError && (
        <div className="mb-4 px-4 py-3 bg-destructive/10 text-destructive rounded-lg text-sm font-medium">
          {generalError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-1.5">First Name</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className={inputClass("firstName")}
          />
          {fieldErrors.firstName?.map((msg, i) => (
            <p key={i} className="text-destructive text-xs mt-1">{msg}</p>
          ))}
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1.5">Last Name</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className={inputClass("lastName")}
          />
          {fieldErrors.lastName?.map((msg, i) => (
            <p key={i} className="text-destructive text-xs mt-1">{msg}</p>
          ))}
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1.5">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass("email")}
          />
          {fieldErrors.email?.map((msg, i) => (
            <p key={i} className="text-destructive text-xs mt-1">{msg}</p>
          ))}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="bg-brand hover:bg-brand-dark px-6 py-2.5 rounded-volt font-bold text-primary-foreground transition-all duration-200 active:scale-[0.98] disabled:opacity-50"
          >
            {submitting ? "Creating..." : "Create Member"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 rounded-volt font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

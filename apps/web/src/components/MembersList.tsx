import { useState, useEffect, useCallback } from "react";
import { api, ApiRequestError } from "@/lib/api";
import type { Member } from "@/types/api";

interface MembersListProps {
  onSelectMember: (id: string) => void;
  onCreateNew: () => void;
  refreshKey?: number;
}

export function MembersList({ onSelectMember, onCreateNew, refreshKey }: MembersListProps) {
  const [query, setQuery] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (q: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.searchMembers(q);
      setMembers(data);
    } catch (e) {
      setError(e instanceof ApiRequestError ? e.message : "Failed to load members");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    search(query);
  }, [query, search, refreshKey]);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div>
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-bold mb-1">Members</h2>
          <p className="text-muted-foreground">Manage your community and check-ins.</p>
        </div>
        <button
          onClick={onCreateNew}
          className="bg-brand hover:bg-brand-dark px-5 py-2.5 rounded-volt font-bold text-primary-foreground transition-all duration-200 active:scale-[0.98]"
        >
          Add Member
        </button>
      </div>

      <div className="bg-card rounded-volt shadow-volt overflow-hidden">
        <div className="p-4 border-b border-border">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-panel px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-brand/50 transition-all text-foreground placeholder:text-muted-foreground"
          />
        </div>

        {error && (
          <div className="px-6 py-4 text-destructive text-sm">{error}</div>
        )}

        {loading && !members.length && (
          <div className="px-6 py-12 text-center text-muted-foreground">Loading...</div>
        )}

        {!loading && !error && members.length === 0 && (
          <div className="px-6 py-12 text-center text-muted-foreground">
            {query ? "No members found." : "No members yet. Add your first member to get started."}
          </div>
        )}

        {members.length > 0 && (
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs uppercase tracking-widest text-muted-foreground border-b border-border">
                <th className="px-6 py-4 font-semibold">Name</th>
                <th className="px-6 py-4 font-semibold hidden sm:table-cell">Email</th>
                <th className="px-6 py-4 font-semibold hidden md:table-cell">Joined</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {members.map((m) => (
                <tr
                  key={m.id}
                  onClick={() => onSelectMember(m.id)}
                  className="hover:bg-panel transition-colors cursor-pointer group"
                >
                  <td className="px-6 py-5 font-bold">
                    {m.firstName} {m.lastName}
                  </td>
                  <td className="px-6 py-5 text-muted-foreground hidden sm:table-cell">{m.email}</td>
                  <td className="px-6 py-5 text-muted-foreground tabular-nums hidden md:table-cell">
                    {formatDate(m.createdAt)}
                  </td>
                  <td className="px-6 py-5 text-right">
                    <span className="text-muted-foreground/40 group-hover:text-brand transition-colors text-sm">
                      View →
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

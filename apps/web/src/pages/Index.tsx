import { useState, useCallback } from "react";
import { Header } from "@/components/Header";
import { MembersList } from "@/components/MembersList";
import { CreateMemberForm } from "@/components/CreateMemberForm";
import { MemberDetail } from "@/components/MemberDetail";
import { PlansManagement } from "@/components/PlansManagement";

type View =
  | { type: "list" }
  | { type: "create" }
  | { type: "plans" }
  | { type: "detail"; memberId: string };

const Index = () => {
  const [view, setView] = useState<View>({ type: "list" });
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-6xl mx-auto py-10 px-6">
        {view.type === "list" && (
          <MembersList
            onSelectMember={(id) => setView({ type: "detail", memberId: id })}
            onCreateNew={() => setView({ type: "create" })}
            onManagePlans={() => setView({ type: "plans" })}
            refreshKey={refreshKey}
          />
        )}
        {view.type === "create" && (
          <CreateMemberForm
            onSuccess={() => {
              refresh();
              setView({ type: "list" });
            }}
            onCancel={() => setView({ type: "list" })}
          />
        )}
        {view.type === "detail" && (
          <MemberDetail
            memberId={view.memberId}
            onBack={() => {
              refresh();
              setView({ type: "list" });
            }}
          />
        )}
        {view.type === "plans" && (
          <PlansManagement
            onBack={() => {
              refresh();
              setView({ type: "list" });
            }}
          />
        )}
      </main>
    </div>
  );
};

export default Index;

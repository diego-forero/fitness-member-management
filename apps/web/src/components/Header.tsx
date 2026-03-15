import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export function Header() {
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");

  useEffect(() => {
    api.health()
      .then(() => setStatus("ok"))
      .catch(() => setStatus("error"));
  }, []);

  return (
    <header className="h-16 border-b border-border bg-card px-8 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-brand rounded-md flex items-center justify-center font-black italic text-primary-foreground text-sm">
          V
        </div>
        <h1 className="font-bold tracking-tight text-lg uppercase">Volt Fitness</h1>
      </div>
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <span
          className={`w-2 h-2 rounded-full ${
            status === "loading"
              ? "bg-muted-foreground animate-pulse"
              : status === "ok"
              ? "bg-green-500"
              : "bg-red-500 animate-pulse"
          }`}
        />
        API {status === "loading" ? "..." : status.toUpperCase()}
      </div>
    </header>
  );
}

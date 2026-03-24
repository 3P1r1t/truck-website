"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

type MessageType = "success" | "error" | "info";

type AdminMessage = {
  id: string;
  type: MessageType;
  text: string;
};

type AdminMessageContextValue = {
  pushMessage: (text: string, type?: MessageType) => void;
};

const AdminMessageContext = createContext<AdminMessageContextValue | null>(null);

function buildId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function AdminMessageProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<AdminMessage[]>([]);

  const removeMessage = useCallback((id: string) => {
    setMessages((old) => old.filter((item) => item.id !== id));
  }, []);

  const pushMessage = useCallback(
    (text: string, type: MessageType = "info") => {
      const id = buildId();
      setMessages((old) => [...old, { id, text, type }]);
      setTimeout(() => removeMessage(id), 3200);
    },
    [removeMessage]
  );

  const value = useMemo(() => ({ pushMessage }), [pushMessage]);

  return (
    <AdminMessageContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[90] flex w-[320px] flex-col gap-2">
        {messages.map((item) => (
          <div
            key={item.id}
            className={cn(
              "pointer-events-auto rounded-sm border px-3 py-2 text-sm shadow-lg",
              item.type === "success" && "border-emerald-200 bg-emerald-50 text-emerald-700",
              item.type === "error" && "border-red-200 bg-red-50 text-red-700",
              item.type === "info" && "border-slate-200 bg-white text-slate-700"
            )}
          >
            {item.text}
          </div>
        ))}
      </div>
    </AdminMessageContext.Provider>
  );
}

export function useAdminMessage() {
  const context = useContext(AdminMessageContext);
  if (!context) {
    throw new Error("useAdminMessage must be used within AdminMessageProvider");
  }
  return context;
}

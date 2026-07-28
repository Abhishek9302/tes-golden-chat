"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, clearToken, getToken } from "@/lib/api";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [checking, setChecking] = useState(true);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I am your persona coach. What would you like to work on?"
    }
  ]);
  const [busy, setBusy] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }
    apiFetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        setUser(data.user);
      })
      .catch(() => {
        clearToken();
        router.replace("/login");
      })
      .finally(() => setChecking(false));
  }, [router]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || busy) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setBusy(true);
    try {
      const res = await apiFetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({ message: userMsg })
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply || "..." }
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, something went wrong." }
      ]);
    } finally {
      setBusy(false);
    }
  };

  const logout = () => {
    clearToken();
    router.push("/login");
  };

  if (checking) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col max-w-2xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">TES Golden Chat</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-600">{user?.email}</span>
          <button
            onClick={logout}
            className="text-sm text-slate-600 hover:text-slate-900"
          >
            Log out
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto space-y-3 mb-4 bg-white p-4 rounded-lg shadow-sm">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[80%] rounded-lg p-3 ${
              m.role === "user"
                ? "ml-auto bg-indigo-600 text-white"
                : "bg-slate-200 text-slate-900"
            }`}
          >
            {m.content}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={send} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 border rounded p-2"
          disabled={busy}
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}

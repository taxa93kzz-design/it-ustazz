"use client";

import { Bot, Loader2, MessageCircle, RotateCcw, Send, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ChatMessage } from "@/lib/chat-schema";
import { Button } from "@/components/ui/button";

const welcome: ChatMessage = {
  role: "assistant",
  content: "Сәлем! Мен IT Ustaz көмекшісімін. ҚМЖ, тапсырма, тест немесе информатика тақырыбы бойынша сұрағыңызды жазыңыз.",
};

const suggestions = [
  "ҚМЖ-ны қалай жасаймын?",
  "Python сабағына тапсырма ұсын",
  "Тестті Word форматына қалай жүктеймін?",
];

export function ChatBot({ userName }: { userName: string }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([welcome]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open, loading]);

  const send = async (text = input) => {
    const message = text.trim();
    if (!message || loading) return;
    const history = messages.slice(-12);
    setMessages((items) => [...items, { role: "user", content: message }]);
    setInput("");
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, history }),
      });
      const data = await response.json() as { answer?: string; message?: string };
      if (!response.ok || !data.answer) throw new Error(data.message ?? "Жауап алынбады");
      setMessages((items) => [...items, { role: "assistant", content: data.answer! }]);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Чат қызметімен байланысу мүмкін болмады");
    } finally {
      setLoading(false);
    }
  };

  const retry = () => {
    const lastQuestion = [...messages].reverse().find((item) => item.role === "user");
    if (lastQuestion) void send(lastQuestion.content);
  };

  return (
    <div className="no-print fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6">
      {open && (
        <section
          role="dialog"
          aria-label="IT Ustaz чат-боты"
          className="mb-3 flex h-[min(620px,calc(100vh-7rem))] w-[min(390px,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-2xl shadow-blue-950/20"
        >
          <header className="flex items-center justify-between bg-blue-600 px-4 py-3 text-white">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-full bg-white/15"><Bot className="size-5" /></span>
              <div><h2 className="font-bold">IT Ustaz көмекшісі</h2><p className="text-xs text-blue-100">{userName} · онлайн</p></div>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Чатты жабу" className="grid size-9 place-items-center rounded-full hover:bg-white/15"><X className="size-5" /></button>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4">
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={message.role === "user" ? "ml-10 flex justify-end" : "mr-8 flex justify-start"}>
                <p className={message.role === "user"
                  ? "whitespace-pre-wrap rounded-2xl rounded-br-md bg-blue-600 px-3.5 py-2.5 text-sm leading-5 text-white"
                  : "whitespace-pre-wrap rounded-2xl rounded-bl-md border bg-white px-3.5 py-2.5 text-sm leading-5 text-slate-700 shadow-sm"}>
                  {message.content}
                </p>
              </div>
            ))}
            {messages.length === 1 && <div className="grid gap-2">{suggestions.map((suggestion) =>
              <button key={suggestion} onClick={() => void send(suggestion)} className="rounded-xl border border-blue-100 bg-white px-3 py-2 text-left text-xs text-blue-700 hover:bg-blue-50">{suggestion}</button>,
            )}</div>}
            {loading && <div className="mr-8 flex"><p className="flex items-center gap-2 rounded-2xl rounded-bl-md border bg-white px-3.5 py-2.5 text-sm text-slate-500"><Loader2 className="size-4 animate-spin" /> Жауап дайындалуда...</p></div>}
            {error && <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700"><p>{error}</p><button onClick={retry} className="mt-2 flex items-center gap-1 font-semibold"><RotateCcw className="size-4" /> Қайта сұрау</button></div>}
            <div ref={endRef} />
          </div>

          <form className="flex items-end gap-2 border-t bg-white p-3" onSubmit={(event) => { event.preventDefault(); void send(); }}>
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void send(); }
              }}
              maxLength={1500}
              rows={1}
              placeholder="Сұрағыңызды жазыңыз..."
              aria-label="Чат сұрағы"
              className="max-h-28 min-h-11 flex-1 resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
            <Button size="icon" disabled={loading || !input.trim()} aria-label="Сұрақты жіберу"><Send className="size-4" /></Button>
          </form>
        </section>
      )}
      <button
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? "Чатты жабу" : "Чат-ботты ашу"}
        className="ml-auto grid size-14 place-items-center rounded-full bg-blue-600 text-white shadow-xl shadow-blue-300 transition hover:scale-105 hover:bg-blue-700"
      >
        {open ? <X className="size-6" /> : <MessageCircle className="size-6" />}
      </button>
    </div>
  );
}

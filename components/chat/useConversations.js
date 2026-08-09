"use client";

import { useCallback, useEffect, useState } from "react";

// localStorage-backed conversation store. No auth, no server. Each conversation:
//   { id, title, messages: [{ role, content }], createdAt, updatedAt }

const KEY = "eiw-chat-conversations-v1";

function load() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function makeId() {
  return `c-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function titleFrom(text) {
  const t = (text || "").trim().replace(/\s+/g, " ");
  if (!t) return "New chat";
  return t.length > 48 ? t.slice(0, 48) + "…" : t;
}

export function useConversations() {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate once on mount (avoids SSR/client mismatch).
  useEffect(() => {
    const initial = load();
    setConversations(initial);
    setActiveId(initial[0]?.id ?? null);
    setHydrated(true);
  }, []);

  // Persist only after hydration — a state flag (not a ref) guarantees the
  // save-effect never runs on the pre-hydration commit and wipes stored data.
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(conversations));
    } catch {
      /* quota / private mode — ignore */
    }
  }, [conversations, hydrated]);

  const active = conversations.find((c) => c.id === activeId) ?? null;

  const newChat = useCallback(() => {
    setActiveId(null);
    return null;
  }, []);

  const selectChat = useCallback((id) => setActiveId(id), []);

  const deleteChat = useCallback(
    (id) => {
      setConversations((prev) => {
        const next = prev.filter((c) => c.id !== id);
        setActiveId((cur) => (cur === id ? next[0]?.id ?? null : cur));
        return next;
      });
    },
    []
  );

  // Create a conversation from the first user message, return its id.
  const createWith = useCallback((firstMessage) => {
    const id = makeId();
    const now = Date.now();
    const convo = {
      id,
      title: titleFrom(firstMessage.content),
      messages: [firstMessage],
      createdAt: now,
      updatedAt: now,
    };
    setConversations((prev) => [convo, ...prev]);
    setActiveId(id);
    return id;
  }, []);

  // Replace the message list of a conversation (used during streaming).
  const setMessages = useCallback((id, updater) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              messages:
                typeof updater === "function" ? updater(c.messages) : updater,
              updatedAt: Date.now(),
            }
          : c
      )
    );
  }, []);

  return {
    conversations,
    active,
    activeId,
    newChat,
    selectChat,
    deleteChat,
    createWith,
    setMessages,
  };
}

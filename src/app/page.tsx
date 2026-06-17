"use client";

import { useState, useEffect } from "react";
import LoginGate from "@/components/LoginGate";
import ChatContainer from "@/components/chat/ChatContainer";

const TOKEN_KEY = "alhisba_session";

export default function Page() {
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem(TOKEN_KEY);
    if (saved) setToken(saved);
    setReady(true);
  }, []);

  function handleAuth(t: string) {
    sessionStorage.setItem(TOKEN_KEY, t);
    setToken(t);
  }

  function handleLogout() {
    sessionStorage.removeItem(TOKEN_KEY);
    setToken(null);
  }

  if (!ready) return null;
  if (!token) return <LoginGate onAuth={handleAuth} />;
  return <ChatContainer token={token} onLogout={handleLogout} />;
}

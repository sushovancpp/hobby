"use client";
import { useState } from "react";
import { User } from "@/types";
import LoginPage from "@/components/auth/LoginPage";
import QuestionsPage from "@/components/questions/QuestionsPage";
import Toast from "@/components/ui/Toast";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);

  return (
    <>
      <Toast />
      {user ? ( 
        <QuestionsPage user={user} onLogout={() => setUser(null)} />
      ) : (
        <LoginPage onLogin={setUser} />
      )}
    </>
  );
}

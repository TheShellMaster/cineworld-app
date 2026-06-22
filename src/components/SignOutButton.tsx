"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function SignOutButton() {
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.refresh();
  }

  return (
    <button
      onClick={handleSignOut}
      className="flex items-center gap-2 rounded-xl bg-[#374151] px-4 py-2.5 text-sm font-medium text-[#F5F5F5] transition-colors hover:bg-[#4B5563]"
    >
      <LogOut className="h-4 w-4" />
      Se déconnecter
    </button>
  );
}

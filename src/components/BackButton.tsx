"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function BackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="flex items-center gap-2 rounded-full bg-[#151B2B]/80 px-4 py-2 text-sm font-medium text-[#F5F5F5] backdrop-blur-md transition-all hover:bg-[#151B2B] hover:text-[#FF4D4D] border border-[#374151]"
    >
      <ArrowLeft className="h-4 w-4" />
      Retour
    </button>
  );
}

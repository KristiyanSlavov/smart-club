"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface SmartRedirectProps {
  tagId: string;
  children: React.ReactNode;
}

export function SmartRedirect({ tagId, children }: SmartRedirectProps) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("isAdmin") === "true") {
      router.replace(`/admin/${tagId}`);
    } else {
      setChecked(true);
    }
  }, [tagId, router]);

  if (!checked) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#0a0a0a]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#32cd32] border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}

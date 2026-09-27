"use client";

import { usePathname } from "next/navigation";

export function PageContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="page-content">
      {children}
    </div>
  );
}

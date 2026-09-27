"use client";

import type { FormEvent, ReactNode } from "react";
import { useRouter } from "next/navigation";

export function RouterGetForm({
  action,
  children,
  className,
}: {
  action: string;
  children: ReactNode;
  className?: string;
}) {
  const router = useRouter();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = new URLSearchParams();
    for (const [name, value] of new FormData(event.currentTarget)) {
      if (typeof value === "string") query.append(name, value);
    }
    router.push(`${action}?${query}`);
  }

  return (
    <form action={action} method="get" onSubmit={submit} className={className}>
      {children}
    </form>
  );
}

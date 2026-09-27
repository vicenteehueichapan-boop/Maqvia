import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "field min-w-0 text-base transition-[border-color,box-shadow] selection:bg-primary selection:text-primary-foreground file:inline-flex file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground md:text-sm",
        className,
      )}
      {...props}
    />
  );
}

export { Input };

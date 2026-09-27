import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "field flex field-sizing-content min-h-24 text-base transition-[border-color,box-shadow] md:text-sm",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };

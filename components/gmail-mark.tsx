export function GmailMark({ className = "size-5" }: { className?: string }) {
  return <span aria-hidden="true" className={`gmail-mark inline-block shrink-0 ${className}`} />;
}

import Link from "next/link";
export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      href="/"
      aria-label="Maqvia, ir al inicio"
      className="inline-flex min-h-11 min-w-11 items-center gap-2.5 text-[#eeeae1] hover:opacity-85 flex-none"
    >
      <svg
        width={compact ? 28 : 34}
        height={compact ? 28 : 34}
        viewBox="0 0 36 36"
        fill="none"
        aria-hidden="true"
        className="shrink-0"
      >
        <path
          d="M5 27V8L18 23L31 8V27"
          stroke="#EAE9E2"
          strokeWidth="3.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M25.8 27H31" stroke="#B9D88B" strokeWidth="3.8" strokeLinecap="round" />
      </svg>
      {!compact && (
        <span
          style={{ fontFamily: '"Manrope Variable", system-ui, sans-serif' }}
          className="font-bold text-[20px] leading-none tracking-[-0.07em]"
        >
          maqvia<span className="text-[#b9d88b]">.</span>
        </span>
      )}
    </Link>
  );
}

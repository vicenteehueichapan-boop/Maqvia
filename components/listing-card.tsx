import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import type { ReactNode } from "react";
import type { ListingView } from "@/lib/listing-view";

type ListingCardProps = {
  listing: ListingView;
  inert?: boolean;
  actions?: ReactNode;
};

export function ListingCard({ listing, inert = false, actions }: ListingCardProps) {
  const image = (
    <div className="relative aspect-[1.47] overflow-hidden bg-[#29352f]">
      {listing.images[0] ? (
        <img
          src={listing.images[0]}
          alt={listing.title}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.035]"
        />
      ) : (
        <div className="fine-grid grid h-full place-items-center text-sm text-[#aab9a7]">
          Sin fotografía
        </div>
      )}
      {listing.esEjemplo && (
        <span className="absolute left-4 top-4 rounded-full border border-white/25 bg-[#16201be8] px-3 py-1.5 text-[10px] font-bold tracking-widest">
          EJEMPLO
        </span>
      )}
    </div>
  );

  return (
    <article
      className={`listing-variant listing-variant-${listing.presentationVariant || "editorial"} group flex h-full flex-col overflow-hidden rounded-[22px] border border-[#3d493f] bg-[#1b2320] surface-hover transition-all`}
    >
      {inert || !listing.href ? (
        image
      ) : (
        <Link href={listing.href} aria-label={`Ver ficha de ${listing.title}`}>
          {image}
        </Link>
      )}
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-bold uppercase tracking-[.13em] text-[#bad893]">
          {listing.category}
        </p>
        {inert || !listing.href ? (
          <h3 className="mt-2 text-xl font-bold leading-tight tracking-[-.04em]">
            {listing.title}
          </h3>
        ) : (
          <Link
            href={listing.href}
            className="mt-2 flex items-start justify-between gap-3 text-xl font-bold leading-tight tracking-[-.04em] hover:text-[#d4e9bd]"
          >
            {listing.title}
            <ArrowUpRight size={17} className="mt-1 shrink-0 text-[#c8dfb5]" />
          </Link>
        )}
        <p className="mt-3 flex items-center gap-1.5 text-xs text-[#aab8a8]">
          {listing.comuna && (
            <>
              <MapPin size={14} />
              {listing.comuna} ·{" "}
            </>
          )}
          {listing.providerName}
        </p>
        {listing.services.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {listing.services.slice(0, 2).map((service) => (
              <span
                key={service}
                className="rounded-full bg-[#2a362d] px-2.5 py-1 text-[11px] text-[#ccdac6]"
              >
                {service}
              </span>
            ))}
          </div>
        )}
        <p className="mt-auto border-t border-[#ffffff19] pt-4 text-base font-bold text-[#f0eee6]">
          {listing.priceLabel ?? "Consultar precio"}
        </p>
        {actions && <div className="mt-4 border-t border-[#ffffff17] pt-4">{actions}</div>}
      </div>
    </article>
  );
}

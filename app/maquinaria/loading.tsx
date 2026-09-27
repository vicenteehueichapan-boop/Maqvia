export default function CatalogLoading() {
  return (
    <main className="min-h-screen bg-[#101313] text-[#eae9e2]" aria-busy="true">
      <div className="container-shell py-16">
        <div className="h-4 w-40 animate-pulse rounded-full bg-[#526451]" />
        <div className="mt-7 h-16 max-w-2xl animate-pulse rounded-2xl bg-[#27352d]" />
        <div className="mt-7 h-20 animate-pulse rounded-2xl bg-[#1b2520]" />
        <p role="status" className="mt-6 text-sm text-[#b2c0b0]">
          Cargando maquinaria…
        </p>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div
              key={item}
              className="h-80 animate-pulse rounded-[22px] border border-[#3d493f] bg-[#1b2320]"
            />
          ))}
        </div>
      </div>
    </main>
  );
}

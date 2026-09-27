export default function DetailLoading() {
  return (
    <main className="min-h-screen bg-[#101313] text-[#eae9e2]" aria-busy="true">
      <div className="container-shell py-12">
        <p role="status" className="text-sm text-[#b2c0b0]">
          Cargando publicación…
        </p>
        <div className="mt-9 grid gap-8 lg:grid-cols-2">
          <div className="aspect-[4/3] animate-pulse rounded-[26px] bg-[#27352d]" />
          <div>
            <div className="h-4 w-40 animate-pulse rounded-full bg-[#526451]" />
            <div className="mt-7 h-24 animate-pulse rounded-2xl bg-[#27352d]" />
            <div className="mt-7 h-20 animate-pulse rounded-2xl bg-[#1b2520]" />
          </div>
        </div>
      </div>
    </main>
  );
}

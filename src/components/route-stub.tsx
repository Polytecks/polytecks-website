export function RouteStub({
  eyebrow,
  title,
  hint,
}: {
  eyebrow: string;
  title: string;
  hint: string;
}) {
  return (
    <section className="mx-auto flex min-h-[calc(100vh-72px)] max-w-[1100px] flex-col justify-center px-8 py-24">
      <p className="mb-6 font-mono text-[11px] uppercase tracking-[0.25em] text-indigo-bright">
        {eyebrow}
      </p>
      <h1 className="font-display text-5xl font-light leading-[1.02] tracking-[-0.035em] text-ink md:text-7xl">
        {title}
      </h1>
      <p className="mt-8 max-w-xl text-base text-ink-dim">{hint}</p>
    </section>
  );
}

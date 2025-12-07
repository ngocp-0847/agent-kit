export function ChangelogHero() {
  return (
    <section className="relative overflow-hidden">
      {/* Gradient blob accent */}
      <div
        className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[400px] gradient-blob opacity-50 pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-4xl px-6 py-24 text-center md:py-32">
        <div className="flex flex-col items-center gap-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-1.5 text-sm text-muted-foreground">
            <span className="size-1.5 rounded-full gradient-bg" />
            Release History
          </div>

          {/* Headline */}
          <h1 className="max-w-2xl text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
            <span className="gradient-text">Changelog</span>
          </h1>

          {/* Subheadline */}
          <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
            Track every update, new feature, and improvement made to cursor-kit.
          </p>
        </div>
      </div>
    </section>
  );
}

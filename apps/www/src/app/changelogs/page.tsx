import { Header } from "@/components/sections/header";
import { Footer } from "@/components/sections/footer";
import { ChangelogHero, ChangelogSection } from "@/components/changelog";
import { parseChangelog } from "@/lib/changelog";

export default function ChangelogsPage() {
  const entries = parseChangelog();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <ChangelogHero />
        <ChangelogSection entries={entries} />
      </main>
      <Footer />
    </div>
  );
}

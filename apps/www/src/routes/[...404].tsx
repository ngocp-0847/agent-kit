import { A } from "@solidjs/router";
import { Title } from "@solidjs/meta";
import { Button } from "../components/ui";

export default function NotFound() {
  return (
    <>
      <Title>404 - Page Not Found | Cursor Kit</Title>
      <main class="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
        <div class="space-y-6">
          <div class="text-8xl font-bold text-gradient">404</div>
          <h1 class="text-2xl lg:text-3xl font-semibold text-[var(--text-primary)]">
            Page Not Found
          </h1>
          <p class="text-[var(--text-secondary)] max-w-md">
            Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
          </p>
          <div class="flex flex-wrap justify-center gap-4 pt-4">
            <A href="/">
              <Button>
                ← Back to Home
              </Button>
            </A>
            <A href="/playground">
              <Button variant="outline">
                CLI Playground
              </Button>
            </A>
          </div>
        </div>
      </main>
    </>
  );
}

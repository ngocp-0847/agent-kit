import { Header } from "@/components/sections/header";
import { HeroSection } from "@/components/sections/hero-section";
import { FeaturesSection } from "@/components/sections/features-section";
import { ScreenshotSection } from "@/components/sections/screenshot-section";
import { BenefitsSection } from "@/components/sections/benefits-section";
import { PricingSection } from "@/components/sections/pricing-section";
import { Footer } from "@/components/sections/footer";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <ScreenshotSection />
        <BenefitsSection />
        <PricingSection />
      </main>
      <Footer />
    </div>
  );
}

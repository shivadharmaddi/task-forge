import { LandingNavbar } from "@/components/landing/navbar";
import { HeroSection } from "@/components/landing/hero";
import { ProblemSection } from "@/components/landing/problem";
import { HowItWorksSection } from "@/components/landing/how-it-works";
import { ArchitectureSection } from "@/components/landing/architecture";
import { FeaturesSection } from "@/components/landing/features";
import { TechnicalSection, DemoCTASection, Footer } from "@/components/landing/sections";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <LandingNavbar />
      <main className="flex-1">
        <HeroSection />
        <ProblemSection />
        <HowItWorksSection />
        <ArchitectureSection />
        <FeaturesSection />
        <TechnicalSection />
        <DemoCTASection />
      </main>
      <Footer />
    </div>
  );
}

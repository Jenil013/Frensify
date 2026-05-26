import React from "react";
import Navbar from "./landing/Navbar";
import HeroSection from "./landing/HeroSection";
import TrustBar from "./landing/TrustBar";
import CoreFeatures from "./landing/CoreFeatures";
import PrepJourney from "./landing/PrepJourney";
import AIPowered from "./landing/AIPowered";
import PricingPreview from "./landing/PricingPreview";
import Testimonials from "./landing/Testimonials";
import FAQ from "./landing/FAQ";
import FinalCTA from "./landing/FinalCTA";
import Footer from "./landing/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF9] text-[#37352F] font-sans selection:bg-[#E3E2E0]/70">
      <Navbar />
      <main>
        <HeroSection />
        <TrustBar />
        <CoreFeatures />
        <PrepJourney />
        <AIPowered />
        <PricingPreview />
        <Testimonials />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}

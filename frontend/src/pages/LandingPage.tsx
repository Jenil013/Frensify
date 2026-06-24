import React from "react";
import Navbar from "./landing/Navbar";
import HeroSection from "./landing/HeroSection";
import CoreFeatures from "./landing/CoreFeatures";
import PrepJourney from "./landing/PrepJourney";
import AIPowered from "./landing/AIPowered";
// import WhyFrenchForCanada from "./landing/WhyFrenchForCanada";
import Testimonials from "./landing/Testimonials";
import PricingPreview from "./landing/PricingPreview";
import FAQ from "./landing/FAQ";
import FinalCTA from "./landing/FinalCTA";
import Footer from "./landing/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FAF9F7] text-[#37352F] font-sans selection:bg-[#E3E2E0]/70">
      <Navbar />
      <main>
        <HeroSection />
        <CoreFeatures />
        <PrepJourney />
        <AIPowered />
        {/* <WhyFrenchForCanada /> */}
        <Testimonials />
        <PricingPreview />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}

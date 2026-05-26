import React from "react";
import { Link } from "react-router-dom";
import FrensifyLogo from "../../components/FrensifyLogo";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#37352F] text-white py-12">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="mb-3 text-white">
              <FrensifyLogo height={28} />
            </div>
            <p className="text-xs text-white/50 leading-relaxed max-w-xs">
              Premium TEF & TCF exam preparation with AI-powered feedback,
              real exam simulations, and personalized study plans.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-[10px] uppercase tracking-widest font-bold text-white/40 mb-4">
              Product
            </h4>
            <ul className="space-y-2.5">
              {["Practice Drills", "Mock Exams", "AI Writing Coach", "Speaking Simulator", "Study Plans"].map(
                (item) => (
                  <li key={item}>
                    <Link
                      to="/app"
                      className="text-xs text-white/60 hover:text-white transition-colors"
                    >
                      {item}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-[10px] uppercase tracking-widest font-bold text-white/40 mb-4">
              Resources
            </h4>
            <ul className="space-y-2.5">
              {["TEF Guide", "TCF Guide", "CEFR Levels", "Blog"].map(
                (item) => (
                  <li key={item}>
                    <span className="text-xs text-white/60 cursor-default">
                      {item}
                    </span>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-[10px] uppercase tracking-widest font-bold text-white/40 mb-4">
              Legal
            </h4>
            <ul className="space-y-2.5">
              {["Privacy Policy", "Terms of Service", "Contact Us"].map(
                (item) => (
                  <li key={item}>
                    <span className="text-xs text-white/60 cursor-default">
                      {item}
                    </span>
                  </li>
                )
              )}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6">
          <p className="text-[10px] text-white/30 text-center">
            &copy; {currentYear} Frensify. All rights reserved. TEF is a registered trademark of the Paris Chamber of Commerce. TCF is a registered trademark of France Education International.
          </p>
        </div>
      </div>
    </footer>
  );
}

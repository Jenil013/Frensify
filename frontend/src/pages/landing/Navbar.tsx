import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import FrensifyLogo from "../../components/FrensifyLogo";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-md border-b border-[#E9E9E7] shadow-premium"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 flex items-center justify-between h-16">
        <Link to="/" className="shrink-0">
          <FrensifyLogo height={32} showSubtext={false} />
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleAnchorClick(e, link.href)}
              className="text-sm font-medium text-[#5F5E5B] hover:text-[#37352F] transition-colors"
            >
              {link.label}
            </a>
          ))}
          <div className="flex items-center gap-3 ml-4">
            <Link
              to="/app"
              className="text-sm font-medium text-[#37352F] hover:text-[#0F47AF] transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/app"
              className="bg-[#002D62] hover:bg-[#001D42] text-white rounded-lg px-5 py-2 text-sm font-semibold transition-all shadow-premium"
            >
              Get Started
            </Link>
          </div>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 text-[#37352F]"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md border-b border-[#E9E9E7] px-6 pb-5 pt-2 space-y-3">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleAnchorClick(e, link.href)}
              className="block text-sm font-medium text-[#5F5E5B] hover:text-[#37352F] py-2"
            >
              {link.label}
            </a>
          ))}
          <div className="flex flex-col gap-2 pt-2 border-t border-[#E9E9E7]">
            <Link
              to="/app"
              className="text-sm font-medium text-[#37352F] py-2"
              onClick={() => setMobileOpen(false)}
            >
              Sign In
            </Link>
            <Link
              to="/app"
              className="bg-[#002D62] text-white rounded-lg px-5 py-2.5 text-sm font-semibold text-center"
              onClick={() => setMobileOpen(false)}
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

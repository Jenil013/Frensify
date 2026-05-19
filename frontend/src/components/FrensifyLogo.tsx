import React from "react";

interface FrensifyLogoProps {
  className?: string;
  height?: number | string;
  showSubtext?: boolean;
}

export default function FrensifyLogo({
  className = "",
  height = 30,
  showSubtext = false,
}: FrensifyLogoProps) {
  // SVG Logo reproducing the uploaded design perfectly.
  // It has correct French colors (navy/blue, gold/yellow, and red) and dashes matching the brand layout.
  return (
    <div className={`flex flex-col items-start ${className}`}>
      <svg
        viewBox="0 0 280 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ height: height, width: "auto" }}
        className="select-none"
      >
        {/* Left dashes */}
        {/* Top left blue dash */}
        <line
          x1="18"
          y1="38"
          x2="28"
          y2="38"
          stroke="#0F47AF"
          strokeWidth="5"
          strokeLinecap="round"
        />
        {/* Middle left cyan dash */}
        <line
          x1="23"
          y1="47"
          x2="30.5"
          y2="52.5"
          stroke="#1E88E5"
          strokeWidth="5"
          strokeLinecap="round"
        />
        {/* Bottom left yellow-gold dash */}
        <line
          x1="31"
          y1="61"
          x2="37"
          y2="53"
          stroke="#F2A600"
          strokeWidth="5"
          strokeLinecap="round"
        />

        {/* Brand text */}
        <text
          x="52"
          y="54"
          fontFamily="system-ui, -apple-system, 'Inter', 'Montserrat', sans-serif"
          fontWeight="900"
          fontSize="36"
          fill="#002D62"
          letterSpacing="1.2"
        >
          FRENSIFY
        </text>

        {/* Right dashes radiating over Y */}
        {/* Top-left radiating blue dash */}
        <line
          x1="223"
          y1="29"
          x2="229.5"
          y2="19.5"
          stroke="#0F47AF"
          strokeWidth="5"
          strokeLinecap="round"
        />
        {/* Top-center radiating yellow dash */}
        <line
          x1="240"
          y1="21"
          x2="240"
          y2="10"
          stroke="#F2A600"
          strokeWidth="5"
          strokeLinecap="round"
        />
        {/* Top-right radiating red dash */}
        <line
          x1="249"
          y1="28"
          x2="257"
          y2="19.5"
          stroke="#D01018"
          strokeWidth="5"
          strokeLinecap="round"
        />
        {/* Far-right horizontal red dash */}
        <line
          x1="252"
          y1="38"
          x2="266"
          y2="38"
          stroke="#D01018"
          strokeWidth="5"
          strokeLinecap="round"
        />
      </svg>
      {showSubtext && (
        <span className="text-[10px] text-[#7A7A78] uppercase tracking-widest font-bold pl-14 mt-[-6px] select-none">
          TEF & TCF EXAM COACH
        </span>
      )}
    </div>
  );
}

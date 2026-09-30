import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 36, className = '' }) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 rounded-full overflow-hidden ${className}`}
      style={{ width: size, height: size }}
      aria-label="TornedoX Logo"
    >
      <svg
        viewBox="0 0 1000 1000"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Crisp circular white base */}
        <circle cx="500" cy="500" r="495" fill="#FFFFFF" />

        {/* Outer Circular Border in #DF9920 */}
        <circle
          cx="500"
          cy="500"
          r="415"
          stroke="#DF9920"
          strokeWidth="38"
          fill="none"
        />

        {/* Central Geometric Interlocking Emblem in #DF9920 */}
        <g stroke="#DF9920" strokeLinecap="round" strokeLinejoin="round">
          {/* Top vertical pill cap */}
          <path
            d="M 445 375 L 445 285 A 25 25 0 0 1 495 285 L 495 375"
            strokeWidth="32"
            fill="none"
          />

          {/* Left Wing Outer Loop (Top track -> 180° curve -> Bottom track) */}
          <path
            d="M 425 320 L 290 320 A 55 55 0 0 0 290 430 L 555 430"
            strokeWidth="32"
            fill="none"
          />

          {/* Left Wing Inner return track */}
          <path
            d="M 425 375 L 310 375 A 20 20 0 0 1 310 335 L 425 335"
            strokeWidth="28"
            fill="none"
          />

          {/* Right Wing Outer Loop (Top track -> 180° curve -> Bottom track) */}
          <path
            d="M 500 320 L 710 320 A 55 55 0 0 1 710 430 L 565 430"
            strokeWidth="32"
            fill="none"
          />

          {/* Right Wing Inner return track */}
          <path
            d="M 500 375 L 690 375 A 20 20 0 0 0 690 335 L 500 335"
            strokeWidth="28"
            fill="none"
          />

          {/* Vertical Stem Outer Loop (Right side down -> 180° bottom U-turn -> Left side up) */}
          <path
            d="M 565 425 L 565 675 A 65 65 0 0 1 435 675 L 435 480"
            strokeWidth="32"
            fill="none"
          />

          {/* Vertical Stem Inner U-loop */}
          <path
            d="M 525 480 L 525 660 A 30 30 0 0 1 475 660 L 475 480"
            strokeWidth="28"
            fill="none"
          />
        </g>
      </svg>
    </div>
  );
};

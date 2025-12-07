import type { SVGProps } from "react";

interface LogoProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

export function Logo({ size = 32, ...props }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <defs>
        {/* Main gradient for the triangle */}
        <linearGradient id="triangleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="50%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#F97316" />
        </linearGradient>
        {/* Shadow/glow effect */}
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Rounded triangle shape */}
      <path
        d="M50 8C52.5 8 54.8 9.3 56.2 11.5L89.5 68.5C91 71 91.2 74 89.8 76.7C88.4 79.4 85.7 81 82.8 81H17.2C14.3 81 11.6 79.4 10.2 76.7C8.8 74 9 71 10.5 68.5L43.8 11.5C45.2 9.3 47.5 8 50 8Z"
        fill="url(#triangleGradient)"
      />

      {/* Fingerprint pattern - concentric arcs */}
      <g stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.9">
        {/* Inner dot/line */}
        <path d="M50 28L50 32" />
        
        {/* First arc layer */}
        <path d="M42 36C42 31 46 28 50 28C54 28 58 31 58 36" />
        
        {/* Second arc layer */}
        <path d="M38 42C38 33 43 26 50 26C57 26 62 33 62 42" />
        
        {/* Third arc layer */}
        <path d="M34 48C34 36 40 27 50 27C60 27 66 36 66 48" />
        
        {/* Fourth arc layer */}
        <path d="M30 55C30 39 38 28 50 28C62 28 70 39 70 55" />
        
        {/* Fifth arc layer */}
        <path d="M26 62C26 42 36 30 50 30C64 30 74 42 74 62" />
        
        {/* Bottom arcs - wrapping around */}
        <path d="M30 68C28 55 35 42 50 42C65 42 72 55 70 68" />
        <path d="M35 72C34 62 40 52 50 52C60 52 66 62 65 72" />
        <path d="M40 74C40 67 44 60 50 60C56 60 60 67 60 74" />
      </g>
    </svg>
  );
}

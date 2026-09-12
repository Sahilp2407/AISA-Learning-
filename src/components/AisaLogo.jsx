import React from 'react';

export default function AisaLogo({ size = 'md', isDark = false, showTag = true, className = '' }) {
  const iconDimensions = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
    xl: 'w-14 h-14'
  };

  const textClasses = {
    sm: 'text-xl tracking-tight',
    md: 'text-2xl tracking-tighter',
    lg: 'text-3xl tracking-tighter',
    xl: 'text-4xl tracking-tighter'
  };

  return (
    <div className={`inline-flex items-center gap-2.5 select-none group cursor-pointer ${className}`}>
      
      {/* 1. ULTRA-PREMIUM ISOMETRIC NEURAL PRISM (Custom Geometric Mark) */}
      <div className={`relative ${iconDimensions[size]} flex-shrink-0`}>
        {/* Ambient Bloom */}
        <div className="absolute inset-0 bg-[#ED7D31] rounded-xl blur-lg opacity-30 group-hover:opacity-60 transition-opacity duration-300" />

        <svg 
          viewBox="0 0 44 44" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="relative w-full h-full drop-shadow-md transition-transform duration-300 group-hover:scale-105"
        >
          {/* Base Background Rounded Square Container with Dark Slate Glass */}
          <rect 
            x="2" 
            y="2" 
            width="40" 
            height="40" 
            rx="12" 
            fill="url(#aisaBgGrad)" 
            stroke="url(#aisaBorderGrad)" 
            strokeWidth="1.2"
          />

          {/* Left Wing / Isometric Facet */}
          <path 
            d="M22 8L10 28L15.5 32L22 21L28.5 32L34 28L22 8Z" 
            fill="url(#aisaFacetLeft)"
          />

          {/* Right Illuminated Shard */}
          <path 
            d="M22 8L34 28L28.5 32L22 17V8Z" 
            fill="url(#aisaFacetRight)"
          />

          {/* Inner Floating Neural Core Diamond */}
          <path 
            d="M22 14L26 21L22 28L18 21L22 14Z" 
            fill="url(#aisaCoreGrad)" 
            className="animate-pulse"
          />

          {/* Top Apex Specular Spark */}
          <circle cx="22" cy="8" r="1.5" fill="#FFFFFF" />

          {/* Definitions & Gradients */}
          <defs>
            <linearGradient id="aisaBgGrad" x1="2" y1="2" x2="42" y2="42" gradientUnits="userSpaceOnUse">
              <stop stopColor="#1C2128" />
              <stop offset="1" stopColor="#0D1117" />
            </linearGradient>

            <linearGradient id="aisaBorderGrad" x1="2" y1="2" x2="42" y2="42" gradientUnits="userSpaceOnUse">
              <stop stopColor="#ED7D31" stopOpacity="0.8" />
              <stop offset="0.5" stopColor="#FFA726" stopOpacity="0.3" />
              <stop offset="1" stopColor="#FFFFFF" stopOpacity="0.1" />
            </linearGradient>

            <linearGradient id="aisaFacetLeft" x1="10" y1="8" x2="34" y2="32" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FF8C3B" />
              <stop offset="0.5" stopColor="#ED7D31" />
              <stop offset="1" stopColor="#C44B05" />
            </linearGradient>

            <linearGradient id="aisaFacetRight" x1="22" y1="8" x2="34" y2="32" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FFA726" />
              <stop offset="0.6" stopColor="#ED7D31" />
              <stop offset="1" stopColor="#8C3502" />
            </linearGradient>

            <linearGradient id="aisaCoreGrad" x1="18" y1="14" x2="26" y2="28" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FFFFFF" />
              <stop offset="0.5" stopColor="#FFE082" />
              <stop offset="1" stopColor="#FF9800" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* 2. WORLD-CLASS SLEEK WORDMARK */}
      <div className="flex items-center gap-1.5">
        <div className="flex items-center tracking-tight">
          <span className={`font-sans font-black ${textClasses[size]} text-[#1A1D20]`}>
            AISA
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#ED7D31] ml-0.5 mb-1 group-hover:scale-125 transition-transform" />
        </div>

        {/* Minimalist AI Subscript Badge */}
        {showTag && (
          <span className="ml-0.5 px-1.5 py-0.5 rounded-md bg-[#161B22] text-[#FFA726] border border-[#ED7D31]/30 font-mono text-[9px] font-black uppercase tracking-widest shadow-2xs">
            AI
          </span>
        )}
      </div>

    </div>
  );
}

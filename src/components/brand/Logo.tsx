"use client";

import React from "react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = "md", showText = true, className = "" }) => {
  const iconSizes = {
    sm: "w-7 h-7",
    md: "w-9 h-9",
    lg: "w-12 h-12",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  return (
    <div className={`flex items-center gap-2.5 select-none cursor-pointer group ${className}`}>
      {/* Abstract Sound-Wave "V" Brand Icon with Facebook Blue */}
      <div
        className={`${iconSizes[size]} rounded-xl bg-gradient-to-tr from-[#1877F2] to-[#0866FF] p-[2px] shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform`}
      >
        <div className="w-full h-full bg-[#0B0F19] rounded-[10px] flex items-center justify-center relative overflow-hidden">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="w-3/5 h-3/5 text-[#1877F2] group-hover:text-blue-400 transition-colors"
          >
            <path
              d="M3 6L9.5 18L14.5 9L18 15L21 6"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className={`font-bold tracking-tight theme-text-primary ${textSizes[size]}`}>
            Vibe<span className="text-[#1877F2]">Space</span>
          </span>
        </div>
      )}
    </div>
  );
};

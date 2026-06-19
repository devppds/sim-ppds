"use client";

import { useEffect, useState } from "react";
import { Layers } from "lucide-react";

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Check if splash has already been shown in this session
    const hasSeenSplash = sessionStorage.getItem("splash_seen");
    
    if (hasSeenSplash) {
      setIsVisible(false);
      return;
    }

    // Show splash if not seen
    setIsVisible(true);

    // Start fading out at 14.2s
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 14200);

    // Remove from DOM at 15s
    const removeTimer = setTimeout(() => {
      setIsVisible(false);
      sessionStorage.setItem("splash_seen", "true");
    }, 15000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      id="splashScreen"
      className={`splash-screen fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 z-[9999] flex flex-col items-center justify-between overflow-hidden transition-opacity duration-800 ${isFadingOut ? "opacity-0" : "opacity-100"}`}
    >
      {/* Animated Floating Orbs */}
      <div className="absolute top-20 left-20 w-80 h-80 bg-blue-500/8 rounded-full blur-3xl splash-orb-1"></div>
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-indigo-500/8 rounded-full blur-3xl splash-orb-2"></div>

      {/* Top Content */}
      <div className="flex-1 flex flex-col items-center justify-center z-10 max-w-4xl px-4 sm:px-6">
        {/* Logo Container */}
        <div className="splash-logo relative mb-8 sm:mb-12">
          <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-3xl bg-white/10 p-3 sm:p-4 backdrop-blur-md flex items-center justify-center shadow-2xl splash-logo-pulse overflow-hidden">
            <img 
              src="/logopondok.png" 
              alt="Logo PPDS" 
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Welcome Text */}
        <h2 className="splash-text-welcome text-3xl sm:text-4xl font-black text-blue-400 mb-3 sm:mb-4 tracking-tighter text-center leading-tight">
          Selamat Datang
        </h2>

        {/* Subtitle */}
        <p className="splash-text-subtitle text-lg sm:text-xl font-bold text-blue-300 mb-4 sm:mb-6 text-center">
          Di Dashboard System Informasi
        </p>

        {/* Main Text with Enhanced Glow */}
        <h1 className="splash-text-main text-3xl sm:text-4xl font-black text-blue-400 mb-6 sm:mb-8 text-center leading-tight">
          Pondok Pesantren Darussalam Lirboyo
        </h1>

        {/* Progress Bar */}
        <div className="w-48 sm:w-64 h-1 bg-slate-700/40 rounded-full overflow-hidden mb-6 sm:mb-8">
          <div className="splash-progress-bar-inner h-full bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-500 rounded-full shadow-lg shadow-blue-500/50"></div>
        </div>
      </div>

      {/* Bottom Content */}
      <div className="z-10 mb-6 sm:mb-10 text-center">
        <p className="splash-text-pesantren text-base sm:text-lg font-bold text-blue-300 mb-4 sm:mb-6">
          Loading Dashboard...
        </p>
        <div className="splash-copyright space-y-1 sm:space-y-2">
          <p className="text-slate-400 text-xs sm:text-sm font-medium">
            Copyright © 2025 Pondok Pesantren Darussalam
          </p>
          <p className="text-slate-500 text-[10px] sm:text-xs font-medium tracking-wider">
            Developed by <span className="text-blue-400 font-bold">DevElzy</span>
          </p>
        </div>
      </div>
    </div>
  );
}

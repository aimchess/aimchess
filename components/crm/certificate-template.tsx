'use client'

import React from 'react'

export interface CertificateData {
  id?: string
  studentName?: string
  aimRating?: number | string
  clubName?: string
  level?: string
  type?: string
  certificateNo?: string
  dateAchieved?: string
  nextTargetRating?: number | string
  nextTargetClub?: string
  verifyUrl?: string
}

export function CertificateTemplate({ data }: { data: CertificateData }) {
  const studentName = data?.studentName || "Student Name"
  const aimRating = data?.aimRating || 1158
  const clubName = data?.clubName || "AIM 1000 CLUB"
  const level = data?.level || (clubName.includes("1000") ? "GOLD LEVEL" : clubName.includes("800") ? "SILVER LEVEL" : clubName.includes("600") ? "BRONZE LEVEL" : clubName.includes("1200") ? "PLATINUM LEVEL" : "GOLD LEVEL")
  
  // Calculate next target rating and club name
  const currentRatingNum = typeof aimRating === 'number' ? aimRating : parseInt(String(aimRating)) || 1158
  const nextTargetNum = data?.nextTargetRating || (currentRatingNum < 600 ? 600 : currentRatingNum < 800 ? 800 : currentRatingNum < 1000 ? 1000 : currentRatingNum < 1200 ? 1200 : currentRatingNum < 1400 ? 1400 : currentRatingNum + 200)
  const nextTargetClubName = data?.nextTargetClub || `AIM ${nextTargetNum} CLUB`
  
  const certNo = data?.certificateNo || (data?.id ? `ARC-1000-2026-${data.id.substring(0, 4).toUpperCase()}` : "ARC-1000-2026-0001")
  const dateAchieved = data?.dateAchieved || "16 July 2026"

  return (
    <div className="printable-cert-container relative w-full min-w-[320px] bg-[#faf9f5] text-[#071938] p-2 sm:p-4 md:p-6 rounded-none shadow-2xl border-[6px] sm:border-[10px] border-[#071938] overflow-hidden select-none font-sans aspect-auto md:aspect-[1.414/1] max-w-[1100px] mx-auto flex flex-col justify-between min-h-[520px] md:min-h-0">
      
      {/* Outer Double Gold Border - Sharp Rectangular Corners */}
      <div className="absolute inset-1.5 sm:inset-2 md:inset-3 border sm:border-2 border-[#d4af37] rounded-none pointer-events-none z-10"></div>
      <div className="absolute inset-2.5 sm:inset-3 md:inset-4 border border-[#c59b27]/40 rounded-none pointer-events-none z-10"></div>

      {/* 4 Corner Ornaments */}
      {/* Top-Left Corner */}
      <div className="absolute top-2 left-2 sm:top-3 sm:left-3 w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 pointer-events-none z-20">
        <svg viewBox="0 0 100 100" className="w-full h-full fill-none stroke-[#c59b27]" strokeWidth="4">
          <path d="M 10 30 L 10 10 L 30 10 M 10 10 L 45 45" />
          <circle cx="10" cy="10" r="4" fill="#c59b27" />
          <path d="M 25 5 L 5 25 M 35 15 L 15 35" strokeWidth="2" opacity="0.8" />
        </svg>
      </div>

      {/* Top-Right Corner */}
      <div className="absolute top-2 right-2 sm:top-3 sm:right-3 w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 pointer-events-none z-20 transform rotate-90">
        <svg viewBox="0 0 100 100" className="w-full h-full fill-none stroke-[#c59b27]" strokeWidth="4">
          <path d="M 10 30 L 10 10 L 30 10 M 10 10 L 45 45" />
          <circle cx="10" cy="10" r="4" fill="#c59b27" />
          <path d="M 25 5 L 5 25 M 35 15 L 15 35" strokeWidth="2" opacity="0.8" />
        </svg>
      </div>

      {/* Bottom-Left Corner */}
      <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 pointer-events-none z-20 transform -rotate-90">
        <svg viewBox="0 0 100 100" className="w-full h-full fill-none stroke-[#c59b27]" strokeWidth="4">
          <path d="M 10 30 L 10 10 L 30 10 M 10 10 L 45 45" />
          <circle cx="10" cy="10" r="4" fill="#c59b27" />
          <path d="M 25 5 L 5 25 M 35 15 L 15 35" strokeWidth="2" opacity="0.8" />
        </svg>
      </div>

      {/* Bottom-Right Corner */}
      <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 pointer-events-none z-20 transform rotate-180">
        <svg viewBox="0 0 100 100" className="w-full h-full fill-none stroke-[#c59b27]" strokeWidth="4">
          <path d="M 10 30 L 10 10 L 30 10 M 10 10 L 45 45" />
          <circle cx="10" cy="10" r="4" fill="#c59b27" />
          <path d="M 25 5 L 5 25 M 35 15 L 15 35" strokeWidth="2" opacity="0.8" />
        </svg>
      </div>

      {/* Background Watermark */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none z-0">
        <img src="/aim-logo.jpeg" alt="Watermark" className="w-64 h-64 md:w-96 md:h-96 object-contain" />
      </div>

      {/* TOP HEADER ROW: Logo (Left) | Main Header (Center) | Official Badge (Right) */}
      <div className="relative z-20 flex items-start justify-between px-1 sm:px-4 pt-1 sm:pt-3">
        
        {/* Left: Full Uncropped Logo */}
        <div className="flex flex-col items-center justify-center w-20 sm:w-32 md:w-44 shrink-0">
          <img 
            src="/aim-logo.jpeg" 
            alt="AIM Chess Academy Logo" 
            className="w-16 h-16 sm:w-24 sm:h-24 md:w-36 md:h-36 object-contain filter drop-shadow-sm" 
          />
        </div>

        {/* Center: Title & Certificate Banner */}
        <div className="flex-1 text-center px-1 sm:px-2">
          <h1 className="text-sm sm:text-xl md:text-3xl font-black text-[#071938] tracking-[0.1em] sm:tracking-[0.2em] uppercase font-serif">
            AIM CHESS ACADEMY
          </h1>
          
          {/* Subtitle flanked with lines */}
          <div className="flex items-center justify-center gap-1 sm:gap-2 my-0.5 sm:my-1">
            <div className="h-[1px] w-6 sm:w-12 md:w-20 bg-gradient-to-r from-transparent to-[#c59b27]"></div>
            <span className="text-[7px] sm:text-[10px] md:text-xs font-bold text-[#0c4a85] tracking-[0.15em] sm:tracking-[0.25em] uppercase">
              ACHIEVE • INSPIRE • MAINTAIN
            </span>
            <div className="h-[1px] w-6 sm:w-12 md:w-20 bg-gradient-to-l from-transparent to-[#c59b27]"></div>
          </div>

          {/* CERTIFICATE OF ACHIEVEMENT */}
          <div className="mt-0.5 sm:mt-1">
            <h2 className="text-base sm:text-2xl md:text-4xl font-serif font-black text-[#b8860b] tracking-[0.1em] sm:tracking-[0.15em] uppercase drop-shadow-sm">
              CERTIFICATE
            </h2>
            <div className="flex items-center justify-center gap-1 sm:gap-2 mt-0.5">
              <div className="h-[1px] sm:h-[1.5px] w-8 sm:w-16 md:w-28 bg-[#c59b27]"></div>
              <span className="text-[9px] sm:text-xs md:text-sm font-black text-[#071938] tracking-[0.15em] sm:tracking-[0.2em] uppercase">
                OF ACHIEVEMENT
              </span>
              <div className="h-[1px] sm:h-[1.5px] w-8 sm:w-16 md:w-28 bg-[#c59b27]"></div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-1 sm:gap-2 mt-1 sm:mt-2">
            <div className="h-[1px] w-4 sm:w-8 md:w-16 bg-[#c59b27]/60"></div>
            <p className="text-[9px] sm:text-[11px] md:text-xs font-medium text-[#071938] italic">
              This certificate is proudly presented to
            </p>
            <div className="h-[1px] w-4 sm:w-8 md:w-16 bg-[#c59b27]/60"></div>
          </div>
        </div>

        {/* Right: Official Member Badge Shield - Sharp Rectangular Edge */}
        <div className="w-20 sm:w-28 md:w-36 shrink-0 flex flex-col items-center">
          <div className="bg-[#071938] text-white border sm:border-2 border-[#c59b27] rounded-none p-1 sm:p-2 text-center w-full shadow-md relative overflow-hidden">
            {/* Gold Header */}
            <p className="text-[7px] sm:text-[9px] md:text-[10px] font-bold tracking-wider uppercase text-amber-200">
              OFFICIAL MEMBER
            </p>

            {/* Stars */}
            <div className="flex justify-center text-amber-400 text-[8px] sm:text-[10px] md:text-xs my-0.5">
              ★ ★ ★ ★ ★
            </div>

            {/* Club Name */}
            <p className="text-[9px] sm:text-xs md:text-sm font-black text-white tracking-wide uppercase leading-tight">
              {clubName}
            </p>

            {/* Crown Icon */}
            <div className="text-amber-400 text-xs sm:text-sm md:text-base mt-0.5">
              👑
            </div>
          </div>
        </div>

      </div>

      {/* MIDDLE SECTION: Student Name & Accomplishment Details */}
      <div className="relative z-20 my-auto text-center px-2 sm:px-6 md:px-12 py-1">
        
        {/* Left Side Tag (Current Rating) - Sharp Rectangular Edge */}
        <div className="printable-cert-side-tag absolute left-1 sm:left-4 top-1/2 -translate-y-1/2 hidden md:flex flex-col items-center w-20 md:w-24 bg-[#071938] text-white border border-2 border-[#c59b27] rounded-none py-1.5 px-1 text-center shadow-lg">
          <p className="text-[7px] md:text-[8px] font-bold uppercase text-amber-200 tracking-wider">CURRENT</p>
          <p className="text-[7px] md:text-[8px] font-bold uppercase text-amber-200 tracking-wider">AIM RATING</p>
          <p className="text-base md:text-xl font-black text-white my-0.5">{aimRating}</p>
          <div className="text-amber-400 text-sm md:text-lg">♔</div>
        </div>

        {/* Right Side Tag (Next Target) - Sharp Rectangular Edge */}
        <div className="printable-cert-side-tag absolute right-1 sm:right-4 top-1/2 -translate-y-1/2 hidden md:flex flex-col items-center w-20 md:w-24 bg-[#071938] text-white border border-2 border-[#c59b27] rounded-none py-1.5 px-1 text-center shadow-lg">
          <p className="text-[7px] md:text-[8px] font-bold uppercase text-amber-200 tracking-wider">NEXT TARGET</p>
          <p className="text-[7px] md:text-[8px] font-bold uppercase text-amber-200 tracking-wider">{nextTargetClubName}</p>
          <p className="text-base md:text-xl font-black text-white my-0.5">{nextTargetNum}</p>
          <div className="text-amber-400 text-sm md:text-lg">🎯</div>
        </div>

        {/* Mobile-Only Rating Bar */}
        <div className="flex md:hidden justify-center items-center gap-3 mb-2">
          <div className="bg-[#071938] text-white border border-[#c59b27] px-3 py-1 flex items-center gap-2 text-[10px]">
            <span className="text-amber-300 font-bold">RATING:</span>
            <span className="font-black text-white">{aimRating}</span>
          </div>
          <div className="bg-[#071938] text-white border border-[#c59b27] px-3 py-1 flex items-center gap-2 text-[10px]">
            <span className="text-amber-300 font-bold">NEXT TARGET:</span>
            <span className="font-black text-white">{nextTargetNum}</span>
          </div>
        </div>

        {/* Student Name */}
        <div className="max-w-xl mx-auto border-b border-[#c59b27]/60 pb-1">
          <span 
            className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-[#071938] block tracking-wide"
            style={{ fontFamily: "'Great Vibes', 'Dancing Script', 'Alex Brush', cursive, serif" }}
          >
            {studentName}
          </span>
        </div>

        {/* Achievement Paragraph */}
        <div className="max-w-2xl mx-auto mt-1 sm:mt-2 space-y-1 sm:space-y-1.5">
          <p className="text-[10px] sm:text-[11px] md:text-xs text-[#071938] font-medium leading-tight">
            for successfully achieving the required rating and becoming an official member of the
          </p>

          {/* AIM 1000 CLUB + Gold Ribbon Banner */}
          <div className="flex flex-col items-center justify-center gap-1 my-0.5 sm:my-1">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-amber-500 text-sm sm:text-base md:text-xl">🏆</span>
              <span className="text-amber-500 text-[10px] sm:text-xs">★ ★</span>
              <span className="text-sm sm:text-base md:text-xl font-black text-[#071938] tracking-wider uppercase">
                {clubName}
              </span>
              <span className="text-amber-500 text-[10px] sm:text-xs">★ ★</span>
              <span className="text-amber-500 text-sm sm:text-base md:text-xl">👑</span>
            </div>

            {/* GOLD LEVEL Ribbon Pill - Sharp Rectangular Edge */}
            <div className="bg-gradient-to-r from-[#c59b27] via-[#e8c468] to-[#c59b27] text-[#071938] font-black text-[9px] sm:text-[10px] md:text-xs px-4 sm:px-6 py-0.5 rounded-none uppercase tracking-widest shadow-sm border border-amber-600/30">
              {level}
            </div>
          </div>

          <p className="text-[9px] sm:text-[10px] md:text-[11px] text-gray-700 font-normal leading-snug max-w-xl mx-auto">
            Your dedication, consistent practice, and commitment to improving your chess skills have earned you this important milestone.
          </p>
          <p className="text-[9px] sm:text-[10px] md:text-[11px] text-gray-700 font-normal leading-snug max-w-xl mx-auto hidden sm:block">
            We congratulate you on this achievement and encourage you to continue your journey towards the next AIM Rating Club.
          </p>
        </div>

      </div>

      {/* BOTTOM SECTION: 4 Info Columns + Navy Ribbon + Footer Bar */}
      <div className="relative z-20 px-1 sm:px-4 pb-1 sm:pb-2">
        
        {/* 4 Details Columns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 border-t border-[#c59b27]/30 pt-1.5 sm:pt-2 text-center max-w-3xl mx-auto">
          
          {/* Col 1: Date Achieved */}
          <div className="flex flex-col items-center justify-center">
            <div className="w-5 h-5 sm:w-7 sm:h-7 rounded-none border border-amber-500/50 flex items-center justify-center text-amber-600 mb-0.5 bg-amber-50/50 text-xs sm:text-base">
              📅
            </div>
            <p className="text-[7px] sm:text-[8px] md:text-[9px] font-bold text-[#071938] uppercase tracking-wider">DATE ACHIEVED</p>
            <p className="text-[9px] sm:text-[10px] md:text-xs font-extrabold text-[#071938]">{dateAchieved}</p>
          </div>

          {/* Col 2: Certificate No. */}
          <div className="flex flex-col items-center justify-center sm:border-l border-gray-200">
            <div className="w-5 h-5 sm:w-7 sm:h-7 rounded-none border border-amber-500/50 flex items-center justify-center text-amber-600 mb-0.5 bg-amber-50/50 text-xs sm:text-base">
              🏅
            </div>
            <p className="text-[7px] sm:text-[8px] md:text-[9px] font-bold text-[#071938] uppercase tracking-wider">CERTIFICATE NO.</p>
            <p className="text-[9px] sm:text-[10px] md:text-xs font-extrabold text-[#071938] font-mono">{certNo}</p>
          </div>

          {/* Col 3: Verify Certificate */}
          <div className="flex flex-col items-center justify-center border-l border-gray-200">
            {/* Simple QR Code Mock SVG */}
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white border border-gray-300 p-0.5 mb-0.5 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-full h-full fill-[#071938]">
                <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm9-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm13-2h2v2h-2v-2zm-4 0h2v2h-2v-2zm4 4h2v2h-2v-2zm-2 2h2v2h-2v-2zm-2-2h2v2h-2v-2zm4 2h2v2h-2v-2z"/>
              </svg>
            </div>
            <p className="text-[7px] sm:text-[8px] md:text-[9px] font-bold text-[#071938] uppercase tracking-wider">VERIFY CERTIFICATE</p>
            <p className="text-[6px] sm:text-[7px] text-gray-500">Scan to verify authenticity</p>
          </div>

          {/* Col 4: Signature */}
          <div className="flex flex-col items-center justify-center border-l border-gray-200 relative">
            <span 
              className="text-base sm:text-lg md:text-xl font-bold text-[#071938] -mb-1"
              style={{ fontFamily: "'Great Vibes', 'Dancing Script', 'Alex Brush', cursive" }}
            >
              Soumen Banerjee
            </span>
            <div className="w-16 sm:w-24 border-t border-gray-300 my-0.5"></div>
            <p className="text-[8px] sm:text-[9px] font-black text-[#071938] uppercase tracking-wider">SOUMEN BANERJEE</p>
            <p className="text-[7px] sm:text-[8px] text-gray-500 font-medium">Founder & Head Coach</p>
            <p className="text-[6px] sm:text-[7px] text-gray-400">AIM Chess Academy</p>
          </div>

        </div>

        {/* Navy Ribbon Banner - Sharp Rectangular Edge */}
        <div className="mt-1.5 sm:mt-2 text-center max-w-2xl mx-auto">
          <div className="bg-[#071938] text-white py-0.5 sm:py-1 px-2 sm:px-4 rounded-none shadow-md border-y border-[#c59b27]">
            <p className="text-[8px] sm:text-[10px] md:text-xs font-black tracking-widest uppercase">
              CONGRATULATIONS ON YOUR OUTSTANDING ACHIEVEMENT!
            </p>
          </div>

          <div className="flex items-center justify-center gap-1 sm:gap-2 mt-0.5 sm:mt-1">
            <div className="h-[1px] w-6 sm:w-10 bg-[#c59b27]/60"></div>
            <span className="text-[8px] sm:text-[9px] md:text-[10px] font-bold text-[#071938] tracking-widest">
              Keep Learning. Keep Improving. Keep Inspiring.
            </span>
            <div className="h-[1px] w-6 sm:w-10 bg-[#c59b27]/60"></div>
          </div>
        </div>

        {/* Footer Links & Chess Icons */}
        <div className="flex flex-wrap items-center justify-between gap-1 text-[7px] sm:text-[8px] md:text-[9px] text-[#071938] font-bold mt-1.5 sm:mt-2 pt-1 border-t border-gray-200">
          <div className="flex items-center gap-1">
            <span>🌐</span> www.aimchessacademy.com
          </div>
          
          <div className="flex items-center gap-1 text-amber-600 text-[10px] sm:text-xs">
            ♔ ♕ ♖ ♗ ♘ ♙
          </div>

          <div className="flex items-center gap-1 text-[#0c4a85]">
            <span className="text-emerald-600 font-black">✓</span> VERIFIED BY AIM CHESS ACADEMY
          </div>
        </div>

      </div>

    </div>
  )
}

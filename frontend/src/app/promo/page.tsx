"use client";

import React, { useState } from "react";

// Themes definition
interface ThemeConfig {
  id: string;
  name: string;
  bg: string;
  cardBg: string;
  textColor: string;
  textMuted: string;
  accentColor: string;
  accentBg: string;
  borderColor: string;
  highlightGlow: string;
}

const THEMES: ThemeConfig[] = [
  {
    id: "midnight-tech",
    name: "Midnight Tech (Dark)",
    bg: "bg-[#0A0F1D]",
    cardBg: "bg-[#111827]/80 border border-slate-800 shadow-2xl",
    textColor: "text-slate-100",
    textMuted: "text-slate-400",
    accentColor: "text-[#10B981]",
    accentBg: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    borderColor: "border-slate-800",
    highlightGlow: "from-emerald-500/20 via-transparent to-transparent",
  },
  {
    id: "mint-fresh",
    name: "Mint Fresh (Light)",
    bg: "bg-[#F4FBF7]",
    cardBg: "bg-white/90 border border-emerald-100 shadow-xl shadow-emerald-50/50",
    textColor: "text-slate-800",
    textMuted: "text-slate-500",
    accentColor: "text-emerald-600",
    accentBg: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    borderColor: "border-emerald-100",
    highlightGlow: "from-emerald-500/10 via-transparent to-transparent",
  },
  {
    id: "solar-amber",
    name: "Solar Amber (Cyber)",
    bg: "bg-[#0F0C08]",
    cardBg: "bg-[#1A1612]/95 border border-[#2D2214] shadow-2xl",
    textColor: "text-amber-50",
    textMuted: "text-amber-200/60",
    accentColor: "text-[#EA580C]",
    accentBg: "bg-orange-500/10 text-orange-400 border border-orange-500/20",
    borderColor: "border-[#2D2214]",
    highlightGlow: "from-orange-500/20 via-transparent to-transparent",
  },
];

const CAPTIONS = [
  {
    id: "staffing",
    title: "Staffing & Labor Firms Focus",
    text: `Managing a field workforce of 10,000+ active staff? 🚀 Say goodbye to lag. 

Our custom virtualized telemetry board loads massive lists instantly with 0ms visual stutter. Filter departments, monitor live geofence compliance, and trigger batch operations (reschedule shifts, check-in, ledger logs) in a single click. 

Built for speed. Designed for scale.
✨ Engineered by Lazy Inventor. 

#StaffingSolutions #HRMS #WorkforceManagement #WebDevelopment #React #NextJS #LazyInventor #SoftwareArchitecture`,
  },
  {
    id: "hrms",
    title: "HRMS Platform Focus",
    text: `Say hello to the ultimate workforce telemetry board. 📡 

We built a high-performance grid supporting:
⚡ Spacer-Row List Virtualization (loads 10k+ rows with 0ms latency)
📍 Live Geofencing Compliance Pulse
🔄 Swipe / Horizontal Mouse-Wheel navigation
🛠️ Single-Row Context menus & floating bulk docks

Provide your operations team with a UI that is as fast as they are.
✨ From Lazy Inventor.

#EnterpriseSoftware #UIUXDesign #FrontendPerformance #TechStack #TailwindCSS #LazyInventor #NextJS`,
  },
];

export default function PromoPage() {
  const [selectedTheme, setSelectedTheme] = useState<string>("midnight-tech");
  const [aspectRatio, setAspectRatio] = useState<"1-1" | "4-5" | "9-16">("4-5");
  const [graphicMode, setGraphicMode] = useState<"preview" | "features">("preview");
  const [copiedCaptionId, setCopiedCaptionId] = useState<string | null>(null);
  const [customTitle, setCustomTitle] = useState("Enterprise Workforce Telemetry");
  const [customSub, setCustomSub] = useState("Sleek, lag-free management for 10,000+ remote staff.");

  const currentTheme = THEMES.find((t) => t.id === selectedTheme) || THEMES[0];

  const handleCopyCaption = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCaptionId(id);
    setTimeout(() => setCopiedCaptionId(null), 2000);
  };

  // Styles for responsive sizing of the canvas in the viewport
  const getCanvasDimensions = () => {
    switch (aspectRatio) {
      case "1-1":
        return { width: "540px", height: "540px", aspect: "1/1" };
      case "4-5":
        return { width: "480px", height: "600px", aspect: "4/5" };
      case "9-16":
        return { width: "380px", height: "675px", aspect: "9/16" };
      default:
        return { width: "480px", height: "600px", aspect: "4/5" };
    }
  };

  const canvasDim = getCanvasDimensions();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col lg:flex-row">
      {/* 1. Control Sidebar panel */}
      <div className="w-full lg:w-[420px] shrink-0 bg-slate-950 border-b lg:border-b-0 lg:border-r border-slate-800 p-6 flex flex-col gap-6 overflow-y-auto max-h-screen">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-lg tracking-tight text-white">Lazy Inventor</span>
            <span className="text-xs text-slate-500 font-semibold px-2 py-0.5 rounded bg-slate-900 border border-slate-800 ml-auto">PROMO KIT</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Customize and screenshot this premium post template to showcase our DataTable component on Instagram.
          </p>
        </div>

        <hr className="border-slate-800" />

        {/* Aspect Ratio selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Instagram Aspect Ratio</label>
          <div className="grid grid-cols-3 gap-2">
            {(["1-1", "4-5", "9-16"] as const).map((ratio) => (
              <button
                key={ratio}
                onClick={() => setAspectRatio(ratio)}
                className={`py-2 px-3 rounded text-xs font-bold transition-all border cursor-pointer ${
                  aspectRatio === ratio
                    ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/10"
                    : "bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700"
                }`}
              >
                {ratio === "1-1" ? "Square (1:1)" : ratio === "4-5" ? "Portrait (4:5)" : "Story (9:16)"}
              </button>
            ))}
          </div>
        </div>

        {/* Theme selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Aesthetic Theme</label>
          <div className="flex flex-col gap-2">
            {THEMES.map((theme) => (
              <button
                key={theme.id}
                onClick={() => setSelectedTheme(theme.id)}
                className={`flex items-center justify-between p-3 rounded text-xs font-semibold transition-all border cursor-pointer ${
                  selectedTheme === theme.id
                    ? "bg-slate-800 border-emerald-500 text-white"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                <span>{theme.name}</span>
                <span className={`w-3 h-3 rounded-full ${theme.id === "midnight-tech" ? "bg-emerald-400" : theme.id === "mint-fresh" ? "bg-emerald-600" : "bg-orange-500"}`} />
              </button>
            ))}
          </div>
        </div>

        {/* Graphic Mode */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Graphic Display Mode</label>
          <div className="grid grid-cols-2 gap-2">
            {(["preview", "features"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setGraphicMode(mode)}
                className={`py-2 px-3 rounded text-xs font-bold transition-all border cursor-pointer ${
                  graphicMode === mode
                    ? "bg-emerald-500 text-slate-950 border-emerald-400"
                    : "bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700"
                }`}
              >
                {mode === "preview" ? "Live UI Table Mock" : "Infographic Highlights"}
              </button>
            ))}
          </div>
        </div>

        {/* Text Customizers */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Custom Titles</label>
          <div className="space-y-2">
            <input
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="Post Main Title"
              className="w-full text-xs bg-slate-900 border border-slate-800 rounded p-2 text-white focus:outline-none focus:border-emerald-500"
            />
            <textarea
              value={customSub}
              onChange={(e) => setCustomSub(e.target.value)}
              placeholder="Post Subtitle / Feature summary"
              rows={2}
              className="w-full text-xs bg-slate-900 border border-slate-800 rounded p-2 text-white focus:outline-none focus:border-emerald-500 resize-none"
            />
          </div>
        </div>

        <hr className="border-slate-800" />

        {/* Social kit captions */}
        <div className="space-y-4">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Ready-to-Use Captions</label>
          {CAPTIONS.map((cap) => (
            <div key={cap.id} className="bg-slate-900 border border-slate-800 rounded p-3 text-xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-300">{cap.title}</span>
                <button
                  onClick={() => handleCopyCaption(cap.id, cap.text)}
                  className="text-[10px] text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 hover:bg-emerald-500/20 transition-all cursor-pointer"
                >
                  {copiedCaptionId === cap.id ? "Copied!" : "Copy Caption"}
                </button>
              </div>
              <p className="text-[11px] text-slate-400 font-mono line-clamp-4 leading-normal whitespace-pre-line">{cap.text}</p>
            </div>
          ))}
        </div>

        {/* Capture Tips */}
        <div className="bg-slate-900/50 border border-slate-800/80 rounded p-3 text-xs text-slate-400 space-y-1">
          <span className="font-bold text-slate-300 flex items-center gap-1.5">
            📸 Capture Instruction:
          </span>
          <p className="text-[11px] leading-relaxed">
            Open Chrome DevTools (<kbd className="bg-slate-800 px-1 rounded text-white text-[9px]">F12</kbd>), press <kbd className="bg-slate-800 px-1 rounded text-white text-[9px]">Ctrl+Shift+P</kbd> (Mac: <kbd className="bg-slate-800 px-1 rounded text-white text-[9px]">Cmd+Shift+P</kbd>), type <code className="text-emerald-400">Capture node screenshot</code>, select the central post container and hit enter. This saves a pixel-perfect image directly!
          </p>
        </div>
      </div>

      {/* 2. Visual Canvas workspace */}
      <div className="flex-1 flex items-center justify-center p-4 lg:p-8 bg-slate-950/40 min-h-[500px]">
        {/* Render Wrapper to center scaling container */}
        <div
          id="instagram-promo-canvas"
          className={`relative overflow-hidden transition-all duration-300 rounded-lg shadow-2xl flex flex-col justify-between p-8 select-none ${currentTheme.bg}`}
          style={{
            width: canvasDim.width,
            height: canvasDim.height,
            aspectRatio: canvasDim.aspect,
          }}
        >
          {/* Top aesthetic ambient elements */}
          <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
          <div className="absolute top-10 right-10 w-48 h-48 rounded-full blur-3xl opacity-35 bg-gradient-to-tr from-emerald-500 via-cyan-500 to-transparent pointer-events-none" />

          {/* Canvas Header */}
          <div className="relative z-10 space-y-2">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${currentTheme.accentBg}`}>
                Featured Telemetry Release
              </span>
              <span className="text-[10px] text-emerald-400/80 font-bold font-mono tracking-tighter">v2.1.0</span>
            </div>
            <h1 className={`text-2xl lg:text-3xl font-black tracking-tight leading-none ${currentTheme.textColor}`}>
              {customTitle}
            </h1>
            <p className={`text-xs font-semibold leading-relaxed max-w-[90%] ${currentTheme.textMuted}`}>
              {customSub}
            </p>
          </div>

          {/* Canvas Centerpiece: Graphics or Mini-Table */}
          <div className="relative z-10 flex-1 my-4 flex items-center justify-center overflow-hidden">
            {graphicMode === "preview" ? (
              /* A stylized, premium representation of our Table Component */
              <div className={`w-full rounded-lg border p-4 flex flex-col gap-3 shadow-2xl ${currentTheme.cardBg}`}>
                <div className="flex items-center justify-between border-b pb-2 border-slate-700/50">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
                    <span className={`text-[10px] font-mono font-bold tracking-wider ml-1.5 ${currentTheme.textMuted}`}>
                      telemetry_active_roster.json
                    </span>
                  </div>
                  <div className="flex gap-1.5">
                    <span className="h-1.5 w-6 rounded-full bg-slate-700" />
                    <span className="h-1.5 w-3 rounded-full bg-slate-600" />
                  </div>
                </div>

                {/* Table Mock Rows */}
                <div className="space-y-2.5">
                  {/* Row 1 */}
                  <div className="flex items-center justify-between gap-3 text-[11px] font-medium border-b border-slate-800/40 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white text-[9px]">
                        JD
                      </div>
                      <div>
                        <div className={`font-bold ${currentTheme.textColor}`}>John Doe</div>
                        <div className="text-[8px] text-slate-500">MEMB-2026-94X</div>
                      </div>
                    </div>
                    <span className="text-[9px] font-semibold text-slate-400 bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded">
                      Logistics Alpha
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> INSIDE RADAR
                    </span>
                  </div>

                  {/* Row 2 */}
                  <div className="flex items-center justify-between gap-3 text-[11px] font-medium border-b border-slate-800/40 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white text-[9px]">
                        SJ
                      </div>
                      <div>
                        <div className={`font-bold ${currentTheme.textColor}`}>Sarah Jenkins</div>
                        <div className="text-[8px] text-slate-500">MEMB-2026-44B</div>
                      </div>
                    </div>
                    <span className="text-[9px] font-semibold text-slate-400 bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded">
                      Engineering Fleet
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-400" /> OUTSIDE BOUNDS
                    </span>
                  </div>

                  {/* Row 3 */}
                  <div className="flex items-center justify-between gap-3 text-[11px] font-medium pb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white text-[9px]">
                        NM
                      </div>
                      <div>
                        <div className={`font-bold ${currentTheme.textColor}`}>Nisha Malik</div>
                        <div className="text-[8px] text-slate-500">MEMB-2026-22M</div>
                      </div>
                    </div>
                    <span className="text-[9px] font-semibold text-slate-400 bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded">
                      DevOps Infra
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> INSIDE RADAR
                    </span>
                  </div>
                </div>

                {/* Performance Footnote */}
                <div className="flex items-center justify-between border-t border-slate-800/60 pt-2 text-[8px] font-semibold text-slate-500">
                  <div className="flex items-center gap-1 text-emerald-500">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>WINDOWED LIST RENDER: ACTIVE (10,000+ ROWS)</span>
                  </div>
                  <span>LATENCY: 0.2ms</span>
                </div>
              </div>
            ) : (
              /* Infographic Key Highlights Layout */
              <div className="grid grid-cols-2 gap-4 w-full px-2">
                <div className={`p-4 rounded-lg border flex flex-col justify-between min-h-[100px] shadow-lg ${currentTheme.cardBg}`}>
                  <div className="text-2xl font-black text-emerald-400 font-mono">10,000+</div>
                  <div className="space-y-1">
                    <div className={`text-[10px] font-bold tracking-wide uppercase ${currentTheme.textColor}`}>Staff Records</div>
                    <div className="text-[9px] text-slate-500 font-medium leading-tight">Virtualized list windows for lag-free scrolling.</div>
                  </div>
                </div>

                <div className={`p-4 rounded-lg border flex flex-col justify-between min-h-[100px] shadow-lg ${currentTheme.cardBg}`}>
                  <div className="text-2xl font-black text-cyan-400 font-mono">0ms</div>
                  <div className="space-y-1">
                    <div className={`text-[10px] font-bold tracking-wide uppercase ${currentTheme.textColor}`}>Render Lag</div>
                    <div className="text-[9px] text-slate-500 font-medium leading-tight">Fast-load dom layout rendering only visible rows.</div>
                  </div>
                </div>

                <div className={`p-4 rounded-lg border flex flex-col justify-between min-h-[100px] shadow-lg ${currentTheme.cardBg}`}>
                  <div className="text-2xl font-black text-orange-400 font-mono">100%</div>
                  <div className="space-y-1">
                    <div className={`text-[10px] font-bold tracking-wide uppercase ${currentTheme.textColor}`}>Geofence Guard</div>
                    <div className="text-[9px] text-slate-500 font-medium leading-tight">Real-time inside/outside boundary telemetry tracking.</div>
                  </div>
                </div>

                <div className={`p-4 rounded-lg border flex flex-col justify-between min-h-[100px] shadow-lg ${currentTheme.cardBg}`}>
                  <div className="text-2xl font-black text-indigo-400 font-mono">1 Click</div>
                  <div className="space-y-1">
                    <div className={`text-[10px] font-bold tracking-wide uppercase ${currentTheme.textColor}`}>Batch Dispatch</div>
                    <div className="text-[9px] text-slate-500 font-medium leading-tight">Context menus and quick floating bulk actions check.</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Canvas Footer (Branding) */}
          <div className="relative z-10 border-t border-slate-700/30 pt-4 flex items-center justify-between">
            <div>
              <div className={`text-[9px] font-bold tracking-widest uppercase opacity-60 ${currentTheme.textColor}`}>
                Product Innovation
              </div>
              <div className={`text-[11px] font-black tracking-tight mt-0.5 ${currentTheme.textColor}`}>
                HRMS Workforce Telemetry Board
              </div>
            </div>
            
            {/* Lazy Inventor signature */}
            <div className="flex items-center bg-emerald-500 px-3.5 py-1.5 rounded-full border border-emerald-400 shadow-md">
              <span className="text-[9px] font-black tracking-wider uppercase text-slate-950">
                Lazy Inventor
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

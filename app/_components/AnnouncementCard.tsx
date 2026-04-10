"use client";

import { useState } from "react";
import { X, Sparkles } from "lucide-react";

interface AnnouncementCardProps {
  title: string;
  description: string;
  collapsed?: boolean;
}

export function AnnouncementCard({ title, description, collapsed = false }: AnnouncementCardProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  // Collapsed: just a glowing dot / sparkle icon
  if (collapsed) {
    return (
      <div className="flex justify-center py-3">
        <div
          className="relative h-8 w-8 rounded-full flex items-center justify-center"
          title={title}
          style={{
            background: "linear-gradient(135deg, #f97316, #fb923c)",
            boxShadow: "0 0 10px rgba(249,115,22,0.5)",
          }}
        >
          <Sparkles className="h-4 w-4 text-white" />
          <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-3 mb-3 rounded-xl overflow-hidden relative"
      style={{
        background: "linear-gradient(135deg, #7c3aed 0%, #f97316 100%)",
        boxShadow: "0 4px 20px rgba(124,58,237,0.35)",

        
      }}
    >
      {/* Shine sweep */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)",
          backgroundSize: "200% 100%",
          animation: "shine 3s infinite",
        }}
      />

      <style>{`
        @keyframes shine {
          0%   { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
      `}</style>

      <div className="relative p-3">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-yellow-300 flex-shrink-0" />
            <span
              className="text-[10px] font-bold uppercase tracking-widest text-yellow-300"
            >
              New Feature
            </span>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="text-white/60 hover:text-white transition flex-shrink-0"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Title */}
        <p className="text-white font-semibold text-[13px] leading-snug mb-1">
          {title}
        </p>

        {/* Description */}
        <p className="text-white/75 text-[11px] leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}

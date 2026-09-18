import React from "react";

export function Footer() {
  return (
    <footer className="border-t border-zinc-800/80 bg-zinc-950 mt-20 py-16 px-4 flex items-center justify-center overflow-hidden">
      <div className="w-full max-w-2xl mx-auto flex items-center justify-center">
        <svg
          viewBox="0 0 720 160"
          className="w-full h-auto select-none overflow-visible"
          aria-label="हम भी पेले गए थे, तुम भी पेले जाओगे"
          role="img"
        >
          <defs>
            {/* Gentle, natural upward arc (∩ shape) with ample headroom */}
            <path
              id="footer-semicircle-arc"
              d="M 30,135 Q 360,20 690,135"
              fill="none"
            />
            {/* Elegant, warm metallic gold-champagne gradient - soft on the eyes, perfectly legible */}
            <linearGradient id="footer-text-warm" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#d4af37" />
              <stop offset="35%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#ffffff" />
              <stop offset="65%" stopColor="#fef08a" />
              <stop offset="100%" stopColor="#d4af37" />
            </linearGradient>

            {/* Soft, subtle warm ambient shadow without blinding blur */}
            <filter id="gentle-glow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#f59e0b" floodOpacity="0.25" />
            </filter>
          </defs>

          {/* Crisp, high-contrast base for perfect Devanagari matra & glyph clarity */}
          <text
            className="font-bold tracking-wide"
            fill="url(#footer-text-warm)"
            filter="url(#gentle-glow)"
            style={{
              fontSize: "27px",
              fontWeight: 700,
              fontFamily:
                '"Noto Sans Devanagari", "Kohinoor Devanagari", "Mangal", "Nirmala UI", system-ui, -apple-system, sans-serif',
            }}
          >
            <textPath
              href="#footer-semicircle-arc"
              startOffset="50%"
              textAnchor="middle"
            >
              हम भी पेले गए थे, तुम भी पेले जाओगे
            </textPath>
          </text>
        </svg>
      </div>
    </footer>
  );
}




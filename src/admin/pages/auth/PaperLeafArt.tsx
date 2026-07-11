/**
 * Decorative paper-cut / layered-leaf illustration used behind the admin
 * login card. Pure SVG so it scales cleanly for both the wide desktop
 * side-panel and the short mobile banner.
 */
export function PaperLeafArt({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 500 500"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter id="paperShadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="6" stdDeviation="10" floodColor="#0a2119" floodOpacity="0.25" />
        </filter>
      </defs>

      {/* base backdrop */}
      <rect x="0" y="0" width="500" height="500" fill="#f4f1ea" />

      {/* back leaf blob */}
      <path
        d="M210,0 C300,0 400,0 500,0 L500,500
           C450,468 432,520 388,486
           C352,458 356,500 312,470
           C270,442 278,500 232,462
           C198,434 206,388 188,346
           C164,290 168,150 210,0 Z"
        fill="#0a2119"
      />

      {/* mid leaf blob, offset for depth */}
      <path
        d="M240,20 C320,20 410,20 500,20 L500,470
           C455,442 438,486 398,456
           C365,432 368,468 328,442
           C292,418 298,468 258,436
           C228,412 234,372 220,336
           C200,286 204,160 240,20 Z"
        fill="#123a2c"
      />

      {/* soft highlight lobe */}
      <path
        d="M280,60 C340,50 400,70 440,110 C400,150 350,150 310,130 C285,117 275,85 280,60 Z"
        fill="#34d399"
        opacity="0.18"
      />

      {/* rear paper wave ribbon */}
      <path
        d="M120,0 C152,64 88,124 140,206
           C182,274 100,346 152,424
           C178,462 144,486 164,500
           L222,500
           C202,480 232,452 202,412
           C172,362 232,304 194,246
           C166,196 224,146 196,96
           C176,56 206,26 186,0 Z"
        fill="#efece3"
        filter="url(#paperShadow)"
      />

      {/* front paper wave ribbon */}
      <path
        d="M160,0 C196,66 130,128 184,212
           C228,282 142,356 196,432
           C224,470 188,488 210,500
           L262,500
           C240,478 272,450 240,408
           C208,358 270,300 230,242
           C200,192 260,142 230,92
           C208,52 240,24 218,0 Z"
        fill="#ffffff"
        filter="url(#paperShadow)"
      />

      {/* small peeking leaf tip + vein */}
      <path
        d="M148,392 C182,368 236,374 268,402
           C236,426 190,436 156,424
           C146,420 144,404 148,392 Z"
        fill="#0e2e24"
      />
      <path
        d="M160,398 C194,386 228,392 254,406"
        stroke="#34d399"
        strokeOpacity="0.55"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default PaperLeafArt;

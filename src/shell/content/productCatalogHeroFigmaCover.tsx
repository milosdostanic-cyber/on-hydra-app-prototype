/**
 * Hero cover — Figma node `4655:133899` multiply overlay (synced viewBox + matrix from latest MCP export).
 * Photo uses object-fit cover (no stretch).
 */
import type { CSSProperties } from 'react';

const HERO_GRADIENT_RECT_OPACITY = 0.2199999988079071;
const GRADIENT_ID = 'productCatalogHeroRadial';

/** Inner wrapper around the photo: Figma `mix-blend-luminosity` + `opacity-13` */
export const productCatalogHeroImageLuminosityWrapperStyle: CSSProperties = {
  position: 'absolute',
  inset: 0,
  overflow: 'hidden',
  mixBlendMode: 'luminosity',
  opacity: 0.13,
  pointerEvents: 'none',
};

/** Scale photo like zoom (crop), never non-uniform stretch when the hero resizes */
export const productCatalogHeroImageObjectCoverStyle: CSSProperties = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  objectPosition: 'center',
  display: 'block',
};

/** Figma multiply layer as DOM SVG (avoids data-URL / background blend quirks). */
export function ProductCatalogHeroMultiplyGradient() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1585 174"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        mixBlendMode: 'multiply',
        pointerEvents: 'none',
      }}
    >
      <defs>
        <radialGradient
          id={GRADIENT_ID}
          gradientUnits="userSpaceOnUse"
          cx="0"
          cy="0"
          r="10"
          gradientTransform="matrix(-79.25 5.4477e-15 1.1314e-14 -28.799 792.5 87)"
        >
          <stop stopColor="rgba(8,59,82,1)" offset="0" />
          <stop stopColor="rgba(23,72,92,1)" offset="0.022708" />
          <stop stopColor="rgba(39,84,103,1)" offset="0.045416" />
          <stop stopColor="rgba(70,108,125,1)" offset="0.090832" />
          <stop stopColor="rgba(101,133,147,1)" offset="0.13625" />
          <stop stopColor="rgba(131,157,168,1)" offset="0.18166" />
          <stop stopColor="rgba(193,206,212,1)" offset="0.2725" />
          <stop stopColor="rgba(255,255,255,1)" offset="0.36333" />
          <stop stopColor="rgba(194,218,229,1)" offset="0.43381" />
          <stop stopColor="rgba(134,182,203,1)" offset="0.50429" />
          <stop stopColor="rgba(103,163,189,1)" offset="0.53953" />
          <stop stopColor="rgba(73,145,176,1)" offset="0.57477" />
          <stop stopColor="rgba(42,127,163,1)" offset="0.61001" />
          <stop stopColor="rgba(27,118,157,1)" offset="0.62763" />
          <stop stopColor="rgba(12,109,150,1)" offset="0.64525" />
        </radialGradient>
      </defs>
      <rect
        x="0"
        y="0"
        width="100%"
        height="100%"
        fill={`url(#${GRADIENT_ID})`}
        opacity={HERO_GRADIENT_RECT_OPACITY}
      />
    </svg>
  );
}

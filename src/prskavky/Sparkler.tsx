import React from "react";
import { random, useCurrentFrame } from "remotion";
import { brand } from "./brand";

/**
 * Procedurální prskavka – drátek + žhavá špička + jiskry.
 * Kreslí se do SVG, souřadnice jsou relativní k `size`.
 */
export const Sparkler: React.FC<{
  size: number;
  intensity?: number; // 0..1
  angle?: number; // náklon drátku ve stupních
  burn?: number; // 0..1 kolik drátku už vyhořelo
  seed?: string;
  showStick?: boolean;
}> = ({ size, intensity = 1, angle = 25, burn = 0.15, seed = "s", showStick = true }) => {
  const frame = useCurrentFrame();
  const c = size / 2;
  const stickLen = size * 0.42;
  const rad = (angle * Math.PI) / 180;
  // drátek: od spodku (base) směrem nahoru, nakloněný o `angle` od svislice
  const dirX = Math.sin(rad);
  const dirY = -Math.cos(rad);
  const baseX = c - dirX * stickLen * 0.15;
  const baseY = c - dirY * stickLen * 1.0;
  const tX = baseX + dirX * stickLen * (1 - burn);
  const tY = baseY + dirY * stickLen * (1 - burn);

  const N = Math.round(70 * intensity);
  const life = 9;
  const streaks: React.ReactNode[] = [];
  for (let i = 0; i < N; i++) {
    const birthOffset = random(`${seed}-b-${i}`) * life;
    const cycle = Math.floor((frame + birthOffset) / life);
    const age = ((frame + birthOffset) % life) / life; // 0..1
    const r1 = random(`${seed}-a-${i}-${cycle}`);
    const r2 = random(`${seed}-v-${i}-${cycle}`);
    const a = r1 * Math.PI * 2;
    const reach = size * (0.12 + r2 * 0.3) * intensity;
    const d = reach * Math.pow(age, 0.6);
    const len = size * 0.04 * (1 - age) + 2;
    const x = tX + Math.cos(a) * d;
    const y = tY + Math.sin(a) * d + age * age * size * 0.04; // trochu gravitace
    const x2 = x - Math.cos(a) * len;
    const y2 = y - Math.sin(a) * len;
    const op = 1 - age;
    streaks.push(
      <line
        key={i}
        x1={x}
        y1={y}
        x2={x2}
        y2={y2}
        stroke={r2 > 0.7 ? brand.colors.sparkHot : brand.colors.spark}
        strokeWidth={Math.max(1.5, size * 0.006)}
        strokeLinecap="round"
        opacity={op}
      />,
    );
    // malé "rozprsknutí" na konci dráhy
    if (r2 > 0.6 && age > 0.55) {
      const bLen = size * 0.018;
      for (let k = 0; k < 3; k++) {
        const ba = a + (k - 1) * 0.9;
        streaks.push(
          <line
            key={`${i}-${k}`}
            x1={x}
            y1={y}
            x2={x + Math.cos(ba) * bLen}
            y2={y + Math.sin(ba) * bLen}
            stroke={brand.colors.sparkHot}
            strokeWidth={Math.max(1, size * 0.004)}
            strokeLinecap="round"
            opacity={op}
          />,
        );
      }
    }
  }

  const flicker = 0.85 + random(`${seed}-f-${frame}`) * 0.3;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: "visible" }}>
      <defs>
        <radialGradient id={`glow-${seed}`}>
          <stop offset="0%" stopColor={brand.colors.sparkHot} stopOpacity={0.95} />
          <stop offset="35%" stopColor={brand.colors.spark} stopOpacity={0.45} />
          <stop offset="100%" stopColor={brand.colors.pink} stopOpacity={0} />
        </radialGradient>
      </defs>
      {showStick ? (
        <>
          <line x1={baseX} y1={baseY} x2={tX} y2={tY} stroke="#8a8a8a" strokeWidth={size * 0.012} strokeLinecap="round" />
          <line
            x1={baseX + dirX * stickLen * 0.3}
            y1={baseY + dirY * stickLen * 0.3}
            x2={tX}
            y2={tY}
            stroke="#5b4a3a"
            strokeWidth={size * 0.022}
            strokeLinecap="round"
          />
        </>
      ) : null}
      <circle cx={tX} cy={tY} r={size * 0.22 * intensity * flicker} fill={`url(#glow-${seed})`} />
      {streaks}
      <circle cx={tX} cy={tY} r={size * 0.018 * flicker} fill="#fff" />
    </svg>
  );
};

import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  interpolate,
  random,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { brand } from "./brand";
import { Sparkler } from "./Sparkler";

/* Sdílené stavební kameny všech Prskavkových videí */

export const DISPLAY = "'Anton', 'Impact', sans-serif";
export const BODY = "'Inter', sans-serif";
export const HAND = "'Caveat', cursive";
export const C = brand.colors;

export const useLayout = () => {
  const { width, height } = useVideoConfig();
  const vertical = height > width;
  const u = Math.min(width, height) / 1080;
  return { width, height, vertical, u };
};

export const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

/** Krátký otřes obrazu při dopadu */
export const shake = (
  frame: number,
  hitFrame: number,
  u: number,
  seed: string,
) => {
  const t = frame - hitFrame;
  if (t < 0 || t > 8) return "translate(0px,0px)";
  const k = (1 - t / 8) * 12 * u;
  return `translate(${(random(`${seed}x${t}`) - 0.5) * k}px, ${(random(`${seed}y${t}`) - 0.5) * k}px)`;
};

/** Bílý záblesk při střihu */
export const Flash: React.FC<{ at: number; strength?: number }> = ({
  at,
  strength = 0.5,
}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [at, at + 2, at + 7], [0, strength, 0], clamp);
  return (
    <AbsoluteFill
      style={{ background: "#fff", opacity: o, pointerEvents: "none" }}
    />
  );
};

/* ---------- duhové papírové pruhy ---------- */
export const Stripes: React.FC<{ dropAt?: number; dim?: number }> = ({
  dropAt = -100,
  dim = 0,
}) => {
  const frame = useCurrentFrame();
  const { vertical } = useLayout();
  // na výšku je pruhů míň, ať nejsou jako nudle
  const list = vertical ? brand.stripes.slice(1, 10) : brand.stripes;
  const total = list.reduce((s, x) => s + x.w, 0);
  return (
    <AbsoluteFill style={{ flexDirection: "row", background: C.ink }}>
      {list.map((s, i) => {
        const p = spring({
          frame: frame - dropAt - i * 1.6,
          fps: 30,
          config: { damping: 15, stiffness: 140 },
        });
        const sway = Math.sin(frame / 30 + i) * 0.4; // papír se lehce „vlní“
        return (
          <div
            key={i}
            style={{
              flex: s.w / total,
              height: "100%",
              background: `linear-gradient(90deg, ${s.c} 0%, ${s.c} 82%, rgba(0,0,0,.06) 100%), ${s.c}`,
              transform: `translateY(${(1 - p) * -110}%) rotate(${sway * 0.2}deg)`,
              transformOrigin: "50% 0%",
              boxShadow: "inset -2px 0 0 rgba(0,0,0,.05)",
            }}
          />
        );
      })}
      <AbsoluteFill style={{ background: C.ink, opacity: dim }} />
    </AbsoluteFill>
  );
};

/** Text na proužku papíru / pásky */
export const Tape: React.FC<{
  children: React.ReactNode;
  bg?: string;
  fg?: string;
  size: number;
  rotate?: number;
  style?: React.CSSProperties;
}> = ({ children, bg = C.paper, fg = C.ink, size, rotate = 0, style }) => (
  <div
    style={{
      fontFamily: DISPLAY,
      fontSize: size,
      lineHeight: 1.05,
      color: fg,
      background: bg,
      padding: `${size * 0.08}px ${size * 0.22}px ${size * 0.1}px`,
      transform: `rotate(${rotate}deg)`,
      boxShadow: `0 ${size * 0.06}px ${size * 0.18}px rgba(0,0,0,.28)`,
      textTransform: "uppercase",
      letterSpacing: size * 0.01,
      whiteSpace: "nowrap",
      ...style,
    }}
  >
    {children}
  </div>
);

/* ---------------- E: packshot ---------------- */
export const FUSE_START = 6;
export const FUSE_END = 40;
export const Packshot: React.FC<{
  cta?: string;
  kicker?: string;
  note?: boolean;
  children?: React.ReactNode;
}> = ({ note = true, cta = brand.copy.cta, kicker, children }) => {
  const frame = useCurrentFrame();
  const { u, vertical } = useLayout();
  const logoIn = spring({
    frame,
    fps: 30,
    config: { damping: 11, stiffness: 150 },
  });
  const ctaIn = spring({ frame: frame - 34, fps: 30, config: { damping: 12 } });
  const noteIn = spring({ frame: frame - 46, fps: 30, config: { damping: 9 } });
  const pulse = 1 + 0.035 * Math.sin(frame / 4);

  const logoW = (vertical ? 920 : 1150) * u;
  const k = logoW / brand.logoSize.w;
  const logoH = brand.logoSize.h * k;

  // jiskra po doutnáku
  const fuse = brand.logoFuse;
  const segLens = fuse
    .slice(1)
    .map((p, i) => Math.hypot(p[0] - fuse[i][0], p[1] - fuse[i][1]));
  const totalLen = segLens.reduce((a, b) => a + b, 0);
  const t = interpolate(frame, [FUSE_START, FUSE_END], [0, 1], clamp);
  let dist = t * totalLen;
  let sx = fuse[0][0];
  let sy = fuse[0][1];
  for (let i = 0; i < segLens.length; i++) {
    if (dist <= segLens[i]) {
      const r = dist / segLens[i];
      sx = fuse[i][0] + (fuse[i + 1][0] - fuse[i][0]) * r;
      sy = fuse[i][1] + (fuse[i + 1][1] - fuse[i][1]) * r;
      break;
    }
    dist -= segLens[i];
    sx = fuse[i + 1][0];
    sy = fuse[i + 1][1];
  }
  const sparkVisible = frame >= FUSE_START - 2 && frame <= FUSE_END + 4;
  const splash = spring({
    frame: frame - FUSE_END,
    fps: 30,
    config: { damping: 6, stiffness: 260 },
  });

  return (
    <AbsoluteFill>
      <Stripes />
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 50 * u,
        }}
      >
        {kicker ? (
          <div
            style={{
              opacity: logoIn,
              transform: `translateY(${(1 - logoIn) * -60 * u}px)`,
            }}
          >
            <Tape
              size={(vertical ? 64 : 60) * u}
              rotate={-2}
              bg={C.pink}
              fg={C.paper}
            >
              {kicker}
            </Tape>
          </div>
        ) : null}
        <div
          style={{
            position: "relative",
            width: logoW,
            height: logoH,
            opacity: logoIn,
            transform: `scale(${1.3 - 0.3 * logoIn})`,
            filter: `drop-shadow(0 ${6 * u}px ${18 * u}px rgba(0,0,0,.25))`,
          }}
        >
          {brand.logo ? (
            <Img
              src={staticFile(brand.logo)}
              style={{ width: "100%", height: "100%" }}
            />
          ) : (
            <div
              style={{
                fontFamily: DISPLAY,
                fontSize: logoH * 0.8,
                color: "#fff",
              }}
            >
              PRSKAVKY
            </div>
          )}
          {/* „prsknutí“ vpravo nahoře poskočí, když jiskra dojede */}
          <div
            style={{
              position: "absolute",
              left: brand.logoSplash[0] * k,
              top: brand.logoSplash[1] * k,
              width: 10,
              height: 10,
              transform: `translate(-50%,-50%) scale(${1 + 0.6 * Math.max(0, splash - 0.6)})`,
            }}
          />
          {sparkVisible ? (
            <div
              style={{
                position: "absolute",
                left: sx * k,
                top: sy * k,
                transform: "translate(-50%,-50%)",
              }}
            >
              <Sparkler
                size={300 * u}
                intensity={0.8}
                seed="fuse"
                showStick={false}
              />
            </div>
          ) : null}
          {frame > FUSE_END && frame < FUSE_END + 14 ? (
            <div
              style={{
                position: "absolute",
                left: brand.logoSplash[0] * k,
                top: brand.logoSplash[1] * k,
                transform: "translate(-50%,-50%)",
                opacity: interpolate(
                  frame,
                  [FUSE_END, FUSE_END + 14],
                  [1, 0],
                  clamp,
                ),
              }}
            >
              <Sparkler
                size={420 * u}
                intensity={1}
                seed="pop"
                showStick={false}
              />
            </div>
          ) : null}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 22 * u,
            opacity: ctaIn,
            transform: `translateY(${(1 - ctaIn) * 50 * u}px)`,
          }}
        >
          <div
            style={{
              fontFamily: DISPLAY,
              textTransform: "uppercase",
              fontSize: 72 * u,
              letterSpacing: 1 * u,
              color: C.paper,
              background: C.ink,
              padding: `${12 * u}px ${50 * u}px ${16 * u}px`,
              borderRadius: 999,
              transform: `scale(${frame > 50 ? pulse : 1})`,
              boxShadow: `0 ${14 * u}px ${30 * u}px rgba(0,0,0,.3)`,
            }}
          >
            {cta} ▶
          </div>
          <div
            style={{
              fontFamily: BODY,
              fontWeight: 700,
              fontSize: 32 * u,
              color: C.ink,
              background: C.paper,
              padding: `${6 * u}px ${18 * u}px`,
            }}
          >
            {brand.copy.platforms}
          </div>
        </div>
      </AbsoluteFill>

      {children}
      {note ? (
        <div
          style={{
            position: "absolute",
            ...(vertical
              ? { left: 70 * u, bottom: 170 * u }
              : { right: 80 * u, bottom: 70 * u }),
            background: C.note,
            color: C.ink,
            fontFamily: HAND,
            fontWeight: 700,
            fontSize: 50 * u,
            lineHeight: 1.0,
            padding: `${18 * u}px ${26 * u}px`,
            width: 400 * u,
            boxShadow: `0 ${14 * u}px ${30 * u}px rgba(0,0,0,.35)`,
            transform: `rotate(${-6 + 3 * (1 - noteIn)}deg) scale(${noteIn})`,
            opacity: noteIn,
          }}
        >
          {brand.copy.disclaimer}
        </div>
      ) : null}
      <Flash at={0} strength={0.4} />
    </AbsoluteFill>
  );
};

/* ---------- zvuk ---------- */
export type SparkCue = {
  from: number;
  dur: number;
  volume?: number;
  offsetSec?: number;
};

/**
 * Hudba + zvuk prskavky.
 * music: soubor v public/, startSec: odkud v tracku začít (s), volume: hlasitost hudby.
 * sparks: kdy zaprská prskavka (snímky videa).
 */
export const Soundtrack: React.FC<{
  music: string;
  startSec: number;
  volume: number;
  duration: number;
  sparks: SparkCue[];
}> = ({ music, startSec, volume, duration, sparks }) => {
  const { fps } = useVideoConfig();
  return (
    <>
      <Audio
        src={staticFile(music)}
        trimBefore={Math.round(startSec * fps)}
        volume={(f) =>
          volume *
          interpolate(
            f,
            [0, 4, duration - 24, duration - 1],
            [0, 1, 1, 0],
            clamp,
          )
        }
      />
      {sparks.map((s, i) => (
        <Sequence key={i} from={s.from} durationInFrames={s.dur}>
          <Audio
            src={staticFile(brand.sfxSparkler)}
            trimBefore={Math.round((s.offsetSec ?? 1 + i * 2.3) * fps)}
            volume={(f) =>
              (s.volume ?? 0.8) *
              interpolate(f, [0, 3, s.dur - 8, s.dur], [0, 1, 1, 0], clamp)
            }
          />
        </Sequence>
      ))}
    </>
  );
};

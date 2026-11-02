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

/*
 * Časování (30 fps) – celkem 14 s = 420 snímků
 *   A  0–48     tma → zapálení prskavky → spadnou duhové pruhy, „Pozor, prská.“
 *   B  48–108   skupinová fotka jako polaroid + „Tři holky. / Žádnej filtr.“
 *   C  108–246  „Mluvíme o … bordelu / chlapech / …“ + pointa
 *   D  246–318  cover podcastu + jména moderátorek
 *   E  318–420  packshot: logo, jiskra přeběhne po doutnáku, CTA, lísteček
 */
export const SCENES = {
  intro: { from: 0, dur: 48 },
  hook: { from: 48, dur: 60 },
  topics: { from: 108, dur: 138 },
  hosts: { from: 246, dur: 72 },
  packshot: { from: 318, dur: 102 },
};
export const PRSKAVKY_DURATION = 420;

const DISPLAY = "'Anton', 'Impact', sans-serif";
const BODY = "'Inter', sans-serif";
const HAND = "'Caveat', cursive";
const C = brand.colors;

const useLayout = () => {
  const { width, height } = useVideoConfig();
  const vertical = height > width;
  const u = Math.min(width, height) / 1080;
  return { width, height, vertical, u };
};

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Krátký otřes obrazu při dopadu */
const shake = (frame: number, hitFrame: number, u: number, seed: string) => {
  const t = frame - hitFrame;
  if (t < 0 || t > 8) return "translate(0px,0px)";
  const k = (1 - t / 8) * 12 * u;
  return `translate(${(random(`${seed}x${t}`) - 0.5) * k}px, ${(random(`${seed}y${t}`) - 0.5) * k}px)`;
};

/** Bílý záblesk při střihu */
const Flash: React.FC<{ at: number; strength?: number }> = ({ at, strength = 0.5 }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [at, at + 2, at + 7], [0, strength, 0], clamp);
  return <AbsoluteFill style={{ background: "#fff", opacity: o, pointerEvents: "none" }} />;
};

/* ---------- duhové papírové pruhy ---------- */
const Stripes: React.FC<{ dropAt?: number; dim?: number }> = ({ dropAt = -100, dim = 0 }) => {
  const frame = useCurrentFrame();
  const { vertical } = useLayout();
  // na výšku je pruhů míň, ať nejsou jako nudle
  const list = vertical ? brand.stripes.slice(1, 10) : brand.stripes;
  const total = list.reduce((s, x) => s + x.w, 0);
  return (
    <AbsoluteFill style={{ flexDirection: "row", background: C.ink }}>
      {list.map((s, i) => {
        const p = spring({ frame: frame - dropAt - i * 1.6, fps: 30, config: { damping: 15, stiffness: 140 } });
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
const Tape: React.FC<{
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

/* ---------------- A: zapálení ---------------- */
const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { u, vertical } = useLayout();
  const ignite = interpolate(frame, [3, 12], [0, 1], clamp);
  const tag = spring({ frame: frame - 22, fps: 30, config: { damping: 10 } });
  const size = (vertical ? 860 : 720) * u;
  return (
    <AbsoluteFill>
      <Stripes dropAt={14} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <Sparkler size={size} intensity={Math.max(0.05, ignite)} seed="intro" burn={interpolate(frame, [0, 48], [0.05, 0.2])} />
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: vertical ? "flex-end" : "flex-end", paddingBottom: (vertical ? 330 : 120) * u }}>
        <div
          style={{
            fontFamily: HAND,
            fontWeight: 700,
            fontSize: 96 * u,
            color: C.ink,
            background: C.paper,
            padding: `${4 * u}px ${34 * u}px ${12 * u}px`,
            opacity: tag,
            transform: `rotate(-4deg) scale(${0.6 + 0.4 * tag})`,
            boxShadow: `0 ${10 * u}px ${24 * u}px rgba(0,0,0,.3)`,
          }}
        >
          {brand.copy.intro}
        </div>
      </AbsoluteFill>
      <Flash at={14} strength={0.6} />
    </AbsoluteFill>
  );
};

/* ---------------- B: hook s fotkou ---------------- */
const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { u, vertical } = useLayout();
  const [l1, l2] = brand.copy.hook;
  const photoIn = spring({ frame, fps: 30, config: { damping: 11, stiffness: 150 } });
  const hit1 = 6;
  const hit2 = 24;
  const s1 = spring({ frame: frame - hit1, fps: 30, config: { damping: 9, stiffness: 200 } });
  const s2 = spring({ frame: frame - hit2, fps: 30, config: { damping: 9, stiffness: 200 } });
  const zoom = interpolate(frame, [0, 60], [1, 1.05]);
  const photo = vertical ? brand.groupPhotoVertical : brand.groupPhotoHorizontal;
  const pw = (vertical ? 780 : 1120) * u;
  const ph = vertical ? pw * (1280 / 853) : pw * (853 / 1280);
  const tapeSize = (vertical ? 150 : 140) * u;

  return (
    <AbsoluteFill style={{ transform: `${shake(frame, hit1, u, "h1")} ${shake(frame, hit2, u, "h2")}` }}>
      <Stripes />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div
          style={{
            background: C.paper,
            padding: `${18 * u}px ${18 * u}px ${70 * u}px`,
            boxShadow: `0 ${30 * u}px ${70 * u}px rgba(0,0,0,.35)`,
            transform: `translateY(${(1 - photoIn) * 900 * u}px) rotate(${-3 + (1 - photoIn) * 14}deg)`,
          }}
        >
          <div style={{ width: pw, height: ph, overflow: "hidden" }}>
            <Img src={staticFile(photo)} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${zoom})` }} />
          </div>
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "space-between", paddingBlock: (vertical ? 150 : 70) * u }}>
        <div style={{ opacity: s1, transform: `scale(${1.8 - 0.8 * s1})` }}>
          <Tape size={tapeSize} rotate={-4}>
            {l1}
          </Tape>
        </div>
        <div style={{ opacity: s2, transform: `scale(${1.8 - 0.8 * s2})` }}>
          <Tape size={tapeSize} rotate={3} bg={C.pink} fg={C.paper}>
            {l2}
          </Tape>
        </div>
      </AbsoluteFill>
      <Flash at={hit2} strength={0.3} />
    </AbsoluteFill>
  );
};

/* ---------------- C: témata ---------------- */
const TOPIC_STEP = 14;
const TOPIC_COLORS = [C.ink, C.pink, C.red, C.purple, C.teal];
const Topics: React.FC = () => {
  const frame = useCurrentFrame();
  const { u, vertical, width } = useLayout();
  const topics = brand.copy.topics;
  const finalAt = topics.length * TOPIC_STEP + 6;
  const idx = Math.min(topics.length - 1, Math.floor(frame / TOPIC_STEP));
  const local = frame - idx * TOPIC_STEP;
  const pop = spring({ frame: local, fps: 30, config: { damping: 10, stiffness: 240 } });
  const showFinal = frame >= finalAt;
  const fin = spring({ frame: frame - finalAt, fps: 30, config: { damping: 13 } });
  const maxW = (vertical ? 900 : 1500) * u;
  const wordSize = Math.min((vertical ? 260 : 300) * u, maxW / (topics[idx].length * 0.5));
  const sparkX = (random(`sx${idx}`) - 0.5) * width * 0.4;
  const rot = (random(`r${idx}`) - 0.5) * 8;

  return (
    <AbsoluteFill>
      <Stripes dim={0.12} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 34 * u }}>
        {!showFinal ? (
          <>
            <Tape size={(vertical ? 84 : 80) * u} rotate={-2}>
              {brand.copy.aboutLead}
            </Tape>
            <div style={{ position: "relative", transform: shake(frame, idx * TOPIC_STEP, u, `t${idx}`) }}>
              <div style={{ opacity: Math.min(1, 0.5 + pop), transform: `scale(${1.6 - 0.6 * pop})` }}>
                <Tape size={wordSize} rotate={rot} bg={TOPIC_COLORS[idx % TOPIC_COLORS.length]} fg={C.paper}>
                  {topics[idx]}
                </Tape>
              </div>
              <div
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "0%",
                  transform: `translate(calc(-50% + ${sparkX}px), -50%)`,
                  opacity: interpolate(local, [0, 3, 11], [1, 1, 0], clamp),
                }}
              >
                <Sparkler size={380 * u} intensity={0.75} seed={`tp${idx}`} showStick={false} />
              </div>
            </div>
          </>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 22 * u,
              opacity: fin,
              transform: `translateY(${(1 - fin) * 80 * u}px)`,
            }}
          >
            <Tape size={(vertical ? 92 : 96) * u} rotate={-2}>
              {brand.copy.topicsFinalA}
            </Tape>
            <Tape
              size={(vertical ? 92 : 110) * u}
              rotate={2}
              bg={C.pink}
              fg={C.paper}
              style={vertical ? { whiteSpace: "normal", textAlign: "center", maxWidth: 900 * u } : undefined}
            >
              {brand.copy.topicsFinalB}
            </Tape>
          </div>
        )}
      </AbsoluteFill>
      <Flash at={finalAt} strength={0.35} />
    </AbsoluteFill>
  );
};

/* ---------------- D: cover + jména ---------------- */
const Hosts: React.FC = () => {
  const frame = useCurrentFrame();
  const { u, vertical } = useLayout();
  const zoom = interpolate(frame, [0, 72], [1.12, 1]);
  const coverIn = spring({ frame, fps: 30, config: { damping: 14 } });
  const size = vertical ? 1080 * u : 1080 * u;
  return (
    <AbsoluteFill>
      <Stripes />
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          flexDirection: vertical ? "column" : "row",
          gap: (vertical ? 50 : 70) * u,
        }}
      >
        <div
          style={{
            width: vertical ? size : size * 0.9,
            height: vertical ? size : size * 0.9,
            overflow: "hidden",
            boxShadow: vertical ? "none" : `0 ${30 * u}px ${70 * u}px rgba(0,0,0,.35)`,
            opacity: coverIn,
          }}
        >
          <Img src={staticFile(brand.cover)} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${zoom})` }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: vertical ? "center" : "flex-start", gap: 14 * u }}>
          {brand.hosts.map((name, i) => {
            const s = spring({ frame: frame - 10 - i * 6, fps: 30, config: { damping: 12 } });
            return (
              <div key={name} style={{ opacity: s, transform: `translateX(${(1 - s) * 200 * u}px)` }}>
                <Tape size={(vertical ? 62 : 70) * u} rotate={[-2, 1.5, -1][i]} bg={i === 1 ? C.pink : C.paper} fg={i === 1 ? C.paper : C.ink}>
                  {name}
                </Tape>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------------- E: packshot ---------------- */
const FUSE_START = 6;
const FUSE_END = 40;
const Packshot: React.FC = () => {
  const frame = useCurrentFrame();
  const { u, vertical } = useLayout();
  const logoIn = spring({ frame, fps: 30, config: { damping: 11, stiffness: 150 } });
  const ctaIn = spring({ frame: frame - 34, fps: 30, config: { damping: 12 } });
  const noteIn = spring({ frame: frame - 46, fps: 30, config: { damping: 9 } });
  const pulse = 1 + 0.035 * Math.sin(frame / 4);

  const logoW = (vertical ? 920 : 1150) * u;
  const k = logoW / brand.logoSize.w;
  const logoH = brand.logoSize.h * k;

  // jiskra po doutnáku
  const fuse = brand.logoFuse;
  const segLens = fuse.slice(1).map((p, i) => Math.hypot(p[0] - fuse[i][0], p[1] - fuse[i][1]));
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
  const splash = spring({ frame: frame - FUSE_END, fps: 30, config: { damping: 6, stiffness: 260 } });

  return (
    <AbsoluteFill>
      <Stripes />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 50 * u }}>
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
            <Img src={staticFile(brand.logo)} style={{ width: "100%", height: "100%" }} />
          ) : (
            <div style={{ fontFamily: DISPLAY, fontSize: logoH * 0.8, color: "#fff" }}>PRSKAVKY</div>
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
            <div style={{ position: "absolute", left: sx * k, top: sy * k, transform: "translate(-50%,-50%)" }}>
              <Sparkler size={300 * u} intensity={0.8} seed="fuse" showStick={false} />
            </div>
          ) : null}
          {frame > FUSE_END && frame < FUSE_END + 14 ? (
            <div
              style={{
                position: "absolute",
                left: brand.logoSplash[0] * k,
                top: brand.logoSplash[1] * k,
                transform: "translate(-50%,-50%)",
                opacity: interpolate(frame, [FUSE_END, FUSE_END + 14], [1, 0], clamp),
              }}
            >
              <Sparkler size={420 * u} intensity={1} seed="pop" showStick={false} />
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
            {brand.copy.cta} ▶
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

      <div
        style={{
          position: "absolute",
          ...(vertical ? { left: 70 * u, bottom: 170 * u } : { right: 80 * u, bottom: 70 * u }),
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
      <Flash at={0} strength={0.4} />
    </AbsoluteFill>
  );
};

/* ---------------- celé video ---------------- */
export const Prskavky: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: C.ink }}>
      <Sequence from={SCENES.intro.from} durationInFrames={SCENES.intro.dur}>
        <Intro />
      </Sequence>
      <Sequence from={SCENES.hook.from} durationInFrames={SCENES.hook.dur}>
        <Hook />
      </Sequence>
      <Sequence from={SCENES.topics.from} durationInFrames={SCENES.topics.dur}>
        <Topics />
      </Sequence>
      <Sequence from={SCENES.hosts.from} durationInFrames={SCENES.hosts.dur}>
        <Hosts />
      </Sequence>
      <Sequence from={SCENES.packshot.from} durationInFrames={SCENES.packshot.dur}>
        <Packshot />
      </Sequence>
      {brand.music ? <Audio src={staticFile(brand.music)} /> : null}
    </AbsoluteFill>
  );
};

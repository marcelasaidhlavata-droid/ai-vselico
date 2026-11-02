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
 *   A  0–48     zapálení prskavky         „Pozor, prská.“
 *   B  48–108   hook                      „Tři holky. / Žádnej filtr.“
 *   C  108–246  témata                    „Mluvíme o … bordelu / chlapech / …“ + pointa
 *   D  246–318  moderátorky               3 karty (zatím zástupné siluety)
 *   E  318–420  packshot                  logo + CTA + lísteček s disclaimerem
 */
export const SCENES = {
  intro: { from: 0, dur: 48 },
  hook: { from: 48, dur: 60 },
  topics: { from: 108, dur: 138 },
  hosts: { from: 246, dur: 72 },
  packshot: { from: 318, dur: 102 },
};
export const PRSKAVKY_DURATION = 420;

const DISPLAY = "'Archivo Black', 'Inter', sans-serif";
const BODY = "'Inter', sans-serif";
const HAND = "'Caveat', cursive";

/** Jednotka velikosti: 1 u = 1 px při kratší straně 1080 */
const useLayout = () => {
  const { width, height } = useVideoConfig();
  const vertical = height > width;
  const u = Math.min(width, height) / 1080;
  return { width, height, vertical, u };
};

/** Krátký „otřes“ obrazu při dopadu slova */
const shake = (frame: number, hitFrame: number, u: number, seed: string) => {
  const t = frame - hitFrame;
  if (t < 0 || t > 8) return "translate(0px,0px)";
  const k = (1 - t / 8) * 10 * u;
  return `translate(${(random(`${seed}x${t}`) - 0.5) * k}px, ${(random(`${seed}y${t}`) - 0.5) * k}px)`;
};

/** Záblesk při střihu */
const Flash: React.FC<{ at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [at, at + 2, at + 7], [0, 0.35, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return <AbsoluteFill style={{ background: brand.colors.sparkHot, opacity: o, mixBlendMode: "screen" }} />;
};

const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const { u } = useLayout();
  // drobné poletující jiskřičky v pozadí
  const dots = new Array(40).fill(0).map((_, i) => {
    const x = random(`bx${i}`) * 100;
    const speed = 0.08 + random(`bs${i}`) * 0.2;
    const y = (100 + ((random(`by${i}`) * 100 - frame * speed) % 100)) % 100;
    const tw = 0.3 + 0.7 * Math.abs(Math.sin(frame / (6 + random(`bt${i}`) * 10) + i));
    return (
      <div
        key={i}
        style={{
          position: "absolute",
          left: `${x}%`,
          top: `${y}%`,
          width: 4 * u,
          height: 4 * u,
          borderRadius: 99,
          background: brand.colors.spark,
          opacity: tw * 0.5,
          boxShadow: `0 0 ${10 * u}px ${brand.colors.spark}`,
        }}
      />
    );
  });
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at 50% 40%, ${brand.colors.bg2} 0%, ${brand.colors.bg} 70%)`,
      }}
    >
      {dots}
    </AbsoluteFill>
  );
};

/* ---------------- A: zapálení ---------------- */
const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { u, vertical } = useLayout();
  const ignite = interpolate(frame, [4, 16], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const textIn = spring({ frame: frame - 16, fps: 30, config: { damping: 12 } });
  const size = (vertical ? 900 : 760) * u;
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
      <div style={{ opacity: ignite > 0 ? 1 : 0.4 }}>
        <Sparkler size={size} intensity={Math.max(0.05, ignite)} seed="intro" burn={interpolate(frame, [0, 48], [0.05, 0.2])} />
      </div>
      <div
        style={{
          position: "absolute",
          bottom: vertical ? "16%" : "8%",
          fontFamily: HAND,
          fontWeight: 700,
          fontSize: 92 * u,
          color: brand.colors.text,
          opacity: textIn,
          transform: `rotate(-4deg) scale(${0.8 + 0.2 * textIn})`,
        }}
      >
        {brand.copy.intro}
      </div>
    </AbsoluteFill>
  );
};

/* ---------------- B: hook ---------------- */
const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { u, vertical } = useLayout();
  const [l1, l2] = brand.copy.hook;
  const hit1 = 0;
  const hit2 = 22;
  const s1 = spring({ frame: frame - hit1, fps: 30, config: { damping: 9, stiffness: 180 } });
  const s2 = spring({ frame: frame - hit2, fps: 30, config: { damping: 9, stiffness: 180 } });
  const big = (vertical ? 150 : 160) * u;
  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        transform: `${shake(frame, hit1, u, "h1")} ${shake(frame, hit2, u, "h2")}`,
      }}
    >
      <div
        style={{
          fontFamily: DISPLAY,
          fontSize: big,
          color: brand.colors.text,
          lineHeight: 1,
          transform: `scale(${2 - s1})`,
          opacity: s1,
          textAlign: "center",
        }}
      >
        {l1}
      </div>
      <div
        style={{
          marginTop: 30 * u,
          fontFamily: DISPLAY,
          fontSize: big,
          lineHeight: 1,
          color: brand.colors.bg,
          background: brand.colors.accent,
          padding: `${10 * u}px ${36 * u}px ${22 * u}px`,
          transform: `scale(${2 - s2}) rotate(${-3 * s2}deg)`,
          opacity: s2,
          textAlign: "center",
        }}
      >
        {l2}
      </div>
      <Flash at={hit2} />
    </AbsoluteFill>
  );
};

/* ---------------- C: témata ---------------- */
const TOPIC_STEP = 14; // snímků na jedno slovo
const Topics: React.FC = () => {
  const frame = useCurrentFrame();
  const { u, vertical, width } = useLayout();
  const topics = brand.copy.topics;
  const finalAt = topics.length * TOPIC_STEP + 6;
  const idx = Math.min(topics.length - 1, Math.floor(frame / TOPIC_STEP));
  const local = frame - idx * TOPIC_STEP;
  const pop = spring({ frame: local, fps: 30, config: { damping: 10, stiffness: 220 } });
  const showFinal = frame >= finalAt;
  const fin = spring({ frame: frame - finalAt, fps: 30, config: { damping: 14 } });
  const leadSize = (vertical ? 84 : 80) * u;
  // velikost slova podle délky, aby se vešlo na šířku (Archivo Black ≈ 0.78 em / znak)
  const maxW = (vertical ? 960 : 1600) * u;
  const wordSize = Math.min((vertical ? 210 : 220) * u, maxW / (topics[idx].length * 0.78));
  // jiskra „přeskakuje“ na každé nové slovo
  const sparkX = (random(`sx${idx}`) - 0.5) * width * 0.5;

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
      <div
        style={{
          fontFamily: BODY,
          fontWeight: 800,
          fontSize: leadSize,
          color: brand.colors.spark,
          letterSpacing: 2 * u,
          marginBottom: 20 * u,
          opacity: showFinal ? 1 - fin : 1,
        }}
      >
        {brand.copy.aboutLead}
      </div>
      {!showFinal ? (
        <div style={{ position: "relative", transform: shake(frame, idx * TOPIC_STEP, u, `t${idx}`) }}>
          <div
            style={{
              fontFamily: DISPLAY,
              fontSize: wordSize,
              lineHeight: 1,
              color: idx % 2 === 0 ? brand.colors.text : brand.colors.accent,
              transform: `scale(${1.6 - 0.6 * pop})`,
              opacity: Math.min(1, 0.5 + pop),
            }}
          >
            {topics[idx]}
          </div>
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: `translate(calc(-50% + ${sparkX}px), -110%)`,
              opacity: interpolate(local, [0, 3, 10], [1, 1, 0], { extrapolateRight: "clamp" }),
            }}
          >
            <Sparkler size={360 * u} intensity={0.7} seed={`tp${idx}`} showStick={false} />
          </div>
        </div>
      ) : (
        <div
          style={{
            position: "absolute",
            fontFamily: DISPLAY,
            fontSize: (vertical ? 108 : 104) * u,
            lineHeight: 1.08,
            color: brand.colors.text,
            textAlign: "center",
            maxWidth: vertical ? 960 * u : 1500 * u,
            opacity: fin,
            transform: `translateY(${(1 - fin) * 60 * u}px)`,
          }}
        >
          {/* pointa: zvýraznění konce */}
          {(() => {
            const t = brand.copy.topicsFinal;
            const cut = t.indexOf("slušný");
            if (cut < 0) return t;
            return (
              <>
                {t.slice(0, cut)}
                <span style={{ color: brand.colors.accent }}>{t.slice(cut)}</span>
              </>
            );
          })()}
        </div>
      )}
      <Flash at={finalAt} />
    </AbsoluteFill>
  );
};

/* ---------------- D: moderátorky ---------------- */
const HostCard: React.FC<{ name: string; photo: string | null; i: number; size: number }> = ({
  name,
  photo,
  i,
  size,
}) => {
  const frame = useCurrentFrame();
  const { u } = useLayout();
  const s = spring({ frame: frame - i * 6, fps: 30, config: { damping: 11 } });
  const tilt = [-6, 3, -2][i % 3];
  const initial = name.split(" ").slice(-1)[0][0];
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        transform: `translateY(${(1 - s) * 200 * u}px) rotate(${tilt * s}deg)`,
        opacity: s,
      }}
    >
      <div
        style={{
          width: size,
          height: size * 1.2,
          background: brand.colors.text,
          padding: 14 * u,
          paddingBottom: 14 * u,
          boxShadow: `0 ${20 * u}px ${50 * u}px rgba(0,0,0,.5)`,
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            background: photo ? undefined : `linear-gradient(160deg, ${brand.colors.accent}, ${brand.colors.bg2})`,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {photo ? (
            <Img src={staticFile(photo)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <>
              {/* zástupná silueta */}
              <div
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "22%",
                  width: size * 0.38,
                  height: size * 0.38,
                  borderRadius: 999,
                  transform: "translateX(-50%)",
                  background: "rgba(255,246,236,.35)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: "50%",
                  bottom: "-12%",
                  width: size * 0.78,
                  height: size * 0.6,
                  borderRadius: "50% 50% 0 0",
                  transform: "translateX(-50%)",
                  background: "rgba(255,246,236,.35)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  right: 10 * u,
                  top: 6 * u,
                  fontFamily: DISPLAY,
                  fontSize: 60 * u,
                  color: brand.colors.text,
                }}
              >
                {initial}
              </div>
              <div
                style={{
                  position: "absolute",
                  left: 10 * u,
                  top: 12 * u,
                  fontFamily: BODY,
                  fontWeight: 700,
                  fontSize: 18 * u,
                  color: brand.colors.text,
                  background: "rgba(0,0,0,.35)",
                  padding: `${2 * u}px ${8 * u}px`,
                }}
              >
                FOTO
              </div>
            </>
          )}
        </div>
      </div>
      <div
        style={{
          marginTop: 22 * u,
          fontFamily: HAND,
          fontWeight: 700,
          fontSize: 54 * u,
          color: brand.colors.text,
          whiteSpace: "nowrap",
        }}
      >
        {name}
      </div>
    </div>
  );
};

const Hosts: React.FC = () => {
  const frame = useCurrentFrame();
  const { u, vertical } = useLayout();
  const title = spring({ frame: frame - 18, fps: 30, config: { damping: 12 } });
  const cardSize = (vertical ? 290 : 300) * u;
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
      <div style={{ display: "flex", gap: (vertical ? 36 : 70) * u }}>
        {brand.hosts.map((h, i) => (
          <HostCard key={h.name} name={h.name} photo={h.photo} i={i} size={cardSize} />
        ))}
      </div>
      <div
        style={{
          marginTop: (vertical ? 80 : 50) * u,
          fontFamily: DISPLAY,
          fontSize: (vertical ? 82 : 76) * u,
          color: brand.colors.spark,
          opacity: title,
          transform: `scale(${1.3 - 0.3 * title})`,
          textAlign: "center",
        }}
      >
        Jsou to Prskavky.
      </div>
    </AbsoluteFill>
  );
};

/* ---------------- E: packshot ---------------- */
const Packshot: React.FC = () => {
  const frame = useCurrentFrame();
  const { u, vertical } = useLayout();
  const logoIn = spring({ frame, fps: 30, config: { damping: 10, stiffness: 160 } });
  const ctaIn = spring({ frame: frame - 14, fps: 30, config: { damping: 12 } });
  const noteIn = spring({ frame: frame - 30, fps: 30, config: { damping: 9 } });
  const pulse = 1 + 0.03 * Math.sin(frame / 4);
  const logoSize = (vertical ? 145 : 210) * u;

  const logo = brand.logo ? (
    <Img src={staticFile(brand.logo)} style={{ height: logoSize * 1.6 }} />
  ) : (
    <div style={{ position: "relative" }}>
      <div
        style={{
          fontFamily: DISPLAY,
          fontSize: logoSize,
          lineHeight: 1,
          color: brand.colors.text,
          letterSpacing: -2 * u,
          textShadow: `0 0 ${40 * u}px ${brand.colors.spark}88`,
        }}
      >
        PRSKAVKY
      </div>
      <div
        style={{
          position: "absolute",
          right: (vertical ? -110 : -150) * u,
          top: (vertical ? -170 : -150) * u,
        }}
      >
        <Sparkler size={300 * u} intensity={0.8} seed="logo" showStick={false} />
      </div>
      <div
        style={{
          fontFamily: BODY,
          fontWeight: 700,
          fontSize: 30 * u,
          color: brand.colors.spark,
          letterSpacing: 10 * u,
          textAlign: "center",
          marginTop: 10 * u,
        }}
      >
        PODCAST
      </div>
    </div>
  );

  const note = (
    <div
      style={{
        background: brand.colors.note,
        color: brand.colors.noteText,
        fontFamily: HAND,
        fontWeight: 700,
        fontSize: 46 * u,
        lineHeight: 1.05,
        padding: `${18 * u}px ${26 * u}px`,
        width: 380 * u,
        boxShadow: `0 ${14 * u}px ${30 * u}px rgba(0,0,0,.45)`,
        transform: `rotate(${-7 + 3 * (1 - noteIn)}deg) scale(${noteIn})`,
        opacity: noteIn,
      }}
    >
      {brand.copy.disclaimer}
    </div>
  );

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
      <div style={{ transform: `scale(${1.4 - 0.4 * logoIn})`, opacity: logoIn }}>{logo}</div>
      <div
        style={{
          marginTop: 60 * u,
          fontFamily: DISPLAY,
          fontSize: 58 * u,
          color: brand.colors.bg,
          background: brand.colors.accent,
          padding: `${16 * u}px ${44 * u}px ${24 * u}px`,
          borderRadius: 999,
          opacity: ctaIn,
          transform: `translateY(${(1 - ctaIn) * 40 * u}px) scale(${frame > 30 ? pulse : 1})`,
        }}
      >
        {brand.copy.cta} ▶
      </div>
      <div
        style={{
          marginTop: 26 * u,
          fontFamily: BODY,
          fontWeight: 600,
          fontSize: 32 * u,
          color: brand.colors.text,
          opacity: ctaIn * 0.85,
        }}
      >
        {brand.copy.platforms}
      </div>
      <div
        style={{
          position: "absolute",
          ...(vertical ? { left: 70 * u, bottom: 130 * u } : { right: 90 * u, bottom: 90 * u }),
        }}
      >
        {note}
      </div>
      <Flash at={0} />
    </AbsoluteFill>
  );
};

/* ---------------- celé video ---------------- */
export const Prskavky: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: brand.colors.bg }}>
      <Background />
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

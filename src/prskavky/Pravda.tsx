import React from "react";
import { AbsoluteFill, Sequence, spring, useCurrentFrame } from "remotion";
import { brand } from "./brand";
import {
  C,
  DISPLAY,
  Flash,
  Packshot,
  Stripes,
  Tape,
  shake,
  useLayout,
  Soundtrack,
} from "./common";

/*
 * VARIANTA 2 – „Může a nemusí být pravda“
 * Absurdní historky z dílu o bordelu, po každé dopadne razítko.
 *
 *   0–36     hook „Stalo se to, nebo ne?“
 *   36–276   3 historky × 80 snímků (citát → razítko)
 *   276–318  pointa: disclaimer podcastu
 *   318–420  packshot
 */
export const PRAVDA_DURATION = 450; // 15 s – požadavek Economia Videospot

const COPY = {
  hook: ["Stalo se to,", "nebo ne?"],
  claims: [
    {
      text: "Přišla jsem o špičku nosu. Protože jsem uklízela.",
      stamp: "Pravda",
      color: C.teal,
    },
    {
      text: "Robotický vysavač se mi skoro oběsil na schodech.",
      stamp: "???",
      color: C.purple,
    },
    {
      text: "Sedla jsem si v autě do rozteklé čokolády.",
      stamp: "Bohužel pravda",
      color: C.red,
    },
  ],
  outroA: "Všechno může a nemusí být pravda.",
  outroB: "Ve jménu humoru.",
  kicker: "Díl o bordelu",
};

const CLAIM_LEN = 80;
const STAMP_AT = 40;

const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { u, vertical } = useLayout();
  const s1 = spring({
    frame: frame - 12,
    fps: 30,
    config: { damping: 9, stiffness: 200 },
  });
  const s2 = spring({
    frame: frame - 20,
    fps: 30,
    config: { damping: 9, stiffness: 200 },
  });
  const size = (vertical ? 150 : 150) * u;
  return (
    <AbsoluteFill>
      <Stripes dropAt={0} />
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 24 * u,
          transform: shake(frame, 20, u, "ph"),
        }}
      >
        <div style={{ opacity: s1, transform: `scale(${1.8 - 0.8 * s1})` }}>
          <Tape size={size} rotate={-3}>
            {COPY.hook[0]}
          </Tape>
        </div>
        <div style={{ opacity: s2, transform: `scale(${1.8 - 0.8 * s2})` }}>
          <Tape size={size} rotate={2} bg={C.pink} fg={C.paper}>
            {COPY.hook[1]}
          </Tape>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Stamp: React.FC<{
  text: string;
  color: string;
  size: number;
  t: number;
}> = ({ text, color, size, t }) => {
  // t = snímky od dopadu razítka
  const s = spring({
    frame: t,
    fps: 30,
    config: { damping: 8, stiffness: 300 },
  });
  return (
    <div
      style={{
        fontFamily: DISPLAY,
        textTransform: "uppercase",
        fontSize: size,
        lineHeight: 1,
        color,
        border: `${size * 0.09}px solid ${color}`,
        borderRadius: size * 0.12,
        padding: `${size * 0.12}px ${size * 0.3}px ${size * 0.14}px`,
        transform: `rotate(-8deg) scale(${3 - 2 * s})`,
        opacity: Math.min(1, s * 1.4),
        background: "rgba(255,253,248,.82)",
        whiteSpace: "nowrap",
        mixBlendMode: "multiply",
        letterSpacing: size * 0.03,
      }}
    >
      {text}
    </div>
  );
};

const Claim: React.FC<{ i: number }> = ({ i }) => {
  const frame = useCurrentFrame();
  const { u, vertical } = useLayout();
  const claim = COPY.claims[i];
  const cardIn = spring({
    frame,
    fps: 30,
    config: { damping: 13, stiffness: 160 },
  });
  const fromLeft = i % 2 === 0 ? -1 : 1;
  const cardW = (vertical ? 900 : 1300) * u;
  const quoteSize = (vertical ? 100 : 118) * u;
  return (
    <AbsoluteFill style={{ transform: shake(frame, STAMP_AT, u, `st${i}`) }}>
      <Stripes dim={0.1} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div
          style={{
            position: "relative",
            width: cardW,
            background: C.paper,
            padding: `${60 * u}px ${70 * u}px ${70 * u}px`,
            boxShadow: `0 ${30 * u}px ${70 * u}px rgba(0,0,0,.3)`,
            transform: `translateX(${(1 - cardIn) * fromLeft * 1400 * u}px) rotate(${(i - 1) * 1.5}deg)`,
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 20 * u,
              top: -quoteSize * 2.45,
              fontFamily: DISPLAY,
              fontSize: quoteSize * 3,
              lineHeight: 1,
              color: C.pink,
            }}
          >
            „
          </div>
          <div
            style={{
              fontFamily: DISPLAY,
              textTransform: "uppercase",
              fontSize: quoteSize,
              lineHeight: 1.08,
              color: C.ink,
            }}
          >
            {claim.text}
          </div>
          <div
            style={{
              position: "absolute",
              right: (vertical ? 10 : 40) * u,
              bottom: (vertical ? -175 : -165) * u,
            }}
          >
            {frame >= STAMP_AT ? (
              <Stamp
                text={claim.stamp}
                color={claim.color}
                size={(vertical ? 125 : 150) * u}
                t={frame - STAMP_AT}
              />
            ) : null}
          </div>
        </div>
      </AbsoluteFill>
      <Flash at={STAMP_AT} strength={0.3} />
    </AbsoluteFill>
  );
};

const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { u, vertical } = useLayout();
  const a = spring({ frame, fps: 30, config: { damping: 12 } });
  const b = spring({
    frame: frame - 10,
    fps: 30,
    config: { damping: 9, stiffness: 200 },
  });
  return (
    <AbsoluteFill>
      <Stripes dim={0.1} />
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 26 * u,
        }}
      >
        <div
          style={{ opacity: a, transform: `translateY(${(1 - a) * 60 * u}px)` }}
        >
          <Tape
            size={(vertical ? 92 : 100) * u}
            rotate={-2}
            style={
              vertical
                ? {
                    whiteSpace: "normal",
                    textAlign: "center",
                    maxWidth: 880 * u,
                  }
                : undefined
            }
          >
            {COPY.outroA}
          </Tape>
        </div>
        <div style={{ opacity: b, transform: `scale(${1.6 - 0.6 * b})` }}>
          <Tape
            size={(vertical ? 110 : 120) * u}
            rotate={3}
            bg={C.pink}
            fg={C.paper}
          >
            {COPY.outroB}
          </Tape>
        </div>
      </AbsoluteFill>
      <Flash at={10} strength={0.25} />
    </AbsoluteFill>
  );
};

export const Pravda: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: C.ink }}>
      <Sequence durationInFrames={36}>
        <Hook />
      </Sequence>
      {COPY.claims.map((_, i) => (
        <Sequence
          key={i}
          from={36 + i * CLAIM_LEN}
          durationInFrames={CLAIM_LEN}
        >
          <Claim i={i} />
        </Sequence>
      ))}
      <Sequence from={276} durationInFrames={42}>
        <Outro />
      </Sequence>
      <Sequence from={318} durationInFrames={132}>
        <Packshot kicker={COPY.kicker} note={false} />
      </Sequence>
      <Soundtrack
        music={brand.music.pravda.file}
        startSec={brand.music.pravda.startSec}
        volume={brand.music.pravda.volume}
        duration={PRAVDA_DURATION}
        sparks={[{ from: 320, dur: 46, volume: 0.9, offsetSec: 6 }]}
      />
    </AbsoluteFill>
  );
};

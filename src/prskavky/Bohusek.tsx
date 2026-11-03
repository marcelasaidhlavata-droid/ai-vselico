import React from "react";
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  random,
  spring,
  useCurrentFrame,
} from "remotion";
import { brand } from "./brand";
import {
  C,
  Flash,
  Packshot,
  Stripes,
  Tape,
  clamp,
  shake,
  useLayout,
  Soundtrack,
} from "./common";

/*
 * VARIANTA 4 – „Bohůšek“
 * Starý, trochu natvrdlý robotický vysavač z dílu o bordelu jako maskot (obdoba mopsíka Bobíka).
 * Pohled shora, „koberec“ jsou duhové pruhy.
 *
 *   0–40     přijede: „Seznamte se: Bohůšek.“
 *   40–130   třikrát se otočí… a sežere kabel
 *   130–210  „Uklízí? Spíš drobí.“ – za ním zůstávají drobky
 *   210–282  dojede k hraně schodů a zůstane viset
 *   282–318  „Podcast k úklidu. / Šťastnej mop!“
 *   318–420  packshot, Bohůšek projede nahoře
 */
export const BOHUSEK_DURATION = 420;

const COPY = {
  intro: "Seznamte se: Bohůšek.",
  spin: "Otočí se třikrát…",
  eat: "…a sežere kabel.",
  crumbs: ["Uklízí?", "Spíš drobí."],
  stairs: "Jednou zůstal viset na schodech.",
  outroA: "Podcast k úklidu.",
  outroB: "Šťastnej mop!",
  kicker: "Díl o bordelu",
};

type Eyes = "normal" | "happy" | "wide";

/** Bohůšek shora – kulatý robotický vysavač s kukadly */
export const Robot: React.FC<{
  size: number;
  angle?: number;
  eyes?: Eyes;
  blink?: boolean;
  chew?: number;
}> = ({ size, angle = 0, eyes = "normal", blink = false, chew = 0 }) => {
  const eye = (cx: number) => {
    if (eyes === "happy") {
      return (
        <path
          d={`M${cx - 9} 40 q9 -11 18 0`}
          stroke={C.ink}
          strokeWidth={4}
          fill="none"
          strokeLinecap="round"
        />
      );
    }
    const r = eyes === "wide" ? 13 : 11;
    return (
      <g>
        <ellipse
          cx={cx}
          cy={38}
          rx={r}
          ry={blink ? 1.5 : r}
          fill="#fff"
          stroke={C.ink}
          strokeWidth={3}
        />
        {!blink ? (
          <circle
            cx={cx + (eyes === "wide" ? 0 : 2)}
            cy={eyes === "wide" ? 38 : 36}
            r={eyes === "wide" ? 4 : 5}
            fill={C.ink}
          />
        ) : null}
      </g>
    );
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={{ overflow: "visible" }}
    >
      {/* stín */}
      <ellipse cx={52} cy={56} rx={47} ry={47} fill="rgba(0,0,0,.22)" />
      {/* tělo – otáčí se (pohled shora), obličej zůstává rovně */}
      <g transform={`rotate(${angle} 50 50)`}>
        <circle
          cx={50}
          cy={50}
          r={46}
          fill="#ECEAF0"
          stroke={C.ink}
          strokeWidth={3}
        />
        <circle cx={50} cy={50} r={36} fill="#D9D6DE" />
        {/* nárazník vpředu */}
        <path
          d="M14 30 A40 40 0 0 1 86 30"
          stroke={C.ink}
          strokeWidth={7}
          fill="none"
          strokeLinecap="round"
        />
        {/* rotující kartáček */}
        <g transform="translate(18 18)">
          <path
            d="M0 -8 L0 8 M-8 0 L8 0 M-6 -6 L6 6 M-6 6 L6 -6"
            stroke={C.ink}
            strokeWidth={2}
            opacity={0.6}
          />
        </g>
        {/* kontrolka */}
        <circle
          cx={50}
          cy={78}
          r={4}
          fill={C.teal}
          stroke={C.ink}
          strokeWidth={1.5}
        />
      </g>
      {/* obličej */}
      {eye(38)}
      {eye(62)}
      <ellipse
        cx={50}
        cy={58}
        rx={7 + chew * 3}
        ry={1.5 + chew * 5}
        fill={C.ink}
      />
    </svg>
  );
};

/** Nápis nahoře, mění se podle času */
const Caption: React.FC<{
  text: string;
  at: number;
  pink?: boolean;
  frame: number;
}> = ({ text, at, pink, frame }) => {
  const { u, vertical } = useLayout();
  const s = spring({
    frame: frame - at,
    fps: 30,
    config: { damping: 10, stiffness: 200 },
  });
  return (
    <div style={{ opacity: s, transform: `scale(${1.6 - 0.6 * s})` }}>
      <Tape
        size={(vertical ? 92 : 96) * u}
        rotate={pink ? 2 : -2}
        bg={pink ? C.pink : C.paper}
        fg={pink ? C.paper : C.ink}
        style={
          vertical
            ? { whiteSpace: "normal", textAlign: "center", maxWidth: 900 * u }
            : undefined
        }
      >
        {text}
      </Tape>
    </div>
  );
};

const Story: React.FC = () => {
  const frame = useCurrentFrame();
  const { u, vertical, width, height } = useLayout();
  const R = (vertical ? 380 : 330) * u; // velikost robota
  const cx = width / 2;
  const cy = height * (vertical ? 0.55 : 0.6);

  // --- pozice a natočení po fázích ---
  let x = cx;
  let y = cy;
  let angle = 90; // „čumák“ doprava
  let eyes: Eyes = "normal";
  let chew = 0;

  // 0–40 příjezd zleva
  const arrive = spring({
    frame: frame - 6,
    fps: 30,
    config: { damping: 16, stiffness: 70 },
  });
  x = interpolate(arrive, [0, 1], [-R, cx - width * 0.12]);

  // 40–130 kabel
  const cableX = cx + width * (vertical ? 0.2 : 0.16);
  const spin = interpolate(frame, [48, 92], [0, 1080], clamp);
  angle = 90 + spin;
  const toCable = interpolate(frame, [95, 112], [0, 1], clamp);
  x = interpolate(toCable, [0, 1], [x, cableX - R * 0.1]);
  const eaten = interpolate(frame, [104, 126], [0, 1], clamp);
  if (frame >= 104 && frame < 128) chew = Math.abs(Math.sin(frame / 2));
  if (frame >= 126 && frame < 140) eyes = "happy";

  // 130–210 bloudí a drobí
  const wander = interpolate(frame, [134, 208], [0, 1], clamp);
  const wanderPos = (t: number) => {
    const ax = vertical ? width * 0.28 : width * 0.3;
    const ay = vertical ? height * 0.12 : height * 0.18;
    return {
      x:
        cableX -
        R * 0.1 +
        (Math.cos(t * Math.PI * 2 + Math.PI) + 1) *
          -ax *
          0.5 *
          Math.min(1, t * 3) +
        Math.sin(t * 9) * 8 * u,
      y: cy + Math.sin(t * Math.PI * 2) * ay,
    };
  };
  if (frame >= 134) {
    const p = wanderPos(wander);
    const p2 = wanderPos(Math.min(1, wander + 0.01));
    x = p.x;
    y = p.y;
    angle = (Math.atan2(p2.y - p.y, p2.x - p.x) * 180) / Math.PI + 90;
  }

  // 210–282 schody
  const edgeX = width * (vertical ? 0.86 : 0.84);
  const toEdge = interpolate(frame, [212, 240], [0, 1], clamp);
  const tip = spring({
    frame: frame - 240,
    fps: 30,
    config: { damping: 5, stiffness: 120 },
  });
  if (frame >= 210) {
    const end = wanderPos(1);
    x = interpolate(toEdge, [0, 1], [end.x, edgeX]);
    y = interpolate(toEdge, [0, 1], [end.y, cy]);
    angle = interpolate(toEdge, [0, 0.3, 1], [angle, 90, 90]);
    if (frame >= 240) {
      x = edgeX + tip * R * 0.28;
      eyes = "wide";
    }
  }
  const dangle =
    frame >= 240
      ? Math.sin((frame - 240) / 5) * 6 * Math.exp(-(frame - 240) / 30)
      : 0;
  const tilt = frame >= 240 ? tip : 0;

  // drobky – stopa z fáze bloudění
  const crumbs: React.ReactNode[] = [];
  if (frame >= 140) {
    const upto = Math.min(1, wander);
    for (let i = 0; i < 60; i++) {
      const t = i / 60;
      if (t > upto - 0.02) break;
      const p = wanderPos(t);
      const ox = (random(`cx${i}`) - 0.5) * R * 0.5;
      const oy = (random(`cy${i}`) - 0.5) * R * 0.5;
      crumbs.push(
        <div
          key={i}
          style={{
            position: "absolute",
            left: p.x + ox,
            top: p.y + oy,
            width: (8 + random(`cs${i}`) * 10) * u,
            height: (6 + random(`ch${i}`) * 8) * u,
            borderRadius: 3 * u,
            background: random(`cc${i}`) > 0.5 ? "#C98B3D" : "#8A5A24",
            transform: `rotate(${random(`cr${i}`) * 90}deg)`,
            opacity: frame < 300 ? 1 : 0,
          }}
        />,
      );
    }
  }

  // kabel – vlnovka, která se při „jídle“ zkracuje
  const cableLen = 1 - eaten;
  const cable =
    frame >= 40 && frame < 132 ? (
      <svg
        width={width}
        height={height}
        style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}
      >
        <path
          d={`M ${cableX} ${cy} q ${60 * u} ${-80 * u} ${120 * u} 0 t ${120 * u} 0 t ${120 * u} 0 t ${120 * u} 0`}
          stroke={C.ink}
          strokeWidth={14 * u}
          fill="none"
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={`${cableLen} 1`}
          strokeDashoffset={-eaten}
          opacity={interpolate(frame, [40, 50], [0, 1], clamp)}
        />
        {cableLen > 0.05 ? (
          <rect
            x={cableX + 480 * u - 10 * u}
            y={cy - 22 * u}
            width={56 * u}
            height={44 * u}
            rx={8 * u}
            fill={C.paper}
            stroke={C.ink}
            strokeWidth={5 * u}
            opacity={interpolate(frame, [40, 50], [0, 1], clamp)}
          />
        ) : null}
      </svg>
    ) : null;

  // schody – tmavý pás se stupni u pravého okraje
  const stairsIn = interpolate(frame, [205, 220], [0, 1], clamp);
  const stairs =
    frame >= 200 ? (
      <div
        style={{
          position: "absolute",
          left: edgeX + R * 0.12,
          top: 0,
          right: 0,
          bottom: 0,
          opacity: stairsIn,
          background: `repeating-linear-gradient(90deg, #2a2230 0, #2a2230 ${46 * u}px, #1a141e ${46 * u}px, #1a141e ${60 * u}px)`,
          boxShadow: `inset ${14 * u}px 0 ${20 * u}px rgba(0,0,0,.6)`,
        }}
      />
    ) : null;

  // nápis nahoře
  let caption: React.ReactNode = null;
  if (frame < 44) caption = <Caption text={COPY.intro} at={14} frame={frame} />;
  else if (frame < 100)
    caption = <Caption text={COPY.spin} at={46} frame={frame} />;
  else if (frame < 134)
    caption = <Caption text={COPY.eat} at={102} pink frame={frame} />;
  else if (frame < 210)
    caption = (
      <div
        style={{
          display: "flex",
          flexDirection: vertical ? "column" : "row",
          gap: 20 * u,
          alignItems: "center",
        }}
      >
        <Caption text={COPY.crumbs[0]} at={136} frame={frame} />
        <Caption text={COPY.crumbs[1]} at={150} pink frame={frame} />
      </div>
    );
  else caption = <Caption text={COPY.stairs} at={236} frame={frame} />;

  return (
    <AbsoluteFill
      style={{
        transform: `${shake(frame, 126, u, "eat")} ${shake(frame, 240, u, "fall")}`,
      }}
    >
      <Stripes dropAt={0} />
      {stairs}
      {crumbs}
      {cable}
      <div
        style={{
          position: "absolute",
          left: x,
          top: y,
          transform: `translate(-50%,-50%) rotate(${dangle}deg) scale(${1 - tilt * 0.08}, ${1 - tilt * 0.08})`,
        }}
      >
        <div
          style={{
            transform: `perspective(${1200 * u}px) rotateY(${tilt * 32}deg)`,
          }}
        >
          <Robot
            size={R}
            angle={angle}
            eyes={eyes}
            blink={frame % 70 > 66}
            chew={chew}
          />
        </div>
      </div>
      <AbsoluteFill
        style={{ alignItems: "center", paddingTop: (vertical ? 210 : 70) * u }}
      >
        {caption}
      </AbsoluteFill>
      <Flash at={126} strength={0.2} />
    </AbsoluteFill>
  );
};

const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { u, vertical } = useLayout();
  const a = spring({ frame, fps: 30, config: { damping: 11 } });
  const b = spring({
    frame: frame - 9,
    fps: 30,
    config: { damping: 9, stiffness: 220 },
  });
  const bob = Math.sin(frame / 4) * 8 * u;
  return (
    <AbsoluteFill>
      <Stripes dim={0.08} />
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 26 * u,
        }}
      >
        <div style={{ transform: `translateY(${bob}px)` }}>
          <Robot size={(vertical ? 300 : 240) * u} eyes="happy" />
        </div>
        <div style={{ opacity: a, transform: `scale(${1.6 - 0.6 * a})` }}>
          <Tape size={(vertical ? 104 : 110) * u} rotate={-2}>
            {COPY.outroA}
          </Tape>
        </div>
        <div style={{ opacity: b, transform: `scale(${1.6 - 0.6 * b})` }}>
          <Tape
            size={(vertical ? 104 : 110) * u}
            rotate={2}
            bg={C.pink}
            fg={C.paper}
          >
            {COPY.outroB}
          </Tape>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Bohůšek projede přes packshot */
const DriveBy: React.FC = () => {
  const frame = useCurrentFrame();
  const { u, vertical, width, height } = useLayout();
  const R = (vertical ? 200 : 170) * u;
  // na výšku projede nahoře celou šířkou, na šířku přijede dole zleva a zastaví (vpravo dole je lísteček)
  const x = vertical
    ? interpolate(frame, [50, 100], [-R, width + R], clamp)
    : interpolate(
        spring({
          frame: frame - 40,
          fps: 30,
          config: { damping: 14, stiffness: 60 },
        }),
        [0, 1],
        [-R, width * 0.18],
      );
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: height * (vertical ? 0.1 : 0.82),
        transform: "translate(-50%,-50%)",
      }}
    >
      <Robot size={R} angle={90} eyes="happy" blink={frame % 50 > 46} />
    </div>
  );
};

export const Bohusek: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: C.ink }}>
      <Sequence durationInFrames={282}>
        <Story />
      </Sequence>
      <Sequence from={282} durationInFrames={36}>
        <Outro />
      </Sequence>
      <Sequence from={318} durationInFrames={102}>
        <Packshot kicker={COPY.kicker}>
          <DriveBy />
        </Packshot>
      </Sequence>
      <Soundtrack
        music={brand.music.bohusek.file}
        startSec={brand.music.bohusek.startSec}
        volume={brand.music.bohusek.volume}
        duration={BOHUSEK_DURATION}
        sparks={[{ from: 320, dur: 46, volume: 0.9, offsetSec: 6 }]}
      />
    </AbsoluteFill>
  );
};

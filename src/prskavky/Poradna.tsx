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
  BODY,
  C,
  DISPLAY,
  Flash,
  HAND,
  Packshot,
  Stripes,
  Tape,
  clamp,
  shake,
  useLayout,
  Soundtrack,
} from "./common";

/*
 * VARIANTA 3 – „Poradna – lepší než Bravo“
 * Dopis posluchačky o ponožkách → tři „odborné“ rady → výzva poslat dotaz.
 *
 *   0–36     „Poradna Prskavek / Lepší než Bravo.“
 *   36–282   dopis se píše, padají ponožky, pak tři bubliny s radami
 *   282–318  „Pošli nám svůj dotaz“ + e-mail
 *   318–420  packshot
 */
export const PORADNA_DURATION = 420;

const COPY = {
  title: "Poradna Prskavek",
  sub: "Lepší než Bravo.",
  letter:
    "Milé Prskavky, můj muž nechává špinavé ponožky všude. Pod gaučem, na parapetu, v koupelně… Co mám dělat?",
  signature: "Lenka",
  answers: [
    "Házej mu je do auta.",
    "Dej mu je do batůžku. Ať to vybalí v práci.",
    "Lenko, rozveď se. Nemáš zač.",
  ],
  ask: "Pošli nám svůj dotaz",
};

/* Jednoduchá ponožka (SVG) */
const Sock: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <path
      d="M38 4 h30 v52 c0 6 3 10 8 14 l8 6 c8 6 6 20 -6 22 l-30 0 c-14 0 -22 -10 -18 -22 c2 -6 8 -10 8 -16 z"
      fill={color}
      stroke={C.ink}
      strokeWidth={3}
      strokeLinejoin="round"
    />
    <rect
      x={38}
      y={4}
      width={30}
      height={12}
      fill={C.paper}
      stroke={C.ink}
      strokeWidth={3}
    />
    <path
      d="M40 22 h26 M40 28 h26"
      stroke={C.ink}
      strokeWidth={2.5}
      opacity={0.5}
    />
    {/* „smrádek“ */}
    <path
      d="M78 30 q6 -6 0 -12 q-6 -6 0 -12"
      stroke={C.ink}
      strokeWidth={2.5}
      fill="none"
      opacity={0.55}
    />
    <path
      d="M88 38 q6 -6 0 -12 q-6 -6 0 -12"
      stroke={C.ink}
      strokeWidth={2.5}
      fill="none"
      opacity={0.4}
    />
  </svg>
);

const Title: React.FC = () => {
  const frame = useCurrentFrame();
  const { u, vertical } = useLayout();
  const s1 = spring({
    frame: frame - 10,
    fps: 30,
    config: { damping: 10, stiffness: 200 },
  });
  const s2 = spring({
    frame: frame - 18,
    fps: 30,
    config: { damping: 9, stiffness: 220 },
  });
  return (
    <AbsoluteFill>
      <Stripes dropAt={0} />
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 24 * u,
          transform: shake(frame, 18, u, "pt"),
        }}
      >
        <div style={{ opacity: s1, transform: `scale(${1.8 - 0.8 * s1})` }}>
          <Tape size={(vertical ? 120 : 130) * u} rotate={-3}>
            {COPY.title}
          </Tape>
        </div>
        <div style={{ opacity: s2, transform: `scale(${1.8 - 0.8 * s2})` }}>
          <Tape
            size={(vertical ? 110 : 120) * u}
            rotate={2}
            bg={C.pink}
            fg={C.paper}
          >
            {COPY.sub}
          </Tape>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const LETTER_TYPE_END = 80; // do kdy se dopis „napíše“
const ANSWER_START = 100;
const ANSWER_STEP = 44;

const LetterAndAnswers: React.FC = () => {
  const frame = useCurrentFrame();
  const { u, vertical, width, height } = useLayout();

  const cardIn = spring({ frame, fps: 30, config: { damping: 13 } });
  const chars = Math.floor(
    interpolate(frame, [8, LETTER_TYPE_END], [0, COPY.letter.length], clamp),
  );
  const typed = COPY.letter.slice(0, chars);
  const sigIn = spring({
    frame: frame - LETTER_TYPE_END,
    fps: 30,
    config: { damping: 12 },
  });

  // když přijdou rady, dopis se zmenší a odsune
  const shrink = spring({
    frame: frame - (ANSWER_START - 10),
    fps: 30,
    config: { damping: 14 },
  });
  const cardW = (vertical ? 940 : 1000) * u;
  const scale = 1 - shrink * (vertical ? 0.18 : 0.3);
  const moveY = shrink * (vertical ? -520 : 0) * u;
  const moveX = shrink * (vertical ? 0 : -430) * u;

  // padající ponožky
  const socks = new Array(7).fill(0).map((_, i) => {
    const start = 20 + i * 9;
    const t = frame - start;
    if (t < 0) return null;
    const fall = spring({
      frame: t,
      fps: 30,
      config: { damping: 12, stiffness: 90 },
    });
    const x = (random(`sockx${i}`) * 0.84 + 0.08) * width;
    const yEnd =
      (vertical
        ? 0.62 + random(`socky${i}`) * 0.3
        : 0.6 + random(`socky${i}`) * 0.3) * height;
    const rot = (random(`sockr${i}`) - 0.5) * 120;
    const colors = [
      C.paper,
      C.yellow,
      C.teal,
      C.red,
      C.purple,
      C.pink,
      "#3BC9EC",
    ];
    return (
      <div
        key={i}
        style={{
          position: "absolute",
          left: x,
          top: -200 * u + fall * (yEnd + 200 * u),
          transform: `translate(-50%,-50%) rotate(${rot * fall}deg)`,
          opacity: 1 - shrink * 0.6,
        }}
      >
        <Sock
          size={(150 + random(`socks${i}`) * 60) * u}
          color={colors[i % colors.length]}
        />
      </div>
    );
  });

  const bubbleColors = [
    { bg: C.paper, fg: C.ink },
    { bg: C.pink, fg: C.paper },
    { bg: C.ink, fg: C.paper },
  ];

  return (
    <AbsoluteFill>
      <Stripes dim={0.08} />
      {socks}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div
          style={{
            width: cardW,
            background: `repeating-linear-gradient(180deg, ${C.paper} 0, ${C.paper} ${68 * u}px, #c9dcf0 ${68 * u}px, #c9dcf0 ${70 * u}px)`,
            padding: `${50 * u}px ${60 * u}px ${46 * u}px ${90 * u}px`,
            boxShadow: `0 ${30 * u}px ${70 * u}px rgba(0,0,0,.3)`,
            borderLeft: `${4 * u}px solid ${C.red}`,
            transform: `translate(${moveX}px, ${moveY + (1 - cardIn) * 900 * u}px) scale(${scale}) rotate(${-2 + shrink * 1}deg)`,
          }}
        >
          <div
            style={{
              fontFamily: BODY,
              fontWeight: 800,
              fontSize: 26 * u,
              letterSpacing: 4 * u,
              color: C.pink,
              marginBottom: 14 * u,
            }}
          >
            DOTAZ DO PORADNY
          </div>
          <div
            style={{
              fontFamily: HAND,
              fontWeight: 700,
              fontSize: (vertical ? 80 : 76) * u,
              lineHeight: `${70 * u}px`,
              color: C.ink,
              minHeight: 70 * u * 4,
            }}
          >
            {typed}
            <span
              style={{
                opacity:
                  frame < LETTER_TYPE_END && Math.floor(frame / 6) % 2 === 0
                    ? 1
                    : 0,
              }}
            >
              |
            </span>
          </div>
          <div
            style={{
              fontFamily: HAND,
              fontWeight: 700,
              fontSize: 64 * u,
              color: C.ink,
              textAlign: "right",
              opacity: sigIn,
            }}
          >
            — {COPY.signature}
          </div>
        </div>
      </AbsoluteFill>

      {/* rady */}
      <AbsoluteFill
        style={{
          alignItems: vertical ? "center" : "flex-end",
          justifyContent: vertical ? "flex-end" : "center",
          flexDirection: "column",
          gap: 30 * u,
          paddingBottom: vertical ? 140 * u : 0,
          paddingRight: vertical ? 0 : 100 * u,
        }}
      >
        {COPY.answers.map((a, i) => {
          const at = ANSWER_START + i * ANSWER_STEP;
          const s = spring({
            frame: frame - at,
            fps: 30,
            config: { damping: 9, stiffness: 220 },
          });
          const col = bubbleColors[i];
          const size = (vertical ? 76 : 70) * u;
          return (
            <div
              key={i}
              style={{
                position: "relative",
                maxWidth: (vertical ? 920 : 760) * u,
                fontFamily: DISPLAY,
                textTransform: "uppercase",
                fontSize: size,
                lineHeight: 1.08,
                color: col.fg,
                background: col.bg,
                padding: `${22 * u}px ${36 * u}px ${26 * u}px`,
                borderRadius: 36 * u,
                boxShadow: `0 ${16 * u}px ${34 * u}px rgba(0,0,0,.3)`,
                transform: `scale(${s}) rotate(${[-2, 2, -1][i]}deg)`,
                transformOrigin: vertical ? "50% 100%" : "100% 50%",
                opacity: Math.min(1, s * 2),
                alignSelf: vertical
                  ? ["flex-start", "flex-end", "center"][i]
                  : "flex-end",
                marginInline: vertical ? 70 * u : 0,
              }}
            >
              {a}
              <div
                style={{
                  position: "absolute",
                  bottom: -18 * u,
                  [i === 1 ? "right" : "left"]: 50 * u,
                  width: 0,
                  height: 0,
                  borderLeft: `${18 * u}px solid transparent`,
                  borderRight: `${18 * u}px solid transparent`,
                  borderTop: `${22 * u}px solid ${col.bg}`,
                }}
              />
            </div>
          );
        })}
      </AbsoluteFill>
      {COPY.answers.map((_, i) => (
        <Flash key={i} at={ANSWER_START + i * ANSWER_STEP} strength={0.18} />
      ))}
    </AbsoluteFill>
  );
};

const Ask: React.FC = () => {
  const frame = useCurrentFrame();
  const { u, vertical } = useLayout();
  const a = spring({ frame, fps: 30, config: { damping: 10, stiffness: 200 } });
  const b = spring({ frame: frame - 8, fps: 30, config: { damping: 12 } });
  return (
    <AbsoluteFill>
      <Stripes dim={0.08} />
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 30 * u,
        }}
      >
        <div style={{ opacity: a, transform: `scale(${1.6 - 0.6 * a})` }}>
          <Tape
            size={(vertical ? 104 : 120) * u}
            rotate={-2}
            bg={C.pink}
            fg={C.paper}
          >
            {COPY.ask}
          </Tape>
        </div>
        <div
          style={{ opacity: b, transform: `translateY(${(1 - b) * 50 * u}px)` }}
        >
          <div
            style={{
              fontFamily: BODY,
              fontWeight: 800,
              fontSize: (vertical ? 58 : 64) * u,
              color: C.ink,
              background: C.paper,
              padding: `${10 * u}px ${30 * u}px`,
              transform: "rotate(1.5deg)",
              boxShadow: `0 ${12 * u}px ${26 * u}px rgba(0,0,0,.25)`,
            }}
          >
            {brand.email}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const Poradna: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: C.ink }}>
      <Sequence durationInFrames={36}>
        <Title />
      </Sequence>
      <Sequence from={36} durationInFrames={246}>
        <LetterAndAnswers />
      </Sequence>
      <Sequence from={282} durationInFrames={36}>
        <Ask />
      </Sequence>
      <Sequence from={318} durationInFrames={102}>
        <Packshot />
      </Sequence>
      <Soundtrack
        music={brand.music.poradna.file}
        startSec={brand.music.poradna.startSec}
        volume={brand.music.poradna.volume}
        duration={PORADNA_DURATION}
        sparks={[{ from: 320, dur: 46, volume: 0.9, offsetSec: 6 }]}
      />
    </AbsoluteFill>
  );
};

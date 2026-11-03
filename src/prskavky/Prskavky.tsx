import React from "react";
import {
  AbsoluteFill,
  Img,
  Sequence,
  interpolate,
  random,
  spring,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { brand } from "./brand";
import { Sparkler } from "./Sparkler";
import {
  C,
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
        <Sparkler
          size={size}
          intensity={Math.max(0.05, ignite)}
          seed="intro"
          burn={interpolate(frame, [0, 48], [0.05, 0.2])}
        />
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: vertical ? "flex-end" : "flex-end",
          paddingBottom: (vertical ? 330 : 120) * u,
        }}
      >
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
  const photoIn = spring({
    frame,
    fps: 30,
    config: { damping: 11, stiffness: 150 },
  });
  const hit1 = 6;
  const hit2 = 24;
  const s1 = spring({
    frame: frame - hit1,
    fps: 30,
    config: { damping: 9, stiffness: 200 },
  });
  const s2 = spring({
    frame: frame - hit2,
    fps: 30,
    config: { damping: 9, stiffness: 200 },
  });
  const zoom = interpolate(frame, [0, 60], [1, 1.05]);
  const photo = vertical
    ? brand.groupPhotoVertical
    : brand.groupPhotoHorizontal;
  const pw = (vertical ? 780 : 1120) * u;
  const ph = vertical ? pw * (1280 / 853) : pw * (853 / 1280);
  const tapeSize = (vertical ? 150 : 140) * u;

  return (
    <AbsoluteFill
      style={{
        transform: `${shake(frame, hit1, u, "h1")} ${shake(frame, hit2, u, "h2")}`,
      }}
    >
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
            <Img
              src={staticFile(photo)}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transform: `scale(${zoom})`,
              }}
            />
          </div>
        </div>
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "space-between",
          paddingBlock: (vertical ? 150 : 70) * u,
        }}
      >
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
  const pop = spring({
    frame: local,
    fps: 30,
    config: { damping: 10, stiffness: 240 },
  });
  const showFinal = frame >= finalAt;
  const fin = spring({
    frame: frame - finalAt,
    fps: 30,
    config: { damping: 13 },
  });
  const maxW = (vertical ? 900 : 1500) * u;
  const wordSize = Math.min(
    (vertical ? 260 : 300) * u,
    maxW / (topics[idx].length * 0.5),
  );
  const sparkX = (random(`sx${idx}`) - 0.5) * width * 0.4;
  const rot = (random(`r${idx}`) - 0.5) * 8;

  return (
    <AbsoluteFill>
      <Stripes dim={0.12} />
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 34 * u,
        }}
      >
        {!showFinal ? (
          <>
            <Tape size={(vertical ? 84 : 80) * u} rotate={-2}>
              {brand.copy.aboutLead}
            </Tape>
            <div
              style={{
                position: "relative",
                transform: shake(frame, idx * TOPIC_STEP, u, `t${idx}`),
              }}
            >
              <div
                style={{
                  opacity: Math.min(1, 0.5 + pop),
                  transform: `scale(${1.6 - 0.6 * pop})`,
                }}
              >
                <Tape
                  size={wordSize}
                  rotate={rot}
                  bg={TOPIC_COLORS[idx % TOPIC_COLORS.length]}
                  fg={C.paper}
                >
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
                <Sparkler
                  size={380 * u}
                  intensity={0.75}
                  seed={`tp${idx}`}
                  showStick={false}
                />
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
              style={
                vertical
                  ? {
                      whiteSpace: "normal",
                      textAlign: "center",
                      maxWidth: 900 * u,
                    }
                  : undefined
              }
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
            boxShadow: vertical
              ? "none"
              : `0 ${30 * u}px ${70 * u}px rgba(0,0,0,.35)`,
            opacity: coverIn,
          }}
        >
          <Img
            src={staticFile(brand.cover)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transform: `scale(${zoom})`,
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: vertical ? "center" : "flex-start",
            gap: 14 * u,
          }}
        >
          {brand.hosts.map((name, i) => {
            const s = spring({
              frame: frame - 10 - i * 6,
              fps: 30,
              config: { damping: 12 },
            });
            return (
              <div
                key={name}
                style={{
                  opacity: s,
                  transform: `translateX(${(1 - s) * 200 * u}px)`,
                }}
              >
                <Tape
                  size={(vertical ? 62 : 70) * u}
                  rotate={[-2, 1.5, -1][i]}
                  bg={i === 1 ? C.pink : C.paper}
                  fg={i === 1 ? C.paper : C.ink}
                >
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
      <Sequence
        from={SCENES.packshot.from}
        durationInFrames={SCENES.packshot.dur}
      >
        <Packshot />
      </Sequence>
      <Soundtrack
        music={brand.music.selfpromo.file}
        startSec={brand.music.selfpromo.startSec}
        volume={brand.music.selfpromo.volume}
        duration={PRSKAVKY_DURATION}
        sparks={[
          { from: 2, dur: 50, volume: 0.9, offsetSec: 1 },
          { from: 108, dur: 72, volume: 0.45, offsetSec: 3 },
          { from: 320, dur: 46, volume: 0.9, offsetSec: 6 },
        ]}
      />
    </AbsoluteFill>
  );
};

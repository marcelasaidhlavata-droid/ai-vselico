import React from "react";
import "./index.css";
import "@fontsource/anton";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/inter/800.css";
import "@fontsource/caveat/700.css";
import { Composition } from "remotion";
import { Prskavky, PRSKAVKY_DURATION } from "./prskavky/Prskavky";
import { Pravda, PRAVDA_DURATION } from "./prskavky/Pravda";
import { Poradna, PORADNA_DURATION } from "./prskavky/Poradna";
import { Bohusek, BOHUSEK_DURATION } from "./prskavky/Bohusek";

const VARIANTS = [
  { id: "Pravda", component: Pravda, duration: PRAVDA_DURATION },
  { id: "Poradna", component: Poradna, duration: PORADNA_DURATION },
  { id: "Bohusek", component: Bohusek, duration: BOHUSEK_DURATION },
];

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Prskavky – selfpromo, vertikální verze (Reels / TikTok / Stories) */}
      <Composition
        id="Prskavky-9x16"
        component={Prskavky}
        durationInFrames={PRSKAVKY_DURATION}
        fps={30}
        width={1080}
        height={1920}
      />
      {/* Prskavky – selfpromo, horizontální verze (YouTube / web) */}
      <Composition
        id="Prskavky-16x9"
        component={Prskavky}
        durationInFrames={PRSKAVKY_DURATION}
        fps={30}
        width={1920}
        height={1080}
      />
      {/* Další varianty – každá na výšku i na šířku */}
      {VARIANTS.map((v) => (
        <React.Fragment key={v.id}>
          <Composition
            id={`${v.id}-9x16`}
            component={v.component}
            durationInFrames={v.duration}
            fps={30}
            width={1080}
            height={1920}
          />
          <Composition
            id={`${v.id}-16x9`}
            component={v.component}
            durationInFrames={v.duration}
            fps={30}
            width={1920}
            height={1080}
          />
        </React.Fragment>
      ))}
    </>
  );
};

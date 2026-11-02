import "./index.css";
import "@fontsource/anton";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/inter/800.css";
import "@fontsource/caveat/700.css";
import { Composition } from "remotion";
import { Prskavky, PRSKAVKY_DURATION } from "./prskavky/Prskavky";

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
    </>
  );
};

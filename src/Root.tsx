import "./index.css";
import { Composition } from "remotion";
import { AiPodvod } from "./compositions/AiPodvod";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="AiPodvod"
        component={AiPodvod}
        durationInFrames={3870}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};

/**
 * PRSKAVKY – selfpromo
 * ------------------------------------------------------------
 * Všechny podklady a texty na jednom místě.
 * Soubory leží v  public/prskavky/ . Když je hodnota null, vykreslí se zástupná grafika.
 */

export const brand = {
  colors: {
    ink: "#141014", // černá „tiskařská“ pro text na papíře
    paper: "#FFFDF8", // bílý papír pod texty
    pink: "#FE5DB0",
    red: "#FC2742",
    yellow: "#FDDB00",
    teal: "#01B19C",
    purple: "#8F6BD2",
    spark: "#FFE27A",
    sparkHot: "#FFFFFF",
    note: "#FDDB00",
  },

  /** Duhové papírové pruhy z key vizuálu (zleva doprava), šířky jsou relativní */
  stripes: [
    { c: "#F3EDA9", w: 0.8 },
    { c: "#FDDB00", w: 1.1 },
    { c: "#D0E9D0", w: 1.2 },
    { c: "#01B19C", w: 1.0 },
    { c: "#3BC9EC", w: 1.1 },
    { c: "#01B6EA", w: 1.1 },
    { c: "#8F6BD2", w: 0.8 },
    { c: "#FE5DB0", w: 1.0 },
    { c: "#F9E3EA", w: 1.0 },
    { c: "#FC2742", w: 0.9 },
    { c: "#FF7F1F", w: 0.8 },
  ],

  /** Bílé logo (vyříznuté z key vizuálu) */
  logo: "prskavky/logo.png" as string | null,
  logoSize: { w: 962, h: 390 },
  /** Klikatý „doutnák“ v logu – body v pixelech loga, jiskra po něm přeběhne */
  logoFuse: [
    [50, 220],
    [150, 173],
    [226, 216],
    [305, 185],
    [410, 226],
    [455, 163],
    [690, 264],
    [758, 193],
    [875, 240],
  ] as [number, number][],
  /** Kapky „prsknutí“ vpravo nahoře v logu */
  logoSplash: [915, 45] as [number, number],

  /** Fotky */
  groupPhotoVertical: "prskavky/holky-9x16.jpg",
  groupPhotoHorizontal: "prskavky/holky-16x9.jpg",
  cover: "prskavky/cover.jpg",

  /** Kontakt pro poradnu – podle přepisu dílu, OVĚŘIT (v přepisu stálo „ekonomia.cz“) */
  email: "prskavky@economia.cz",

  hosts: ["Komička Lucie", "Kata Hašková", "Alena Doláková"],

  /** Zvuky (public/prskavky/audio) */
  sfxSparkler: "prskavky/audio/sparkler.mp3",
  music: {
    selfpromo: {
      file: "prskavky/audio/mountain.mp3",
      startSec: 36.65,
      volume: 0.6,
    }, // drop v 38,45 s padne na „Tři holky.“
    pravda: {
      file: "prskavky/audio/cinematic-power.mp3",
      startSec: 0,
      volume: 0.45,
    }, // přehnaně epické k absurdním historkám
    poradna: {
      file: "prskavky/audio/happy-happy.mp3",
      startSec: 0,
      volume: 0.5,
    },
    bohusek: {
      file: "prskavky/audio/happy-vibes.mp3",
      startSec: 9,
      volume: 0.65,
    },
  },

  copy: {
    intro: "Pozor, prská.",
    hook: ["Tři holky.", "Žádnej filtr."],
    aboutLead: "Mluvíme o",
    topics: ["bordelu.", "chlapech.", "sexu.", "tchyních.", "penězích."],
    topicsFinalA: "a o všem, o čem by se",
    topicsFinalB: "slušný holky bavit neměly.",
    hostsLine: "Jsou to Prskavky.",
    cta: "Pusť si Prskavky",
    platforms: "Spotify · Apple Podcasts · YouTube", // ZÁSTUPNÉ – ověřit, kde podcast běží
    disclaimer: "Všechno může a nemusí být pravda. Ve jménu humoru.",
  },
};

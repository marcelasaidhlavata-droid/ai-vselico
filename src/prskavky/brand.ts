/**
 * PRSKAVKY – selfpromo
 * ------------------------------------------------------------
 * Všechno, co je ZÁSTUPNÉ (placeholder), je tady na jednom místě.
 * Až přijdou reálné podklady:
 *   1) nahrát soubory do  public/prskavky/
 *   2) sem doplnit název souboru (např. logo: "prskavky/logo.png")
 * Dokud je hodnota null, vykreslí se zástupná grafika.
 */

export const brand = {
  colors: {
    bg: "#160A1C", // noční fialovo-černá
    bg2: "#2A0F33",
    spark: "#FFC93C", // zlatá jiskra
    sparkHot: "#FFF4C2",
    accent: "#FF3D7F", // drzá růžová
    text: "#FFF6EC",
    note: "#FFD54A", // lísteček s disclaimerem
    noteText: "#2A0F33",
  },

  /** Logo podcastu – null = textové logo "PRSKAVKY" */
  logo: null as string | null,

  /** Moderátorky – photo null = silueta s iniciálou */
  hosts: [
    { name: "Komička Lucie", photo: null as string | null },
    { name: "Kata Hašková", photo: null as string | null },
    { name: "Alena Doláková", photo: null as string | null },
  ],

  /** Hudba / zvukový efekt prskání – null = bez zvuku */
  music: null as string | null,

  copy: {
    intro: "Pozor, prská.",
    hook: ["Tři holky.", "Žádnej filtr."],
    aboutLead: "Mluvíme o",
    topics: ["bordelu.", "chlapech.", "sexu.", "tchyních.", "penězích."],
    topicsFinal: "o všem, o čem by se slušný holky bavit neměly.",
    cta: "Pusť si Prskavky",
    platforms: "Spotify · Apple Podcasts · YouTube", // ZÁSTUPNÉ – ověřit, kde podcast běží
    disclaimer: "Všechno může a nemusí být pravda. Ve jménu humoru.",
  },
};

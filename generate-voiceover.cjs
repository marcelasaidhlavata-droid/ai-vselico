const gTTS = require("node-gtts");
const path = require("path");
const fs = require("fs");
const os = require("os");
const { execSync } = require("child_process");
const ffmpeg = require("ffmpeg-static");

const LANG = "cs";
const OUTPUT = path.join(__dirname, "public", "voiceover.mp3");
const TMP = path.join(os.tmpdir(), "remotion-vo-ai");

// | = 450ms sentence break
const SCRIPT = `Dřív se říkalo: papír snese všechno.|Dnes to platí i pro hlas.|Video nebo právní argument.|Umělá inteligence umí dodat textu zdání autority, aniž by za ním stála pravda.|Ukázal to případ amerického rodinného vinařství v Oregonu.|Ve sporu o rodinný majetek se v soudních podáních objevilo patnáct falešných právních citací.|Všechny vygenerovalo AI.|Soud uložil právníkům sankce přes sto tisíc dolarů.|Ale varování míří mnohem dál než k právníkům.|Generativní AI produkuje výstupy, které znějí plynule a přesvědčivě.|Ne proto, že jsou pravdivé.|Ale proto, že jsou jazykově uhlazené.|Falešná citace v soudním spisu není jen chyba v textu.|Do řízení vstupuje nepravdivá autorita.|Stejné riziko ale existuje i mimo soudní síně.|FBI upozornila, že útočníci využívají AI k vytváření přesvědčivých hlasových a video zpráv.|Hlas může být klonovaný.|Tvář může být vygenerovaná.|A lidé nejsou dobří detektoři syntetické reality.|Studie ukázaly, že deepfake audio lidé rozpoznají správně jen v sedmdesáti třech procentech případů.|AI podvody útočí na vztahy důvěry.|Na rodiče, kteří slyší hlas dítěte v nouzi.|Na rodinu, která řeší dědictví.|Největší obranou bude schopnost zpomalit a ověřovat.|Nevěřit automaticky tomu, co zní přesvědčivě.|A ptát se na původ.|`;

const SILENCE_MS = { "|": 450 };
const tokens = SCRIPT.split(/(\|)/);

function generateSegment(text, filePath) {
  return new Promise((resolve, reject) => {
    const tts = gTTS(LANG);
    tts.save(filePath, text, (err) => (err ? reject(err) : resolve()));
  });
}

function makeSilence(ms, filePath) {
  execSync(
    `"${ffmpeg}" -y -f lavfi -i anullsrc=r=22050:cl=mono -t ${(ms / 1000).toFixed(3)} -q:a 9 -acodec libmp3lame "${filePath}"`,
    { stdio: "pipe" }
  );
}

async function main() {
  fs.mkdirSync(TMP, { recursive: true });

  const segments = [];
  for (let i = 0; i < tokens.length; i += 2) {
    const text = tokens[i].trim();
    const sep = tokens[i + 1];
    if (!text) continue;
    segments.push({ text, silenceMs: sep ? SILENCE_MS[sep] : 0 });
  }

  console.log(`Generating ${segments.length} segments...\n`);
  segments.forEach((s, i) => console.log(`  ${i + 1}. "${s.text}" → +${s.silenceMs}ms`));
  console.log();

  const concatEntries = [];
  for (let i = 0; i < segments.length; i++) {
    const { text, silenceMs } = segments[i];
    const speechFile = path.join(TMP, `seg_${String(i).padStart(3, "0")}_speech.mp3`);
    process.stdout.write(`  [${i + 1}/${segments.length}]...`);
    await generateSegment(text, speechFile);
    concatEntries.push(speechFile);
    console.log(" done");
    if (silenceMs > 0) {
      const silFile = path.join(TMP, `seg_${String(i).padStart(3, "0")}_sil.mp3`);
      makeSilence(silenceMs, silFile);
      concatEntries.push(silFile);
    }
  }

  const concatList = path.join(TMP, "concat.txt");
  fs.writeFileSync(concatList, concatEntries.map((f) => `file '${f.replace(/\\/g, "/")}'`).join("\n"), "utf8");

  console.log("\nConcatenating...");
  execSync(
    `"${ffmpeg}" -y -f concat -safe 0 -i "${concatList}" -acodec libmp3lame -q:a 4 "${OUTPUT}"`,
    { stdio: "pipe" }
  );

  try {
    const info = execSync(`"${ffmpeg}" -i "${OUTPUT}"`, {
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
    });
    const m = info.match(/Duration: (\d+):(\d+):(\d+\.\d+)/);
    if (m) {
      const secs = parseInt(m[1]) * 3600 + parseInt(m[2]) * 60 + parseFloat(m[3]);
      console.log(`\n✓ voiceover.mp3  |  ${secs.toFixed(2)}s  |  ~${Math.ceil(secs * 30) + 60} frames needed`);
    }
  } catch (e) {
    const m = e.stderr ? e.stderr.toString().match(/Duration: (\d+):(\d+):(\d+\.\d+)/) : null;
    if (m) {
      const secs = parseInt(m[1]) * 3600 + parseInt(m[2]) * 60 + parseFloat(m[3]);
      console.log(`\n✓ voiceover.mp3  |  ${secs.toFixed(2)}s  |  ~${Math.ceil(secs * 30) + 60} frames needed`);
    } else {
      console.log("\n✓ voiceover.mp3 saved");
    }
  }

  [...concatEntries, concatList].forEach((f) => { try { fs.unlinkSync(f); } catch {} });
}

main().catch((err) => { console.error("Error:", err.message); process.exit(1); });

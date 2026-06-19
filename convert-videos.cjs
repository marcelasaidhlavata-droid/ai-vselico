const { execSync } = require("child_process");
const ffmpeg = require("ffmpeg-static");
const path = require("path");
const fs = require("fs");

const src = "C:/Users/42194/Downloads";
const dst = path.join(__dirname, "public");

const videos = [
  "215500_medium.mp4",
  "209409_medium.mp4",
  "203986-923133871_medium.mp4",
  "47802-451812879_medium.mp4",
  "8090415-uhd_4096_2160_25fps.mp4",
  "8090202-uhd_4096_2160_25fps.mp4",
  "15190547_3840_2160_24fps.mp4",
  "12019044_2562_1440_60fps.mp4",
  "14788175_1920_1080_30fps.mp4",
  "7547021-uhd_3840_2160_25fps.mp4",
  "8848810-uhd_4096_2160_25fps.mp4",
  "7424366-uhd_3840_2160_30fps.mp4",
  "8848813-uhd_4096_2160_25fps.mp4",
  "224155_medium.mp4",
  "106530-673518191_medium.mp4",
];

videos.forEach((v, i) => {
  const input = path.join(src, v);
  const output = path.join(dst, `video${i + 1}_30fps.mp4`);
  process.stdout.write(`Converting video${i + 1}: ${v}\n`);
  const vf = "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,fps=30";
  try {
    execSync(
      `"${ffmpeg}" -y -i "${input}" -vf "${vf}" -c:v libx264 -crf 23 -preset fast -an "${output}"`,
      { stdio: "pipe" }
    );
    console.log(`  -> video${i + 1}_30fps.mp4 done`);
  } catch (e) {
    console.log(`  ERROR: ${e.message.slice(0, 120)}`);
  }
});

console.log("ALL DONE");

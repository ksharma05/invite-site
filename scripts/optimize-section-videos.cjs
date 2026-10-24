const fs = require("fs");
const { execSync } = require("child_process");
const path = require("path");

const outDir = path.resolve("public/videos");
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const clips = [
  { raw: "raw_videos/shot1.mp4", name: "ganesha-invocation", posterSec: 1.0 },
  { raw: "raw_videos/shot2.mp4", name: "kashi-dawn", posterSec: 1.0 },
  { raw: "raw_videos/shot3_unified.mp4", name: "hero-mandap", posterSec: 3.5 },
];

for (const clip of clips) {
  const outMp4 = path.join(outDir, clip.name + ".mp4");
  const outPoster = path.join(outDir, clip.name + "-poster.jpg");
  console.log(`Optimizing ${clip.raw} -> ${outMp4}`);

  // Optimize video: H.264, web-friendly, muted (-an), faststart, crf 23
  execSync(
    `ffmpeg -y -i "${clip.raw}" -c:v libx264 -profile:v main -level 3.1 -pix_fmt yuv420p -crf 23 -preset slow -an -movflags +faststart "${outMp4}"`
  );

  // Extract poster frame
  execSync(`ffmpeg -y -ss ${clip.posterSec} -i "${outMp4}" -vframes 1 -q:v 2 "${outPoster}"`);

  const stat = fs.statSync(outMp4);
  console.log(`Done ${clip.name}: ${(stat.size / (1024 * 1024)).toFixed(2)} MB`);
}

console.log("All videos optimized successfully!");

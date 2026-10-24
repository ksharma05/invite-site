const fs = require("fs");
const { execSync } = require("child_process");
const path = require("path");

const dir = path.resolve("raw_videos");
const files = ["shot1.mp4", "shot2.mp4", "shot3a.mp4", "shot3b.mp4", "shot3_unified.mp4"];

const previewDir = path.join(dir, "previews");
if (!fs.existsSync(previewDir)) {
  fs.mkdirSync(previewDir, { recursive: true });
}

const results = {};

for (const f of files) {
  const filePath = path.join(dir, f);
  if (!fs.existsSync(filePath)) {
    console.warn(`File not found: ${filePath}`);
    continue;
  }

  try {
    const probeStr = execSync(
      `ffprobe -v error -select_streams v:0 -show_entries stream=width,height,r_frame_rate,avg_frame_rate,nb_frames,codec_name -show_entries format=duration,size,bit_rate -of json "${filePath}"`
    ).toString();
    const probe = JSON.parse(probeStr);
    const dur = parseFloat(probe.format.duration);

    results[f] = {
      width: probe.streams[0].width,
      height: probe.streams[0].height,
      aspect: (probe.streams[0].width / probe.streams[0].height).toFixed(2),
      fps: probe.streams[0].r_frame_rate,
      frames: probe.streams[0].nb_frames,
      durationSec: dur.toFixed(2),
      sizeMB: (probe.format.size / (1024 * 1024)).toFixed(2) + " MB",
      bitrateKbps: Math.round(probe.format.bit_rate / 1000) + " kbps",
    };

    const base = f.replace(".mp4", "");
    const startSec = 0.5;
    const midSec = (dur / 2).toFixed(2);
    const endSec = Math.max(0.5, dur - 0.5).toFixed(2);

    execSync(
      `ffmpeg -y -ss ${startSec} -i "${filePath}" -vframes 1 "${path.join(previewDir, base + "_start.jpg")}"`
    );
    execSync(
      `ffmpeg -y -ss ${midSec} -i "${filePath}" -vframes 1 "${path.join(previewDir, base + "_mid.jpg")}"`
    );
    execSync(
      `ffmpeg -y -ss ${endSec} -i "${filePath}" -vframes 1 "${path.join(previewDir, base + "_end.jpg")}"`
    );
  } catch (err) {
    console.error(`Error processing ${f}:`, err.message);
  }
}

console.log(JSON.stringify(results, null, 2));

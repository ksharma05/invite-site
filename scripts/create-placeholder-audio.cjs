const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const audioDir = path.resolve('public', 'audio');
if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir, { recursive: true });
}

const outFile = path.join(audioDir, 'background-music.mp3');

// Generate a soothing 30-second Indian classical ambient drone (Sa-Pa-Sa meditative harmony)
const filter = [
  'sine=f=146.83:d=30[sa1]',
  'sine=f=220:d=30[pa1]',
  'sine=f=293.66:d=30[sa2]',
  'sine=f=440:d=30[pa2]',
  '[sa1][pa1][sa2][pa2]amix=inputs=4:duration=longest,afade=t=in:ss=0:d=2.5,afade=t=out:st=27.5:d=2.5,volume=0.25'
].join(';');

const cmd = `ffmpeg -y -f lavfi -i "${filter}" -c:a libmp3lame -b:a 128k "${outFile}"`;
console.log('Running ffmpeg...');
execSync(cmd, { stdio: 'inherit' });
console.log('Background music placeholder created successfully at:', outFile);

import os
import random
from PIL import Image, ImageEnhance, ImageChops

def generate_frames():
    out_dir = os.path.join("public", "hero", "frames")
    os.makedirs(out_dir, exist_ok=True)

    img_dawn = Image.open(os.path.join("public", "hero", "kashi_dawn.jpg")).convert("RGB")
    img_aarti = Image.open(os.path.join("public", "hero", "kashi_aarti.jpg")).convert("RGB")
    img_portal = Image.open(os.path.join("public", "hero", "kashi_portal.jpg")).convert("RGB")

    target_size = (1280, 720)
    img_dawn = img_dawn.resize(target_size, Image.Resampling.LANCZOS)
    img_aarti = img_aarti.resize(target_size, Image.Resampling.LANCZOS)
    img_portal = img_portal.resize(target_size, Image.Resampling.LANCZOS)

    total_frames = 36
    # 0..11: Dawn progression (sunrise glow, subtle drift)
    # 12..23: Aarti transition (lamps ignite, twilight glow)
    # 24..35: Mandap portal revelation (golden wedding portal overlooking Kashi)

    random.seed(42)

    for i in range(total_frames):
        if i < 12:
            # Dawn scene with slight camera breath and lighting
            t = i / 11.0
            # Slight warm bloom
            enhancer = ImageEnhance.Color(img_dawn)
            base = enhancer.enhance(1.0 + t * 0.15)
            bright = ImageEnhance.Brightness(base)
            base = bright.enhance(0.95 + t * 0.1)
        elif i < 24:
            # Cross-fade from Dawn to Aarti
            t = (i - 12) / 11.0
            # S-curve blend
            blend_factor = t * t * (3 - 2 * t)
            base = Image.blend(img_dawn, img_aarti, blend_factor)
        else:
            # Cross-fade from Aarti to Mandap Portal
            t = (i - 24) / 11.0
            blend_factor = t * t * (3 - 2 * t)
            base = Image.blend(img_aarti, img_portal, blend_factor)

        # Apply subtle authentic stop-motion exposure flicker (+/- 2%)
        flicker = 1.0 + random.uniform(-0.025, 0.025)
        base = ImageEnhance.Brightness(base).enhance(flicker)

        # Apply subtle stop-motion stage jitter (+/- 1-2px)
        dx = random.randint(-1, 1)
        dy = random.randint(-1, 1)
        if dx != 0 or dy != 0:
            base = ImageChops.offset(base, dx, dy)

        frame_path = os.path.join(out_dir, f"frame_{i:02d}.webp")
        base.save(frame_path, "WEBP", quality=68)

    print(f"Generated {total_frames} stop-motion frames in {out_dir}")

if __name__ == "__main__":
    generate_frames()

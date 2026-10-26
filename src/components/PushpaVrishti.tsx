"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";

type ParticleType = "rose" | "marigold" | "akshat";

interface PetalParticle {
  x: number;
  y: number;
  size: number;
  type: ParticleType;
  color: string;
  speedY: number;
  speedX: number;
  rotation: number;
  rotSpeed: number;
  flip: number;
  flipSpeed: number;
  wobble: number;
  wobbleSpeed: number;
  opacity: number;
}

const ROSE_COLORS = ["#9f1239", "#be123c", "#e11d48", "#881337", "#f43f5e"];
const MARIGOLD_COLORS = ["#ea580c", "#f97316", "#f59e0b", "#fbbf24", "#d97706"];
const AKSHAT_COLORS = ["#fde047", "#facc15", "#d4af37", "#fef08a"];

export interface PushpaVrishtiProps {
  lang?: "en" | "hi";
  onShower?: (count: number) => void;
}

export function PushpaVrishtiCanvas({ activeTriggerCount }: { activeTriggerCount: number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<PetalParticle[]>([]);
  const animFrameRef = useRef<number | null>(null);

  const spawnParticles = useCallback((count = 48) => {
    if (typeof window === "undefined") return;

    // Honor prefers-reduced-motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const width = window.innerWidth;
    const newParticles: PetalParticle[] = [];

    for (let i = 0; i < count; i++) {
      const rand = Math.random();
      let type: ParticleType = "rose";
      let color: string;
      let size: number;

      if (rand < 0.55) {
        // Red rose petal
        type = "rose";
        color = ROSE_COLORS[Math.floor(Math.random() * ROSE_COLORS.length)] ?? "#be123c";
        size = 12 + Math.random() * 12; // 12px to 24px
      } else if (rand < 0.82) {
        // Vibrant marigold petal
        type = "marigold";
        color = MARIGOLD_COLORS[Math.floor(Math.random() * MARIGOLD_COLORS.length)] ?? "#ea580c";
        size = 10 + Math.random() * 8; // 10px to 18px
      } else {
        // Sacred golden akshat / zari sparkle
        type = "akshat";
        color = AKSHAT_COLORS[Math.floor(Math.random() * AKSHAT_COLORS.length)] ?? "#d4af37";
        size = 4 + Math.random() * 5; // 4px to 9px
      }

      newParticles.push({
        x: Math.random() * width,
        y: -30 - Math.random() * 100, // spawn slightly staggered above viewport
        size,
        type,
        color,
        speedY: 1.8 + Math.random() * 2.2,
        speedX: -0.6 + Math.random() * 1.2,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.04,
        flip: Math.random() * Math.PI,
        flipSpeed: 0.02 + Math.random() * 0.05,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.02 + Math.random() * 0.04,
        opacity: 0.95,
      });
    }

    particlesRef.current.push(...newParticles);
  }, []);

  // Listen to trigger count increment
  useEffect(() => {
    if (activeTriggerCount > 0) {
      spawnParticles(52);
    }
  }, [activeTriggerCount, spawnParticles]);

  // Main canvas animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let isRunning = true;

    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.resetTransform?.();
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas, { passive: true });

    const drawRosePetal = (p: PetalParticle) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.scale(Math.cos(p.flip), 1); // 3D tumbling effect

      ctx.beginPath();
      // Natural curved teardrop petal shape
      ctx.moveTo(0, -p.size * 0.8);
      ctx.bezierCurveTo(p.size * 0.7, -p.size * 0.6, p.size * 0.8, p.size * 0.4, 0, p.size * 0.8);
      ctx.bezierCurveTo(
        -p.size * 0.8,
        p.size * 0.4,
        -p.size * 0.7,
        -p.size * 0.6,
        0,
        -p.size * 0.8
      );
      ctx.closePath();

      // Soft petal shading
      const grad = ctx.createRadialGradient(0, 0, p.size * 0.1, 0, 0, p.size * 0.8);
      grad.addColorStop(0, p.color);
      grad.addColorStop(0.8, p.color);
      grad.addColorStop(1, "#500724");

      ctx.fillStyle = grad;
      ctx.globalAlpha = p.opacity;
      ctx.shadowColor = "rgba(0, 0, 0, 0.25)";
      ctx.shadowBlur = 3;
      ctx.shadowOffsetY = 2;
      ctx.fill();
      ctx.restore();
    };

    const drawMarigold = (p: PetalParticle) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.scale(Math.cos(p.flip), Math.sin(p.flip));

      // Multi-lobed marigold floret
      ctx.beginPath();
      const lobes = 6;
      for (let i = 0; i < lobes; i++) {
        const angle = (i * Math.PI * 2) / lobes;
        const lx = Math.cos(angle) * (p.size * 0.5);
        const ly = Math.sin(angle) * (p.size * 0.5);
        ctx.arc(lx, ly, p.size * 0.35, 0, Math.PI * 2);
      }
      ctx.closePath();

      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.opacity;
      ctx.shadowColor = "rgba(180, 83, 9, 0.3)";
      ctx.shadowBlur = 4;
      ctx.fill();
      ctx.restore();
    };

    const drawAkshat = (p: PetalParticle) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);

      // Slender golden rice grain / glint
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size * 0.4, p.size * 0.9, 0, 0, Math.PI * 2);
      ctx.closePath();

      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.opacity * (0.6 + 0.4 * Math.sin(p.flip * 3)); // shimmering glint
      ctx.shadowColor = "rgba(212, 175, 55, 0.8)";
      ctx.shadowBlur = 5;
      ctx.fill();
      ctx.restore();
    };

    const animate = () => {
      if (!isRunning) return;

      const height = window.innerHeight;
      const width = window.innerWidth;

      ctx.clearRect(0, 0, width, height);

      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        if (!p) continue;

        // Update physics
        p.wobble += p.wobbleSpeed;
        p.flip += p.flipSpeed;
        p.rotation += p.rotSpeed;
        p.y += p.speedY;
        p.x += Math.sin(p.wobble) * 1.4 + p.speedX;

        // Gentle fade near bottom
        if (p.y > height - 120) {
          p.opacity -= 0.015;
        }

        // Draw particle based on type
        if (p.type === "rose") {
          drawRosePetal(p);
        } else if (p.type === "marigold") {
          drawMarigold(p);
        } else {
          drawAkshat(p);
        }

        // Remove offscreen or fully faded particles
        if (p.y > height + 40 || p.opacity <= 0) {
          particles.splice(i, 1);
        }
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      isRunning = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-50 h-full w-full"
      aria-hidden="true"
    />
  );
}

/**
 * Pushpa Vrishti Interactive Button & Toast Banner
 */
export function PushpaVrishti({ lang = "en", onShower }: PushpaVrishtiProps) {
  const [triggerCount, setTriggerCount] = useState(0);
  const [blessingCount, setBlessingCount] = useState(108); // Starts with auspicious 108 blessings
  const [showToast, setShowToast] = useState(false);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleShower = () => {
    setTriggerCount((prev) => prev + 1);
    setBlessingCount((prev) => {
      const next = prev + 1;
      onShower?.(next);
      return next;
    });

    setShowToast(true);
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    toastTimeoutRef.current = setTimeout(() => {
      setShowToast(false);
    }, 3200);
  };

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  return (
    <>
      {/* Full-screen Canvas Animation */}
      <PushpaVrishtiCanvas activeTriggerCount={triggerCount} />

      {/* Interactive Celebration Action Button */}
      <button
        type="button"
        onClick={handleShower}
        className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full border border-amber-400/60 bg-gradient-to-r from-red-950/80 via-black/70 to-red-950/80 px-5 py-2.5 text-xs font-bold text-amber-100 shadow-[0_0_18px_rgba(212,175,55,0.45)] backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-amber-300 hover:text-white hover:shadow-[0_0_26px_rgba(212,175,55,0.75)] active:scale-95 sm:text-sm"
        aria-label={
          lang === "hi" ? "आशीर्वाद दें - पुष्प वृष्टि" : "Shower Blessings - Pushpa Vrishti"
        }
      >
        {/* Shimmer sweep inside button */}
        <span
          className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-amber-300/25 to-transparent transition-transform duration-1000 group-hover:translate-x-full"
          aria-hidden="true"
        />

        <span className="text-base transition-transform duration-300 group-hover:rotate-12 group-hover:scale-125">
          🌸
        </span>
        <span className="tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-gold-bright to-amber-200 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
          {lang === "hi" ? "आशीर्वाद दें (पुष्प वृष्टि)" : "Shower Blessings"}
        </span>

        {/* Counter Badge */}
        <span className="ml-1 inline-flex items-center rounded-full border border-amber-300/40 bg-amber-500/20 px-2 py-0.5 text-[11px] font-extrabold text-amber-200">
          {blessingCount}
        </span>
      </button>

      {/* Auspicious Toast Notification */}
      {showToast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-in fade-in slide-in-from-bottom-4 duration-300 w-[92vw] max-w-md pointer-events-none"
        >
          <div className="flex items-center justify-center gap-2.5 rounded-full border border-amber-300/70 bg-gradient-to-r from-red-950/95 via-black/95 to-red-950/95 px-5 py-3 shadow-[0_10px_35px_rgba(0,0,0,0.8),0_0_20px_rgba(212,175,55,0.6)] backdrop-blur-md text-center">
            <span className="text-lg animate-bounce">🌸</span>
            <p className="text-xs sm:text-sm font-semibold tracking-wide text-amber-100 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
              {lang === "hi" ? (
                <>
                  <span className="font-bold text-amber-300">॥ सदा सर्वदा मंगलम् ॥</span>
                  <br className="sm:hidden" /> आपके पावन आशीर्वाद जोड़े तक पहुँच गए!
                </>
              ) : (
                <>
                  <span className="font-bold text-amber-300">॥ Sada Sarvada Mangalam ॥</span>
                  <br className="sm:hidden" /> Your heartfelt blessings have been showered!
                </>
              )}
            </p>
          </div>
        </div>
      )}
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import {
  DEFAULT_HEURISTICS_CONFIG,
  type DeviceHeuristicsConfig,
} from "@/config/deviceHeuristics";

export type DeviceTier = "high" | "low";

export interface DeviceTierResult {
  tier: DeviceTier;
  isLowTier: boolean;
  reason: string;
  isHydrated: boolean;
}

/**
 * Custom React hook to evaluate device performance capabilities (Android & iOS).
 * Returns 'low' tier for older, low-memory, or constrained devices to prevent crashes
 * and guarantee 60fps playback without scroll lag.
 */
export function useDeviceTier(
  customConfig?: Partial<DeviceHeuristicsConfig>
): DeviceTierResult {
  const config = { ...DEFAULT_HEURISTICS_CONFIG, ...customConfig };

  const [result, setResult] = useState<DeviceTierResult>({
    tier: "high",
    isLowTier: false,
    reason: "default-ssr",
    isHydrated: false,
  });

  useEffect(() => {
    // 1. Accessibility: Prefers reduced motion
    if (config.honorPrefersReducedMotion) {
      if (
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        setResult({
          tier: "low",
          isLowTier: true,
          reason: "prefers-reduced-motion",
          isHydrated: true,
        });
        return;
      }
    }

    // 2. Network & Data Saver API
    const nav = navigator as unknown as {
      connection?: {
        saveData?: boolean;
        effectiveType?: string;
      };
      deviceMemory?: number;
      hardwareConcurrency?: number;
    };

    if (config.honorSaveData && nav.connection?.saveData === true) {
      setResult({
        tier: "low",
        isLowTier: true,
        reason: "data-saver-enabled",
        isHydrated: true,
      });
      return;
    }

    if (
      nav.connection?.effectiveType &&
      config.disallowedNetworkTypes.includes(nav.connection.effectiveType)
    ) {
      setResult({
        tier: "low",
        isLowTier: true,
        reason: `slow-network-${nav.connection.effectiveType}`,
        isHydrated: true,
      });
      return;
    }

    // 3. Android / Chromium: Device Memory API (RAM in GB)
    if (
      typeof nav.deviceMemory === "number" &&
      nav.deviceMemory <= config.deviceMemoryThresholdGB
    ) {
      setResult({
        tier: "low",
        isLowTier: true,
        reason: `ram-limit-${nav.deviceMemory}gb`,
        isHydrated: true,
      });
      return;
    }

    // 4. iOS & Android: CPU Core Concurrency
    if (
      typeof nav.hardwareConcurrency === "number" &&
      nav.hardwareConcurrency <= config.hardwareConcurrencyThreshold
    ) {
      setResult({
        tier: "low",
        isLowTier: true,
        reason: `cpu-cores-${nav.hardwareConcurrency}`,
        isHydrated: true,
      });
      return;
    }

    // 5. iOS Specific Heuristic: Older iPhone screen dimensions (e.g. iPhone 6/7/8/SE)
    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

    if (isIOS) {
      const minDimension = Math.min(window.screen.width, window.screen.height);
      const maxDimension = Math.max(window.screen.width, window.screen.height);
      if (maxDimension <= config.iosLegacyScreenHeightThreshold) {
        setResult({
          tier: "low",
          isLowTier: true,
          reason: `ios-legacy-screen-${minDimension}x${maxDimension}`,
          isHydrated: true,
        });
        return;
      }
    }

    // 6. GPU Check: WebGL max texture size limit for legacy chipsets
    try {
      const canvas = document.createElement("canvas");
      const gl =
        canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (gl) {
        const glCtx = gl as WebGLRenderingContext;
        const maxTextureSize = glCtx.getParameter(glCtx.MAX_TEXTURE_SIZE);
        if (maxTextureSize && maxTextureSize < config.webglMinTextureSize) {
          setResult({
            tier: "low",
            isLowTier: true,
            reason: `webgl-texture-limit-${maxTextureSize}`,
            isHydrated: true,
          });
          return;
        }
      }
    } catch {
      // Ignore WebGL detection errors on restricted environments
    }

    // If passed all constraints, assign High Tier
    setResult({
      tier: "high",
      isLowTier: false,
      reason: "high-performance-verified",
      isHydrated: true,
    });
  }, [
    config.deviceMemoryThresholdGB,
    config.hardwareConcurrencyThreshold,
    config.honorPrefersReducedMotion,
    config.honorSaveData,
    config.iosLegacyScreenHeightThreshold,
    config.webglMinTextureSize,
  ]);

  return result;
}

/**
 * Configurable Device Heuristics Thresholds
 *
 * Adjust these values to tune the threshold between high-performance
 * devices (which get ambient motion and scroll parallax) and low-tier /
 * legacy devices (which get safe, view-triggered, non-scrubbed video playback).
 */

export interface DeviceHeuristicsConfig {
  /**
   * RAM threshold in gigabytes (Chrome/Android).
   * Devices with <= this value trigger safe mode.
   * Default: 4 (covers 2GB and 4GB budget phones).
   */
  deviceMemoryThresholdGB: number;

  /**
   * Logical CPU core count (iOS Safari & Android).
   * Devices with <= this value trigger safe mode.
   * Default: 4 (quad-core and dual-core chipsets).
   */
  hardwareConcurrencyThreshold: number;

  /**
   * Network connection types that force safe mode.
   * Default: ["slow-2g", "2g", "3g"]
   */
  disallowedNetworkTypes: string[];

  /**
   * Whether to force safe mode if the user has enabled Data Saver in browser settings.
   * Default: true
   */
  honorSaveData: boolean;

  /**
   * Whether to respect OS-level "Reduce Motion" accessibility setting.
   * Default: true
   */
  honorPrefersReducedMotion: boolean;

  /**
   * WebGL max texture size.
   * Legacy mobile GPUs (e.g. Adreno 300 series, Mali-400) have max texture size <= 4096.
   * Default: 4096
   */
  webglMinTextureSize: number;

  /**
   * iPhone screen height threshold in CSS pixels (e.g. iPhone 6/7/8/SE are <= 667px).
   * Default: 667
   */
  iosLegacyScreenHeightThreshold: number;

  /**
   * IntersectionObserver threshold (0.2 = starts playing when 20% visible).
   * Default: 0.2
   */
  observerThreshold: number;

  /**
   * Whether section videos should play only once when in viewport, then hold on the final frame.
   * Reloading the page resets this so they replay on the next session.
   * Default: true
   */
  playOncePerSession: boolean;
}

export const DEFAULT_HEURISTICS_CONFIG: DeviceHeuristicsConfig = {
  deviceMemoryThresholdGB: 4,
  hardwareConcurrencyThreshold: 4,
  disallowedNetworkTypes: ["slow-2g", "2g", "3g"],
  honorSaveData: true,
  honorPrefersReducedMotion: true,
  webglMinTextureSize: 4096,
  iosLegacyScreenHeightThreshold: 667,
  observerThreshold: 0.2,
  playOncePerSession: true,
};

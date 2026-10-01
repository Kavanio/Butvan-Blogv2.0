"use client";

import { play } from "@/lib/sound";

export function useSound() {
  return {
    playTick: () => play("tick", { volume: 0.25 }),
    playRelease: () => play("release", { volume: 0.4 }),
    playDroplet: () => play("droplet", { volume: 0.55 }),
    playWhisper: () => play("whisper", { volume: 0.35 }),
    playBloom: () => play("bloom", { volume: 0.5 }),
    playSparkle: () => play("sparkle", { volume: 0.35 }),
    playSuccess: () => play("success", { volume: 0.5 }),
    playToggle: () => play("toggle", { volume: 0.5 }),
    play,
  };
}

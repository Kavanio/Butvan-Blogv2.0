"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Play, Pause } from "lucide-react";
import { play } from "@/lib/sound";

const PREVIEW_URL =
  "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/de/c3/e8/dec3e884-7237-9622-c2cb-23053356886e/mzaf_1350616942006730030.plus.aac.p.m4a";

export function SpotifyPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(PREVIEW_URL);
    audioRef.current = audio;

    const onTimeUpdate = () => {
      if (audio.duration) {
        setProgress(audio.currentTime / audio.duration);
      }
    };

    const onEnded = () => {
      setIsPlaying(false);
      setProgress(0);
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      play("whisper", { volume: 0.3 });
    } else {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
      play("bloom", { volume: 0.5 });
    }
  };

  return (
    <div className="flex items-center gap-3 rounded-xl border border-gray-400 bg-gray-100 p-2.5 shadow-sm transition-colors hover:border-gray-500">
      {/* 播放/暂停按钮 */}
      <button
        onClick={togglePlay}
        aria-label={isPlaying ? "Pause WILDFLOWER" : "Play WILDFLOWER"}
        className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gray-1200 text-gray-bg transition-transform hover:scale-105"
      >
        {isPlaying ? (
          <Pause className="size-3.5 fill-current" />
        ) : (
          <Play className="size-3.5 fill-current translate-x-0.5" />
        )}
      </button>

      {/* 歌曲信息与进度条 */}
      <div className="min-w-0 flex-1">
        <span className="block truncate text-body-sm font-medium text-gray-1200">
          WILDFLOWER
        </span>
        <span className="block truncate text-micro text-gray-1000">
          Billie Eilish · HIT ME HARD AND SOFT
        </span>
        <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-gray-300">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-100"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
      </div>

      {/* Spotify 品牌 Logo */}
      <Image
        src="/logos/spotify.svg"
        alt="Spotify"
        width={16}
        height={16}
        className="size-4 shrink-0 self-start opacity-70"
      />
    </div>
  );
}

"use client";

import { useState } from "react";

interface PlayerAvatarProps {
  src: string | null;
  alt: string;
  size: number;
  className?: string;
  fallbackClass?: string;
}

export function PlayerAvatar({
  src,
  alt,
  size,
  className = "",
  fallbackClass = "text-sm font-bold text-white/40",
}: PlayerAvatarProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
      >
        <span className={fallbackClass}>{alt.charAt(0)}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className={`object-cover ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

"use client";

import { useState } from "react";
import Image from "next/image";

type ProfilePhotoProps = {
  name: string;
  photoUrl: string;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
  className?: string;
  /** Extra classes for the initials fallback surface. */
  fallbackClassName?: string;
};

function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "?";
  }
  if (parts.length === 1) {
    return parts[0]!.slice(0, 2).toUpperCase();
  }
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}

export function ProfilePhoto({
  name,
  photoUrl,
  fill = true,
  sizes,
  priority,
  className = "object-cover object-top",
  fallbackClassName = "",
}: ProfilePhotoProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        aria-label={`Photo of ${name}`}
        role="img"
        className={[
          "flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/80 to-primary/40 text-surface",
          fallbackClassName,
        ].join(" ")}
      >
        <span className="text-2xl font-semibold tracking-wide">
          {initialsFor(name)}
        </span>
      </div>
    );
  }

  return (
    <Image
      src={photoUrl}
      alt={`Photo of ${name}`}
      fill={fill}
      sizes={sizes}
      priority={priority}
      draggable={false}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}

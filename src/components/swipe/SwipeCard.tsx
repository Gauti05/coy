"use client";

import { MapPin } from "lucide-react";
import {
  motion,
  type MotionValue,
  useTransform,
  type PanInfo,
} from "framer-motion";
import { ProfilePhoto } from "@/components/ProfilePhoto";
import type { PublicProfile } from "@/lib/api-client";
import type { SwipeCommit } from "./swipeHelpers";

type SwipeCardProps = {
  profile: PublicProfile;
  isTop: boolean;
  /** Shared drag x from the top card; drives stamps + behind-card peek. */
  dragX: MotionValue<number>;
  disabled?: boolean;
  reducedMotion?: boolean;
  forcedStamp?: SwipeCommit | null;
  onDragEnd?: (info: PanInfo) => void;
};

export function SwipeCard({
  profile,
  isTop,
  dragX,
  disabled,
  reducedMotion,
  forcedStamp,
  onDragEnd,
}: SwipeCardProps) {
  const rotate = useTransform(dragX, [-200, 0, 200], [-15, 0, 15]);
  const likeOpacity = useTransform(dragX, [40, 120], [0, 1]);
  const nopeOpacity = useTransform(dragX, [-120, -40], [1, 0]);
  const absX = useTransform(dragX, (value) => Math.abs(value));
  const behindScale = useTransform(absX, [0, 120], [0.94, 1]);
  const behindY = useTransform(absX, [0, 120], [14, 0]);

  return (
    <motion.article
      className="absolute inset-0 select-none overflow-hidden rounded-2xl bg-surface shadow-md"
      style={
        isTop
          ? {
              x: dragX,
              rotate: reducedMotion ? 0 : rotate,
              touchAction: "pan-y",
              zIndex: 2,
            }
          : {
              scale: behindScale,
              y: behindY,
              zIndex: 1,
            }
      }
      drag={isTop && !disabled && !reducedMotion ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.92}
      onDragEnd={(_, info) => {
        onDragEnd?.(info);
      }}
    >
      <div className="relative h-full w-full">
        <ProfilePhoto
          name={profile.name}
          photoUrl={profile.photoUrl}
          sizes="(max-width: 448px) 100vw, 448px"
          priority={isTop}
          className="object-cover object-top"
          fallbackClassName="text-4xl"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/35 to-transparent" />

        {isTop ? (
          <>
            <motion.div
              aria-hidden
              style={{
                opacity: forcedStamp === "like" ? 1 : likeOpacity,
              }}
              className="absolute left-5 top-5 rounded-lg border-4 border-success px-3 py-1 text-2xl font-black tracking-wide text-success"
            >
              LIKE
            </motion.div>
            <motion.div
              aria-hidden
              style={{
                opacity: forcedStamp === "pass" ? 1 : nopeOpacity,
              }}
              className="absolute right-5 top-5 rounded-lg border-4 border-danger px-3 py-1 text-2xl font-black tracking-wide text-danger"
            >
              NOPE
            </motion.div>
          </>
        ) : null}

        <div className="absolute inset-x-0 bottom-0 space-y-2 p-5 text-white">
          <h2 className="text-2xl font-semibold tracking-tight">
            {profile.name}
            <span className="font-medium text-white/90">, {profile.age}</span>
          </h2>
          <p className="flex items-center gap-1.5 text-sm text-white/85">
            <MapPin className="h-4 w-4 shrink-0" aria-hidden />
            <span className="truncate">{profile.location}</span>
          </p>
          <p className="line-clamp-2 text-sm leading-snug text-white/90">
            {profile.bio}
          </p>
          <ul className="flex flex-wrap gap-1.5 pt-1">
            {profile.interests.map((interest) => (
              <li
                key={interest}
                className="rounded-full bg-white/20 px-2.5 py-1 text-xs font-medium backdrop-blur-sm"
              >
                {interest}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.article>
  );
}

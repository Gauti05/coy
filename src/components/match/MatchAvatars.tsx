"use client";

import { User } from "lucide-react";
import { motion } from "framer-motion";
import { ProfilePhoto } from "@/components/ProfilePhoto";
import type { PublicProfile } from "@/lib/api-client";

type MatchAvatarsProps = {
  profile: PublicProfile;
  reducedMotion?: boolean;
};

export function MatchAvatars({ profile, reducedMotion }: MatchAvatarsProps) {
  return (
    <div className="relative mx-auto flex h-28 w-48 items-center justify-center">
      <motion.div
        className="absolute left-2 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-surface bg-gradient-to-br from-primary to-primary/70 text-surface shadow-lg"
        initial={reducedMotion ? { opacity: 0 } : { opacity: 0, x: -56 }}
        animate={{ opacity: 1, x: 0 }}
        transition={
          reducedMotion
            ? { duration: 0.2 }
            : { type: "spring", stiffness: 260, damping: 22 }
        }
        aria-hidden
      >
        <User className="h-10 w-10" strokeWidth={2} />
      </motion.div>

      <motion.div
        className="absolute right-2 h-24 w-24 overflow-hidden rounded-full border-4 border-surface bg-background shadow-lg"
        initial={reducedMotion ? { opacity: 0 } : { opacity: 0, x: 56 }}
        animate={{ opacity: 1, x: 0 }}
        transition={
          reducedMotion
            ? { duration: 0.2 }
            : { type: "spring", stiffness: 260, damping: 22, delay: 0.05 }
        }
      >
        <div className="relative h-full w-full">
          <ProfilePhoto
            name={profile.name}
            photoUrl={profile.photoUrl}
            sizes="96px"
            className="object-cover object-top"
            fallbackClassName="text-lg"
          />
        </div>
      </motion.div>
    </div>
  );
}

"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { BRAND } from "@/lib/brand";

export default function TopLogos() {
  const { team, banner } = BRAND.logos;
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-4 left-4 sm:top-6 sm:left-6 z-30 pointer-events-none"
        aria-hidden
      >
        {/* Logo Babby Rodriguez — fichier blanc/transparent fourni par le client : sur
            fond clair, il faut une plaque sombre derrière pour rester visible. */}
        <div className="bg-black/90 rounded-2xl px-3 py-2 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.35)]">
          <Image
            src={team.src}
            alt={team.alt}
            width={team.width}
            height={team.height}
            priority
            className="h-10 sm:h-12 w-auto"
          />
        </div>
      </motion.div>

      {/* Logo RE/MAX Platine — même contrainte : plaque sombre derrière le logo blanc */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-4 right-4 sm:top-6 sm:right-6 z-30 pointer-events-none"
        aria-hidden
      >
        <div className="bg-black/90 rounded-2xl px-3 py-2 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.35)]">
          <Image
            src={banner.src}
            alt={banner.alt}
            width={banner.width}
            height={banner.height}
            priority
            className="h-8 sm:h-10 w-auto"
          />
        </div>
      </motion.div>
    </>
  );
}

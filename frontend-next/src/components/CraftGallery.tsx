"use client";

import React from "react";
import { CRAFT_ITEMS } from "@/lib/data";
import { PhotoCard } from "@/components/PhotoCard";
import { Stamp } from "@/components/Stamp";

export function CraftGallery() {
  return (
    <div className="w-full">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="font-serif text-lg italic text-gray-1200">
          Selected Craft & Analog Moments
        </h3>
        <span className="font-mono text-micro text-gray-1000">
          Paris / Nancy / On the move
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-5">
        {CRAFT_ITEMS.map((item, idx) => {
          if (item.kind === "stamp" && item.city && item.numeral) {
            return (
              <div key={idx} className="flex items-center justify-center">
                <Stamp
                  src={item.src}
                  city={item.city}
                  numeral={item.numeral}
                  label={item.label}
                  width={150}
                  height={190}
                />
              </div>
            );
          }

          return (
            <div key={idx} className="flex items-center justify-center">
              <PhotoCard
                src={item.src}
                alt={item.label}
                aspect={item.aspect}
                rotate={(idx % 5) - 2}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

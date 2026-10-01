"use client";

import React, { useEffect, useState } from "react";

export function ParisClock() {
  const [timeStr, setTimeStr] = useState<string | null>(null);

  useEffect(() => {
    const formatter = new Intl.DateTimeFormat("fr-FR", {
      timeZone: "Europe/Paris",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    const update = () => setTimeStr(formatter.format(new Date()));
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <span className="font-mono text-micro tabular-nums text-gray-1000">
      Paris
      <span className="mx-1 text-gray-600" aria-hidden="true">·</span>
      <span className="inline-block min-w-[62px]">{timeStr ?? "--:--:--"}</span>
    </span>
  );
}

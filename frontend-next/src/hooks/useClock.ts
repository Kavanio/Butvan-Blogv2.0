"use client";

import { useEffect, useState } from "react";
import { SITE_CONFIG } from "@/constants/site";

export function useClock(timeZone: string = SITE_CONFIG.timezone) {
  const [timeString, setTimeString] = useState<string | null>(null);

  useEffect(() => {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    const update = () => setTimeString(formatter.format(new Date()));
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [timeZone]);

  return timeString;
}

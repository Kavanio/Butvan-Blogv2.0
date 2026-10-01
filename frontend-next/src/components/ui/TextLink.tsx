"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useSound } from "@/hooks/useSound";

interface TextLinkProps {
  href: string;
  children: React.ReactNode;
  external?: boolean;
  className?: string;
}

export function TextLink({
  href,
  children,
  external = false,
  className = "",
}: TextLinkProps) {
  const { playTick } = useSound();

  const baseStyle =
    "inline-flex items-center gap-0.5 font-medium text-gray-1200 underline decoration-gray-600 underline-offset-[3px] transition-colors duration-200 hover:decoration-gray-1100";

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={playTick}
        className={`${baseStyle} ${className}`}
      >
        <span>{children}</span>
        <ArrowUpRight className="size-3 text-gray-800" />
      </a>
    );
  }

  return (
    <Link
      href={href}
      onMouseEnter={playTick}
      className={`${baseStyle} ${className}`}
    >
      <span>{children}</span>
    </Link>
  );
}

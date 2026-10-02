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
        className={`group ${baseStyle} ${className}`}
      >
        <span>{children}</span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="inline-block size-[11px] max-w-0 -translate-x-0.5 translate-y-0.5 overflow-hidden opacity-0 transition-[max-width,margin-left,transform,opacity] duration-300 ease-out group-hover:ml-0.5 group-hover:max-w-[11px] group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100"
          aria-hidden="true"
        >
          <path d="M7 17 17 7" />
          <path d="M8 7h9v9" />
        </svg>
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

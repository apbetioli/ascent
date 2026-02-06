"use client";

import { useEffect } from "react";

/**
 * Locks the document to the viewport when mounted (e.g. dashboard).
 * Prevents the page from being scrolled or moved past boundaries on mobile.
 */
export function ViewportLock() {
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtml = { overflow: html.style.overflow, height: html.style.height };
    const prevBody = { overflow: body.style.overflow, height: body.style.height };
    html.style.overflow = "hidden";
    html.style.height = "100dvh";
    body.style.overflow = "hidden";
    body.style.height = "100dvh";
    return () => {
      html.style.overflow = prevHtml.overflow;
      html.style.height = prevHtml.height;
      body.style.overflow = prevBody.overflow;
      body.style.height = prevBody.height;
    };
  }, []);
  return null;
}

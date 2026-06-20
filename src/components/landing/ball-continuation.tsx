"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function BallContinuation() {
  const ballRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const ball = ballRef.current;
    if (!ball) return undefined;

    const getPositionForProgress = (progress: number) => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      // Locate key elements on the page to find their live viewport coordinates
      const gearHole = document.querySelector(".gear-transfer__gear-hole");
      const explorerCanvas = document.querySelector(".machine-explorer__canvas");
      const ctaBtn = document.querySelector(".final-cta__side a");
      const footerBrand = document.querySelector(".site-footer__brand a");

      const getRectCenter = (element: Element | null, defaultVal: { x: number; y: number }) => {
        if (!element) return defaultVal;
        const rect = element.getBoundingClientRect();
        return {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        };
      };

      const gearCenter = getRectCenter(gearHole, { x: width * 0.72, y: height * 0.5 });
      const explorerCenter = getRectCenter(explorerCanvas, { x: width * 0.65, y: height * 0.5 });
      const ctaCenter = getRectCenter(ctaBtn, { x: width * 0.8, y: height * 0.5 });
      const footerCenter = getRectCenter(footerBrand, { x: width * 0.15, y: height * 0.9 });

      // Interpolate positions across segments of document progress (0 to 1)
      if (progress <= 0.12) {
        // Hero section
        const t = progress / 0.12;
        return {
          x: width * 0.15 + (width * 0.1) * t,
          y: height * 0.3 + (height * 0.4) * t,
        };
      } else if (progress <= 0.28) {
        // Drop into Gear center
        const t = (progress - 0.12) / 0.16;
        const startX = width * 0.25;
        const startY = height * 0.7;
        return {
          x: startX + (gearCenter.x - startX) * t,
          y: startY + (gearCenter.y - startY) * t,
        };
      } else if (progress <= 0.38) {
        // Sticky lock rotation in Gear
        return gearCenter;
      } else if (progress <= 0.5) {
        // Float to Inside Sequence (left side)
        const t = (progress - 0.38) / 0.12;
        const endX = width * 0.18;
        const endY = height * 0.55;
        return {
          x: gearCenter.x + (endX - gearCenter.x) * t,
          y: gearCenter.y + (endY - gearCenter.y) * t,
        };
      } else if (progress <= 0.62) {
        // Glide to Material Sequence (right side)
        const t = (progress - 0.5) / 0.12;
        const startX = width * 0.18;
        const startY = height * 0.55;
        const endX = width * 0.82;
        const endY = height * 0.45;
        return {
          x: startX + (endX - startX) * t,
          y: startY + (endY - startY) * t,
        };
      } else if (progress <= 0.72) {
        // Glide to Finishing Sequence (left side)
        const t = (progress - 0.62) / 0.1;
        const startX = width * 0.82;
        const startY = height * 0.45;
        const endX = width * 0.15;
        const endY = height * 0.65;
        return {
          x: startX + (endX - startX) * t,
          y: startY + (endY - startY) * t,
        };
      } else if (progress <= 0.8) {
        // Float to CNC model Explorer
        const t = (progress - 0.72) / 0.08;
        const startX = width * 0.15;
        const startY = height * 0.65;
        return {
          x: startX + (explorerCenter.x - startX) * t,
          y: startY + (explorerCenter.y - startY) * t,
        };
      } else if (progress <= 0.88) {
        // Hover around CNC Explorer/Capabilities
        const t = (progress - 0.8) / 0.08;
        const endX = width * 0.25;
        const endY = height * 0.5;
        return {
          x: explorerCenter.x + (endX - explorerCenter.x) * t,
          y: explorerCenter.y + (endY - explorerCenter.y) * t,
        };
      } else if (progress <= 0.94) {
        // Travel to Contact button
        const t = (progress - 0.88) / 0.06;
        const startX = width * 0.25;
        const startY = height * 0.5;
        return {
          x: startX + (ctaCenter.x - startX) * t,
          y: startY + (ctaCenter.y - startY) * t,
        };
      } else {
        // Fall into footer logo
        const t = (progress - 0.94) / 0.06;
        return {
          x: ctaCenter.x + (footerCenter.x - ctaCenter.x) * t,
          y: ctaCenter.y + (footerCenter.y - ctaCenter.y) * t,
        };
      }
    };

    const trigger = ScrollTrigger.create({
      trigger: document.body,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.6,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const progress = clamp(self.progress, 0, 1);
        const point = getPositionForProgress(progress);

        gsap.set(ball, {
          x: point.x,
          y: point.y,
          xPercent: -50,
          yPercent: -50,
          rotate: progress * 2400,
          scale: 1 - Math.sin(progress * Math.PI) * 0.15,
        });
      },
    });

    return () => {
      trigger.kill();
    };
  }, []);

  return (
    <div className="ball-continuation" aria-hidden="true">
      <div ref={ballRef} className="ball-continuation__ball" />
    </div>
  );
}

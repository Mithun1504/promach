"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

const getThemeColorForProgress = (progress: number) => {
  if (progress <= 0.12) return "#00f0ff"; // Hero (Cyan)
  if (progress <= 0.38) return "#ff7300"; // Gear Transfer (Orange)
  if (progress <= 0.5) return "#00f0ff";  // Milling (Cyan)
  if (progress <= 0.62) return "#ff7300"; // Turning (Orange)
  if (progress <= 0.72) return "#b800ff"; // Grinding (Purple)
  if (progress <= 0.8) return "#b3ff00";  // Honing (Lime)
  return "#00f0ff"; // Explorer / Footer (Cyan)
};

export function BallContinuation() {
  const ballRef = useRef<HTMLDivElement | null>(null);
  const coreRef = useRef<HTMLDivElement | null>(null);
  const targetCenter = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const ball = ballRef.current;
    const core = coreRef.current;
    if (!ball || !core) return undefined;

    const readoutX = ball.querySelector(".readout-x span") as HTMLElement;
    const readoutY = ball.querySelector(".readout-y span") as HTMLElement;

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

    // Track mouse coordinates for magnetic core pull
    let currentMouseX = 0;
    let currentMouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      currentMouseX = e.clientX;
      currentMouseY = e.clientY;
      updateMagneticCore();
    };

    const updateMagneticCore = () => {
      const targetX = targetCenter.current.x;
      const targetY = targetCenter.current.y;
      if (targetX === 0 && targetY === 0) return;

      const dx = currentMouseX - targetX;
      const dy = currentMouseY - targetY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      const threshold = 180;
      if (distance < threshold) {
        const force = (threshold - distance) / threshold; // 1 at center, 0 at boundary
        // Pull center dot towards cursor
        const pullX = dx * 0.24 * force;
        const pullY = dy * 0.24 * force;
        
        gsap.to(core, {
          x: pullX,
          y: pullY,
          duration: 0.2,
          ease: "power1.out",
          overwrite: "auto",
        });

        // Also tilt/skew the outer rings slightly towards cursor for tactile feedback
        const rings = ball.querySelector(".datum-tracker__rings") as HTMLElement;
        if (rings) {
          gsap.to(rings, {
            x: pullX * 0.3,
            y: pullY * 0.3,
            skewX: pullX * 0.15,
            skewY: pullY * 0.15,
            duration: 0.2,
            ease: "power1.out",
            overwrite: "auto",
          });
        }

        // Show active cursor readout in coordinate box
        if (readoutX && readoutY) {
          readoutX.innerText = Math.round(currentMouseX).toString().padStart(4, "0");
          readoutY.innerText = Math.round(currentMouseY).toString().padStart(4, "0");
        }
      } else {
        // Reset core and rings
        gsap.to(core, {
          x: 0,
          y: 0,
          duration: 0.4,
          ease: "power2.out",
          overwrite: "auto",
        });

        const rings = ball.querySelector(".datum-tracker__rings") as HTMLElement;
        if (rings) {
          gsap.to(rings, {
            x: 0,
            y: 0,
            skewX: 0,
            skewY: 0,
            duration: 0.4,
            ease: "power2.out",
            overwrite: "auto",
          });
        }

        // Show target coordinates readout in coordinate box
        if (readoutX && readoutY) {
          readoutX.innerText = Math.round(targetX).toString().padStart(4, "0");
          readoutY.innerText = Math.round(targetY).toString().padStart(4, "0");
        }
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

        targetCenter.current = { x: point.x, y: point.y };

        // 1. Shift position
        gsap.set(ball, {
          x: point.x,
          y: point.y,
          xPercent: -50,
          yPercent: -50,
          scale: 1 - Math.sin(progress * Math.PI) * 0.12,
        });

        // 2. Set dynamic theme colors based on scroll progress
        const color = getThemeColorForProgress(progress);
        ball.style.setProperty("--tracker-color", color);
        ball.style.setProperty("--tracker-color-glow", `${color}33`);

        // 3. Set velocity animation speed
        const velocity = Math.abs(self.getVelocity());
        const speedFactor = clamp(1 / (1 + velocity * 0.0006), 0.15, 1.0);
        ball.style.setProperty("--spin-speed", speedFactor.toString());

        // 4. Update coordinates if not overridden by mouse magnetic proximity
        updateMagneticCore();
      },
    });

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      trigger.kill();
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div className="ball-continuation" aria-hidden="true">
      <div ref={ballRef} className="datum-tracker">
        {/* Central target core */}
        <div ref={coreRef} className="datum-tracker__core" />

        {/* Crosshair axis grids */}
        <div className="datum-tracker__crosshairs" />

        {/* Concentric rotating measuring vectors */}
        <svg viewBox="0 0 100 100" className="datum-tracker__rings">
          {/* Dash ring 1 (clockwise) */}
          <circle
            cx="50"
            cy="50"
            r="44"
            className="ring-outer"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="4 8"
            fill="none"
          />
          {/* Dash ring 2 (counter-clockwise) */}
          <circle
            cx="50"
            cy="50"
            r="33"
            className="ring-inner"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="18 5"
            fill="none"
          />
          {/* Metrology focal lines */}
          <line x1="50" y1="2" x2="50" y2="8" stroke="currentColor" strokeWidth="1.5" />
          <line x1="50" y1="92" x2="50" y2="98" stroke="currentColor" strokeWidth="1.5" />
          <line x1="2" y1="50" x2="8" y2="50" stroke="currentColor" strokeWidth="1.5" />
          <line x1="92" y1="50" x2="98" y2="50" stroke="currentColor" strokeWidth="1.5" />
        </svg>

        {/* Readout coordinates box */}
      </div>
    </div>
  );
}

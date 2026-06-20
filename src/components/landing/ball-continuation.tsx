"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

type Point = {
  x: number;
  y: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function cubic(points: [Point, Point, Point, Point], progress: number) {
  const inverse = 1 - progress;
  const a = inverse * inverse * inverse;
  const b = 3 * inverse * inverse * progress;
  const c = 3 * inverse * progress * progress;
  const d = progress * progress * progress;

  return {
    x: a * points[0].x + b * points[1].x + c * points[2].x + d * points[3].x,
    y: a * points[0].y + b * points[1].y + c * points[2].y + d * points[3].y,
  };
}

function journeyPoint(progress: number, width: number, height: number) {
  if (progress < 0.32) {
    const local = progress / 0.32;
    return cubic(
      [
        { x: width * 0.68, y: height * 0.48 },
        { x: width * 0.82, y: height * 0.38 },
        { x: width * 0.72, y: height * 0.78 },
        { x: width * 0.28, y: height * 0.7 },
      ],
      local,
    );
  }

  if (progress < 0.66) {
    const local = (progress - 0.32) / 0.34;
    return cubic(
      [
        { x: width * 0.28, y: height * 0.7 },
        { x: width * 0.12, y: height * 0.44 },
        { x: width * 0.58, y: height * 0.24 },
        { x: width * 0.76, y: height * 0.56 },
      ],
      local,
    );
  }

  const local = (progress - 0.66) / 0.34;
  return cubic(
    [
      { x: width * 0.76, y: height * 0.56 },
      { x: width * 0.92, y: height * 0.74 },
      { x: width * 0.72, y: height * 0.36 },
      { x: width * 0.58, y: height * 0.3 },
    ],
    local,
  );
}

export function BallContinuation() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const ballRef = useRef<HTMLDivElement | null>(null);
  const traceRef = useRef<SVGPathElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    const ball = ballRef.current;
    const trace = traceRef.current;
    const gear = document.querySelector<HTMLElement>(".gear-transfer");
    const model = document.querySelector<HTMLElement>(".machine-explorer");

    if (!root || !ball || !trace || !gear || !model) return undefined;

    const updateTrace = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      trace.setAttribute(
        "d",
        [
          `M ${width * 0.68} ${height * 0.48}`,
          `C ${width * 0.82} ${height * 0.38}, ${width * 0.72} ${height * 0.78}, ${width * 0.28} ${height * 0.7}`,
          `C ${width * 0.12} ${height * 0.44}, ${width * 0.58} ${height * 0.24}, ${width * 0.76} ${height * 0.56}`,
          `C ${width * 0.92} ${height * 0.74}, ${width * 0.72} ${height * 0.36}, ${width * 0.58} ${height * 0.3}`,
        ].join(" "),
      );
    };

    updateTrace();

    const trigger = ScrollTrigger.create({
      trigger: document.body,
      start: () => gear.offsetTop + gear.offsetHeight - window.innerHeight * 0.95,
      end: () => model.offsetTop,
      scrub: 0.72,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const progress = clamp(self.progress, 0, 1);
        const point = journeyPoint(progress, window.innerWidth, window.innerHeight);
        const intro = clamp(progress / 0.08, 0, 1);
        const outro = 1 - clamp((progress - 0.8) / 0.2, 0, 1);
        const opacity = Math.min(intro, outro);

        root.style.setProperty("--continuation-progress", String(progress));
        root.style.setProperty("--continuation-opacity", String(opacity));

        gsap.set(ball, {
          x: point.x,
          y: point.y,
          xPercent: -50,
          yPercent: -50,
          rotate: progress * 1480,
          scale: 1 - progress * 0.18,
          opacity,
        });

        gsap.set(trace, {
          opacity: opacity * 0.38,
          strokeDashoffset: 1 - progress,
        });
      },
    });

    window.addEventListener("resize", updateTrace);

    return () => {
      window.removeEventListener("resize", updateTrace);
      trigger.kill();
    };
  }, []);

  return (
    <div ref={rootRef} className="ball-continuation" aria-hidden="true">
      <svg className="ball-continuation__trace">
        <path ref={traceRef} pathLength="1" />
      </svg>
      <div ref={ballRef} className="ball-continuation__ball">
        <span />
      </div>
    </div>
  );
}

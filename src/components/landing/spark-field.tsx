"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

export function SparkField() {
  const fieldRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const field = fieldRef.current;
    if (!field) return undefined;

    const sparks = gsap.utils.toArray<HTMLSpanElement>(".spark-field span", field);

    gsap.set(sparks, {
      opacity: 0,
      x: () => gsap.utils.random(-260, 160),
      y: () => gsap.utils.random(80, 220),
      rotate: () => gsap.utils.random(-20, 20),
      scaleX: () => gsap.utils.random(0.45, 1.35),
    });

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: field,
        start: "top 70%",
        end: "bottom top",
        scrub: true,
      },
    });

    timeline.to(sparks, {
      opacity: () => gsap.utils.random(0.25, 0.95),
      x: () => gsap.utils.random(-60, 420),
      y: () => gsap.utils.random(-440, -120),
      rotate: () => gsap.utils.random(12, 42),
      duration: 1,
      stagger: {
        each: 0.018,
        from: "random",
      },
      ease: "power2.out",
    });

    return () => {
      timeline.scrollTrigger?.kill();
      timeline.kill();
    };
  }, []);

  return (
    <div ref={fieldRef} className="spark-field" aria-hidden="true">
      {Array.from({ length: 34 }, (_, index) => (
        <span key={index} />
      ))}
    </div>
  );
}

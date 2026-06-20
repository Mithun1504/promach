"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

const capabilities = [
  {
    index: "01",
    title: "CNC Milling",
    detail: "Complex faces, pockets, slots, and contour geometry held under controlled setup conditions.",
  },
  {
    index: "02",
    title: "CNC Turning",
    detail: "Diameters, shoulders, threads, and precision fits made repeatable across production batches.",
  },
  {
    index: "03",
    title: "Grinding",
    detail: "Surface control for flatness, finish, and contact quality where final geometry matters.",
  },
  {
    index: "04",
    title: "Honing",
    detail: "Internal surfaces refined for fit, motion, fluid control, and verified functional performance.",
  },
  {
    index: "05",
    title: "Complex Assemblies",
    detail: "Machined components planned around downstream assembly, inspection, and production continuity.",
  },
];

export function HorizontalCapabilities() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const railRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const rail = railRef.current;
    if (!section || !rail) return undefined;

    const ctx = gsap.context(() => {
      const distance = rail.scrollWidth - window.innerWidth;

      gsap.to(rail, {
        x: () => -Math.max(0, distance),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${Math.max(1200, distance + window.innerHeight * 1.4)}`,
          scrub: 0.7,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      gsap.fromTo(
        ".capability-card__line",
        { scaleX: 0 },
        {
          scaleX: 1,
          transformOrigin: "left",
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        },
      );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="horizontal-capabilities" id="capabilities">
      <div className="horizontal-capabilities__header">
        <span className="section-kicker">Capability Matrix</span>
        <h2>Capabilities engineered around tolerance.</h2>
      </div>
      <div ref={railRef} className="horizontal-capabilities__rail">
        {capabilities.map((item) => (
          <article key={item.title} className="capability-card">
            <span>{item.index}</span>
            <div className="capability-card__line" />
            <h3>{item.title}</h3>
            <p>{item.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

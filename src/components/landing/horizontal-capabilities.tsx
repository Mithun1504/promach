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
    color: "#00f0ff", // Cyan
  },
  {
    index: "02",
    title: "CNC Turning",
    detail: "Diameters, shoulders, threads, and precision fits made repeatable across production batches.",
    color: "#ff7300", // Orange
  },
  {
    index: "03",
    title: "Grinding",
    detail: "Surface control for flatness, finish, and contact quality where final geometry matters.",
    color: "#b800ff", // Purple
  },
  {
    index: "04",
    title: "Honing",
    detail: "Internal surfaces refined for fit, motion, fluid control, and verified functional performance.",
    color: "#b3ff00", // Lime
  },
  {
    index: "05",
    title: "Complex Assemblies",
    detail: "Machined components planned around downstream assembly, inspection, and production continuity.",
    color: "#00f0ff", // Cyan again
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

      // Expand card connector lines as they enter screen center
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

  // 3D holographic tilt card physics
  const handleMouseMove = (e: React.MouseEvent<HTMLElement>, cardColor: string) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    const rotateX = -(y / (rect.height / 2)) * 12;
    const rotateY = (x / (rect.width / 2)) * 12;

    gsap.to(card, {
      rotateX,
      rotateY,
      transformPerspective: 1000,
      ease: "power1.out",
      duration: 0.25,
      borderColor: cardColor,
      boxShadow: `0 30px 60px rgba(0,0,0,0.5), 0 0 30px ${cardColor}4D`,
    });
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
    const card = e.currentTarget;
    gsap.to(card, {
      rotateX: 0,
      rotateY: 0,
      transformPerspective: 1000,
      ease: "power2.out",
      duration: 0.5,
      borderColor: "rgba(255, 255, 255, 0.05)",
      boxShadow: "0 24px 60px rgba(0, 0, 0, 0.3)",
    });
  };

  return (
    <section ref={sectionRef} className="horizontal-capabilities" id="capabilities">
      <div className="horizontal-capabilities__header">
        <span className="section-kicker">Capability Matrix</span>
        <h2>Capabilities engineered around tolerance.</h2>
      </div>
      <div ref={railRef} className="horizontal-capabilities__rail">
        {capabilities.map((item) => (
          <article
            key={item.title}
            className="capability-card"
            style={{
              // Apply unique variable colors
              "--theme-primary": item.color,
              "--theme-primary-glow": `${item.color}3F`,
            } as React.CSSProperties}
            onMouseMove={(e) => handleMouseMove(e, item.color)}
            onMouseLeave={handleMouseLeave}
          >
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

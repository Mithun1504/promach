"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { type CSSProperties, type MouseEvent, useEffect, useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

const capabilities = [
  {
    index: "01",
    title: "CNC Milling",
    detail: "Complex faces, pockets, slots, and contour geometry held under controlled setup conditions.",
    metric: "5-axis",
    tolerance: "+/-0.005 mm",
    process: ["fixture", "rough", "finish"],
    color: "#00f0ff", // Cyan
  },
  {
    index: "02",
    title: "CNC Turning",
    detail: "Diameters, shoulders, threads, and precision fits made repeatable across production batches.",
    metric: "18k rpm",
    tolerance: "thread-fit",
    process: ["chuck", "turn", "verify"],
    color: "#ff7300", // Orange
  },
  {
    index: "03",
    title: "Grinding",
    detail: "Surface control for flatness, finish, and contact quality where final geometry matters.",
    metric: "Ra focus",
    tolerance: "flatness",
    process: ["dress", "spark", "measure"],
    color: "#b800ff", // Purple
  },
  {
    index: "04",
    title: "Honing",
    detail: "Internal surfaces refined for fit, motion, fluid control, and verified functional performance.",
    metric: "bore ID",
    tolerance: "micro finish",
    process: ["align", "hone", "gauge"],
    color: "#b3ff00", // Lime
  },
  {
    index: "05",
    title: "Complex Assemblies",
    detail: "Machined components planned around downstream assembly, inspection, and production continuity.",
    metric: "cell build",
    tolerance: "stack-up",
    process: ["machine", "inspect", "assemble"],
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

      gsap.fromTo(
        ".horizontal-capabilities__progress span",
        { scaleX: 0 },
        {
          scaleX: 1,
          transformOrigin: "left",
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => `+=${Math.max(1200, distance + window.innerHeight * 1.4)}`,
            scrub: true,
          },
        },
      );

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
  const handleMouseMove = (e: MouseEvent<HTMLElement>, cardColor: string) => {
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

  const handleMouseLeave = (e: MouseEvent<HTMLElement>) => {
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
        <div>
          <span className="section-kicker">Capability Matrix</span>
          <h2>Capabilities engineered around tolerance.</h2>
        </div>
        <p>
          Scroll through the production cell. Each process is mapped from setup
          strategy to inspection confidence before it reaches volume.
        </p>
      </div>
      <div className="horizontal-capabilities__progress" aria-hidden="true">
        <span />
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
            } as CSSProperties}
            onMouseMove={(e) => handleMouseMove(e, item.color)}
            onMouseLeave={handleMouseLeave}
          >
            <div className="capability-card__top">
              <span>{item.index}</span>
              <small>{item.metric}</small>
            </div>
            <div className="capability-card__dial" aria-hidden="true">
              <i />
              <b />
            </div>
            <h3>{item.title}</h3>
            <p>{item.detail}</p>
            <div className="capability-card__process">
              {item.process.map((step) => (
                <span key={step}>{step}</span>
              ))}
            </div>
            <div className="capability-card__footer">
              <span>controlled tolerance</span>
              <strong>{item.tolerance}</strong>
            </div>
            <div className="capability-card__line" />
          </article>
        ))}
      </div>
    </section>
  );
}

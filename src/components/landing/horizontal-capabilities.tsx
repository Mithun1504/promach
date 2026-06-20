"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { type CSSProperties, type MouseEvent, useEffect, useRef, useState } from "react";

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
    title: "Assemblies",
    detail: "Machined components planned around downstream assembly, inspection, and production continuity.",
    metric: "cell build",
    tolerance: "stack-up",
    process: ["machine", "inspect", "assemble"],
    color: "#00f0ff", // Cyan again
  },
];

const getCardBackDetails = (index: number) => {
  const codeLines = [
    "G01 X24.52 Y10.84 Z-2.0 F1200",
    "G02 X32.18 Y15.42 R5.0 F1000",
    "G00 Z10.0 M09 (coolant off)",
    "M05 (spindle stop)",
    "G28 G91 Z0 (return to home)",
    "M30 (program end)",
    "G01 X0.0 Y0.0 Z5.0 F3000",
    "M03 S18000 (spindle active)",
    "G01 Z-1.25 F800",
    "G01 X12.5 Y24.0 F1200",
  ];

  switch (index) {
    case 0:
      return {
        gcode: codeLines,
        specs: [
          { label: "SPINDLE LOAD", value: "18k RPM / 68%" },
          { label: "COOLANT", value: "8.4 BAR (ACTIVE)" },
          { label: "TOLERANCE", value: "< 0.005 mm" },
        ],
        processType: "5-AXIS MILL CELL",
      };
    case 1:
      return {
        gcode: [
          "G00 X45.0 Z2.0 M08",
          "G96 S220 M03 (constant speed)",
          "G01 Z-32.5 F0.18",
          "G01 X50.0 F0.25",
          "G00 X100.0 Z10.0 M09",
          "M05 (spindle stop)",
          "M30 (end program)",
        ],
        specs: [
          { label: "LATHE SPEED", value: "6k RPM" },
          { label: "COOLANT", value: "12.0 BAR (ACTIVE)" },
          { label: "TOLERANCE", value: "THREAD FIT M20" },
        ],
        processType: "CHUCK PROFILE CELL",
      };
    case 2:
      return {
        gcode: [
          "G00 X0 Y0 Z2.0 M08",
          "G01 Z0.005 F10 (feed wheel)",
          "G04 P2.0 (dwell time)",
          "G01 Z0.01 F5 (finish pass)",
          "G00 Z15.0 M09",
          "M05 (wheel stop)",
          "M30 (cycle end)",
        ],
        specs: [
          { label: "WHEEL SPEED", value: "3,200 RPM" },
          { label: "COOLANT", value: "15.0 BAR (ACTIVE)" },
          { label: "FINISH TYPE", value: "Ra 0.1 MICRONS" },
        ],
        processType: "FLATNESS SPARK CELL",
      };
    case 3:
      return {
        gcode: [
          "G00 Z50.0 M08",
          "G01 Z-120.0 F120 (stroke in)",
          "M03 S250 (expansion active)",
          "G01 Z-10.0 F150 (stroke out)",
          "M05 (honing stop)",
          "G00 Z100.0 M09",
          "M30 (cycle end)",
        ],
        specs: [
          { label: "STROKE RHYTHM", value: "120 str/min" },
          { label: "COOLANT", value: "4.5 BAR (ACTIVE)" },
          { label: "BORE LIMIT", value: "H6 SPECIFIED" },
        ],
        processType: "CROSSHATCH ID CELL",
      };
    default:
      return {
        gcode: [
          "M00 (stop for inspection)",
          "CMM_START PROFILE_CHECK",
          "SCAN_LASER_MATRIX 100%",
          "VERIFY_DATUMS A_B_C",
          "CALCULATE_STACKUP_TOL",
          "DATA_LOG_OK // NEXT_CELL",
          "M30 (assembly end)",
        ],
        specs: [
          { label: "METROLOGY", value: "CMM LASER" },
          { label: "DATUM FRAME", value: "A / B / C REFS" },
          { label: "STACK STATUS", value: "100% PASS" },
        ],
        processType: "DATUM ASSEMBLY CELL",
      };
  }
};

export function HorizontalCapabilities() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const railRef = useRef<HTMLDivElement | null>(null);
  const [flippedIndex, setFlippedIndex] = useState<number | null>(null);

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
  const handleMouseMove = (e: MouseEvent<HTMLElement>, cardColor: string, cardIndex: number) => {
    if (flippedIndex === cardIndex) return;

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

  const handleMouseLeave = (e: MouseEvent<HTMLElement>, cardIndex: number) => {
    if (flippedIndex === cardIndex) return;

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

  const handleCardClick = (index: number, cardEl: HTMLElement | null) => {
    if (!cardEl) return;

    if (flippedIndex === index) {
      setFlippedIndex(null);
    } else {
      // Clear hover tilt inline styles so they don't fight CSS 3D flip rotation
      gsap.killTweensOf(cardEl);
      gsap.set(cardEl, {
        clearProps: "transform,rotateX,rotateY,transformPerspective,borderColor,boxShadow",
      });
      setFlippedIndex(index);
    }
  };

  return (
    <section ref={sectionRef} className="horizontal-capabilities" id="capabilities">
      <div className="interactive-cyber-grid" aria-hidden="true" />
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
        {capabilities.map((item, index) => {
          const isFlipped = flippedIndex === index;
          const backDetails = getCardBackDetails(index);

          return (
            <article
              key={item.title}
              className={`capability-card ${isFlipped ? "is-flipped" : ""}`}
              style={{
                "--theme-primary": item.color,
                "--theme-primary-glow": `${item.color}3F`,
              } as CSSProperties}
              onMouseMove={(e) => handleMouseMove(e, item.color, index)}
              onMouseLeave={(e) => handleMouseLeave(e, index)}
              onClick={(e) => {
                const target = e.target as HTMLElement;
                if (target.closest(".capability-card__back-footer button")) {
                  handleCardClick(index, e.currentTarget);
                  return;
                }
                if (!isFlipped) {
                  handleCardClick(index, e.currentTarget);
                }
              }}
            >
              <div className="capability-card__inner">
                {/* Front Face */}
                <div className="capability-card__front">
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
                </div>

                {/* Back Face */}
                <div className="capability-card__back">
                  <div className="capability-card__back-header">
                    <span>{backDetails.processType}</span>
                    <h4>{item.title}</h4>
                  </div>

                  <div className="capability-card__back-content">
                    {/* G-Code Stream */}
                    <div className="gcode-terminal">
                      <div className="gcode-terminal__header">G-CODE FEED // STACK_OK</div>
                      <div className="gcode-terminal__window">
                        <div className="gcode-terminal__feed">
                          {[...backDetails.gcode, ...backDetails.gcode].map((line, lIdx) => (
                            <div key={lIdx} className="gcode-line">
                              {line}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* CNC Telemetry Stats */}
                    <div className="telemetry-specs">
                      {backDetails.specs.map((spec, sIdx) => (
                        <div key={sIdx} className="telemetry-item">
                          <span>{spec.label}</span>
                          <strong>{spec.value}</strong>
                        </div>
                      ))}
                    </div>

                    {/* Hologram toolpath vector */}
                    <div className="hologram-vector" aria-hidden="true">
                      <svg viewBox="0 0 100 100" className="hologram-vector__svg">
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          stroke="currentColor"
                          strokeWidth="1"
                          strokeDasharray="3 6"
                          fill="none"
                        />
                        <circle cx="50" cy="50" r="28" stroke="currentColor" strokeWidth="1" fill="none" />
                        <line
                          x1="50"
                          y1="10"
                          x2="50"
                          y2="90"
                          stroke="currentColor"
                          strokeWidth="0.5"
                          strokeDasharray="2 2"
                        />
                        <line
                          x1="10"
                          y1="50"
                          x2="90"
                          y2="50"
                          stroke="currentColor"
                          strokeWidth="0.5"
                          strokeDasharray="2 2"
                        />
                        <path d="M 50,50 L 70,30" stroke="var(--theme-primary)" strokeWidth="1.5" />
                        <circle cx="70" cy="30" r="3" fill="var(--theme-primary)" />
                      </svg>
                    </div>
                  </div>

                  <div className="capability-card__back-footer">
                    <button className="return-btn">RETURN TO PROCESS</button>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

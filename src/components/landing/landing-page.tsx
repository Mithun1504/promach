"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  FrameSequence,
  type FrameChapter,
  type FrameSequenceConfig,
} from "./frame-sequence";
import { SmoothScrollProvider } from "./smooth-scroll-provider";
import { SparkField } from "./spark-field";
import { GearTransferSection } from "./gear-transfer-section";
import { CncMachineExplorer } from "./cnc-machine-explorer";
import { HorizontalCapabilities } from "./horizontal-capabilities";
import { BallContinuation } from "./ball-continuation";

gsap.registerPlugin(ScrollTrigger);

const frameSequences = {
  hero: {
    id: "cnc-dismantle",
    folder: "cnc-dismantle",
    frameCount: 300,
    extension: "webp",
    padLength: 3,
    priority: true,
  },
  inside: {
    id: "cnc-showcase",
    folder: "cnc-showcase",
    frameCount: 300,
    extension: "webp",
    padLength: 3,
    priority: true,
  },
  material: {
    id: "milling-to-turning",
    folder: "milling-to-turning",
    frameCount: 300,
    extension: "webp",
    padLength: 3,
    priority: true,
  },
  finishing: {
    id: "grinding-to-horning",
    folder: "grinding-to-horning",
    frameCount: 300,
    extension: "webp",
    padLength: 3,
    priority: true,
  },
} satisfies Record<string, FrameSequenceConfig>;

const heroChapters: FrameChapter[] = [
  {
    from: 1,
    to: 60,
    kicker: "ProMach",
    title: "PRECISION\nENGINEERED\nWITHOUT COMPROMISE",
    copy: "Advanced CNC Manufacturing For Complex Components",
    align: "left",
  },
  {
    from: 61,
    to: 120,
    title: "Every Component\nHas A Purpose",
    align: "left",
  },
  {
    from: 121,
    to: 180,
    title: "Thousands Of Movements.\nOne Precise Outcome.",
    align: "center",
  },
  {
    from: 181,
    to: 240,
    title: "Engineering\nIn Perfect Harmony",
    align: "right",
  },
  {
    from: 241,
    to: 300,
    title: "Built For Precision.\nTrusted For Production.",
    copy: "We do not simply manufacture components. We engineer precision.",
    align: "left",
  },
];

const insideChapters: FrameChapter[] = [
  {
    from: 1,
    to: 80,
    kicker: "Inside The Machine",
    title: "Technology\nYou Can Trust",
    align: "left",
  },
  {
    from: 81,
    to: 150,
    title: "Beyond\nThe Surface",
    align: "center",
  },
  {
    from: 151,
    to: 220,
    title: "Motion\nControl\nAccuracy",
    align: "right",
  },
  {
    from: 221,
    to: 300,
    title: "Engineered\nFrom The Inside Out",
    align: "left",
  },
];

const materialChapters: FrameChapter[] = [
  {
    from: 1,
    to: 70,
    kicker: "Material Transformation",
    title: "Material\nBecomes Geometry",
    align: "left",
  },
  {
    from: 71,
    to: 150,
    title: "Cut\nShape\nRefine",
    align: "center",
  },
  {
    from: 151,
    to: 240,
    title: "Repeatable\nAccurate\nControlled",
    align: "right",
  },
  {
    from: 241,
    to: 300,
    title: "Complexity\nMade Repeatable",
    align: "left",
  },
];

const finishingChapters: FrameChapter[] = [
  {
    from: 1,
    to: 100,
    kicker: "Precision Finishing",
    title: "Precision\nStarts With Control",
    align: "left",
  },
  {
    from: 101,
    to: 200,
    title: "Microns Matter",
    align: "center",
  },
  {
    from: 201,
    to: 260,
    title: "Surface\nPerfection",
    align: "right",
  },
  {
    from: 261,
    to: 300,
    title: "Finished Beyond\nSpecification",
    align: "left",
  },
];

const navItems = [
  { label: "Capabilities", href: "#capabilities" },
  { label: "Technology", href: "#technology" },
  { label: "Industries", href: "#industries" },
  { label: "Projects", href: "#metrics" },
  { label: "Contact", href: "#contact" },
];

const industries = [
  "Aerospace",
  "Medical",
  "Automotive",
  "Industrial Equipment",
  "Energy",
];

const metrics = [
  { label: "Tolerance Control", value: "+/-0.005 mm" },
  { label: "Machine Strategy", value: "5 Axis Machining" },
  { label: "Production Rhythm", value: "24/7 Production" },
  { label: "Development Path", value: "Rapid Prototyping" },
  { label: "Build Scope", value: "Custom Manufacturing" },
];

const projectSteps = [
  "Geometry review",
  "Material and tolerance map",
  "Prototype to production path",
];

function SplitTitle({ title, isActive = true }: { title: string; isActive?: boolean }) {
  return (
    <>
      {title.split("\n").map((line, lineIndex) => (
        <div key={lineIndex} className="char-container block">
          {line.split("").map((char, charIndex) => (
            <span
              key={charIndex}
              className="char-unit"
              style={{
                animationDelay: isActive
                  ? `${(lineIndex * 12 + charIndex) * 16}ms`
                  : "0ms",
              }}
            >
              {char === " " ? "\u00A0" : char}
            </span>
          ))}
        </div>
      ))}
    </>
  );
}

function useFramePreloader() {
  const preloadUrls = useMemo(() => {
    const sequences = Object.values(frameSequences);

    return sequences.flatMap((sequence) =>
      [1, 2, 3, 24, 48, 72].map((frame) => {
        const file = `${String(frame).padStart(sequence.padLength, "0")}.${
          sequence.extension
        }`;
        const base =
          process.env.NEXT_PUBLIC_S3_FRAMES_URL ??
          "https://promach.s3.ap-south-1.amazonaws.com";
        return `${base.replace(/\/$/, "")}/${sequence.folder}/${file}`;
      }),
    );
  }, []);

  useEffect(() => {
    preloadUrls.forEach((url, index) => {
      window.setTimeout(() => {
        const image = new Image();
        image.decoding = "async";
        image.src = url;
      }, index * 30);
    });
  }, [preloadUrls]);
}

function Navigation() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 8);
    update();
    window.addEventListener("scroll", update, { passive: true });

    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <header className={`site-nav ${scrolled ? "is-scrolled" : ""}`}>
      <a className="site-nav__brand" href="#top" aria-label="ProMach home">
        <span>PRO</span>MACH
      </a>
      <nav className="site-nav__links" aria-label="Primary navigation">
        {navItems.map((item) => (
          <a key={item.href} href={item.href}>
            {item.label}
          </a>
        ))}
      </nav>
      <a className="site-nav__cta" href="#contact">
        Request Quote
      </a>
    </header>
  );
}

function IndustriesSection() {
  return (
    <section className="industries-section" id="industries">
      <span className="section-kicker">Industries</span>
      <h2>Built for environments where failure is not an option.</h2>
      <div className="industries-section__list">
        {industries.map((industry, index) => (
          <article key={industry}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <h3>{industry}</h3>
            <p>Precision components for demanding mechanical systems.</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function MetricsSection() {
  return (
    <section className="metrics-section" id="metrics">
      <div className="metrics-section__blueprint" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <span className="section-kicker">Capability Metrics</span>
      <h2>Blueprint discipline. Production confidence.</h2>
      <div className="metrics-section__grid">
        {metrics.map((metric, index) => (
          <article key={metric.label}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{metric.value}</strong>
            <p>{metric.label}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function FinalCta() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return undefined;

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: "top 72%",
      onEnter: () => setActive(true),
    });

    return () => trigger.kill();
  }, []);

  return (
    <section ref={sectionRef} className={`final-cta ${active ? "is-active" : ""}`} id="contact">
      <div className="final-cta__blueprint" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div>
        <span className="section-kicker">Project Review</span>
        <h2>
          <SplitTitle
            title={"Let's Build\nThe Next Component\nTogether."}
            isActive={active}
          />
        </h2>
        
        <div className="final-cta__diagnostic">
          <div>
            <span />
            <strong>INQUIRY GATEWAY: ACTIVE</strong>
          </div>
          <p>Upload drawings, material notes, or production targets. We will translate them into a machining route, inspection plan, and delivery path.</p>
        </div>
      </div>
      <div className="final-cta__side">
        <div className="final-cta__module-header">
          <span>RFQ CELL</span>
          <strong>24h review window</strong>
        </div>
        <p>
          Let&apos;s align on geometric parameters, material selection, quality inspection paths, and production timeline requirements.
        </p>
        <a href="mailto:projects@promach.example">Request A Quote</a>
        <div className="final-cta__steps">
          {projectSteps.map((step, index) => (
            <span key={step}>
              {String(index + 1).padStart(2, "0")} / {step}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__machine" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className="site-footer__brand">
        <a href="#top">
          <span>PRO</span>MACH
        </a>
        <p>We engineer precision.</p>
        <div className="site-footer__system">
          SYSTEMS INITIATED // OK_2026
        </div>
      </div>
      <div>
        <h3>Engineering Consultation</h3>
        <a href="mailto:engineering@promach.example">engineering@promach.example</a>
        <p>DFM, tolerance strategy, process routing.</p>
      </div>
      <div>
        <h3>Project Discussion</h3>
        <a href="mailto:projects@promach.example">projects@promach.example</a>
        <p>RFQs, prototypes, production planning.</p>
      </div>
      <div>
        <h3>Connect</h3>
        <a href="#contact">Request Quote</a>
        <a href="#capabilities">Capabilities</a>
        <a href="#technology">Machine Explorer</a>
      </div>
      <small>Copyright 2026 ProMach. Precision CNC Manufacturing.</small>
    </footer>
  );
}

export function LandingPage() {
  useFramePreloader();

  useEffect(() => {
    const sequences = document.querySelectorAll(".frame-sequence, .gear-transfer, .machine-explorer, .horizontal-capabilities, .industries-section, .metrics-section, .final-cta");
    const colors = [
      {
        primary: "#00f0ff", // Cyber Cyan
        primaryGlow: "rgba(0, 240, 255, 0.25)",
        secondary: "#b800ff",
        bg: "radial-gradient(circle at 50% 50%, rgba(0, 240, 255, 0.12) 0%, #040508 100%)",
        line: "rgba(0, 240, 255, 0.12)"
      },
      {
        primary: "#ff7300", // Solar Orange
        primaryGlow: "rgba(255, 115, 0, 0.25)",
        secondary: "#00f0ff",
        bg: "radial-gradient(circle at 50% 50%, rgba(255, 115, 0, 0.12) 0%, #040508 100%)",
        line: "rgba(255, 115, 0, 0.12)"
      },
      {
        primary: "#b800ff", // Ultra Purple
        primaryGlow: "rgba(184, 0, 255, 0.25)",
        secondary: "#b3ff00",
        bg: "radial-gradient(circle at 50% 50%, rgba(184, 0, 255, 0.12) 0%, #040508 100%)",
        line: "rgba(184, 0, 255, 0.12)"
      },
      {
        primary: "#b3ff00", // Acid Green
        primaryGlow: "rgba(179, 255, 0, 0.25)",
        secondary: "#ff7300",
        bg: "radial-gradient(circle at 50% 50%, rgba(179, 255, 0, 0.12) 0%, #040508 100%)",
        line: "rgba(179, 255, 0, 0.12)"
      },
      {
        primary: "#00f0ff", // Cyber Cyan fallback
        primaryGlow: "rgba(0, 240, 255, 0.25)",
        secondary: "#b800ff",
        bg: "radial-gradient(circle at 50% 50%, rgba(0, 240, 255, 0.12) 0%, #040508 100%)",
        line: "rgba(0, 240, 255, 0.12)"
      },
      {
        primary: "#ff7300", // Solar Orange fallback
        primaryGlow: "rgba(255, 115, 0, 0.25)",
        secondary: "#00f0ff",
        bg: "radial-gradient(circle at 50% 50%, rgba(255, 115, 0, 0.12) 0%, #040508 100%)",
        line: "rgba(255, 115, 0, 0.12)"
      },
      {
        primary: "#b800ff", // Ultra Purple fallback
        primaryGlow: "rgba(184, 0, 255, 0.25)",
        secondary: "#b3ff00",
        bg: "radial-gradient(circle at 50% 50%, rgba(184, 0, 255, 0.12) 0%, #040508 100%)",
        line: "rgba(184, 0, 255, 0.12)"
      }
    ];

    const ctx = gsap.context(() => {
      sequences.forEach((element, index) => {
        const theme = colors[index] || colors[0];

        ScrollTrigger.create({
          trigger: element,
          start: "top 55%",
          end: "bottom 45%",
          onToggle: (self) => {
            if (self.isActive) {
              gsap.to(":root", {
                "--theme-primary": theme.primary,
                "--theme-primary-glow": theme.primaryGlow,
                "--theme-secondary": theme.secondary,
                "--theme-bg-gradient": theme.bg,
                "--line": theme.line,
                duration: 0.72,
                ease: "power2.out",
              });
            }
          },
        });
      });
    });

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <SmoothScrollProvider>
      <main className="promach-page">
        {/* Floating Neon Background Ambient Glows */}
        <div className="ambient-glow ambient-glow--1" aria-hidden="true" />
        <div className="ambient-glow ambient-glow--2" aria-hidden="true" />
        <div className="ambient-glow ambient-glow--3" aria-hidden="true" />
        <div className="ambient-glow ambient-glow--4" aria-hidden="true" />

        <Navigation />

        <FrameSequence
          sectionId="top"
          config={frameSequences.hero}
          chapters={heroChapters}
          heightVh={500}
          className="hero-sequence"
          darken={0.4}
        />

        <GearTransferSection />
        <BallContinuation />

        <FrameSequence
          config={frameSequences.inside}
          chapters={insideChapters}
          heightVh={400}
          className="inside-sequence"
          darken={0.4}
          alignImage="right"
        />

        <FrameSequence
          config={frameSequences.material}
          chapters={materialChapters}
          heightVh={400}
          className="material-sequence"
          darken={0.4}
        />

        <FrameSequence
          config={frameSequences.finishing}
          chapters={finishingChapters}
          heightVh={400}
          className="finishing-sequence"
          darken={0.35}
          alignImage="left"
        >
          <SparkField />
        </FrameSequence>

        <CncMachineExplorer />
        <HorizontalCapabilities />
        <IndustriesSection />
        <MetricsSection />
        <FinalCta />
        <Footer />
      </main>
    </SmoothScrollProvider>
  );
}

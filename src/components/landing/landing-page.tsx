"use client";

import { useEffect, useMemo, useState } from "react";
import {
  FrameSequence,
  type FrameChapter,
  type FrameSequenceConfig,
} from "@/components/landing/frame-sequence";
import { SmoothScrollProvider } from "@/components/landing/smooth-scroll-provider";
import { SparkField } from "@/components/landing/spark-field";
import { GearTransferSection } from "@/components/landing/gear-transfer-section";
import { CncMachineExplorer } from "@/components/landing/cnc-machine-explorer";
import { HorizontalCapabilities } from "@/components/landing/horizontal-capabilities";
import { BallContinuation } from "@/components/landing/ball-continuation";

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
    variant: "wide",
  },
  {
    from: 61,
    to: 120,
    title: "Every Component\nHas A Purpose",
    align: "left",
    variant: "stacked",
  },
  {
    from: 121,
    to: 180,
    title: "Thousands Of Movements.\nOne Precise Outcome.",
    align: "center",
    variant: "wide",
  },
  {
    from: 181,
    to: 240,
    title: "Engineering\nIn Perfect Harmony",
    align: "right",
    variant: "stacked",
  },
  {
    from: 241,
    to: 300,
    title: "Built For Precision.\nTrusted For Production.",
    copy: "We do not simply manufacture components. We engineer precision.",
    align: "left",
    variant: "wide",
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
    variant: "data",
  },
  {
    from: 221,
    to: 300,
    title: "Engineered\nFrom The Inside Out",
    align: "left",
    variant: "wide",
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
    variant: "data",
  },
  {
    from: 151,
    to: 240,
    title: "Repeatable\nAccurate\nControlled",
    align: "right",
    variant: "data",
  },
  {
    from: 241,
    to: 300,
    title: "Complexity\nMade Repeatable",
    align: "left",
    variant: "wide",
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
    variant: "wide",
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
    variant: "wide",
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
  return (
    <section className="final-cta" id="contact">
      <div>
        <span className="section-kicker">Project Review</span>
        <h2>
          Let&apos;s Build
          <br />
          The Next Component
          <br />
          Together.
        </h2>
      </div>
      <div className="final-cta__side">
        <p>
          Precision Manufacturing. Advanced CNC Technology. Engineering
          Excellence.
        </p>
        <a href="mailto:projects@promach.example">Request A Quote</a>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__brand">
        <a href="#top">
          <span>PRO</span>MACH
        </a>
        <p>We engineer precision.</p>
      </div>
      <div>
        <h3>Engineering Consultation</h3>
        <a href="mailto:engineering@promach.example">engineering@promach.example</a>
      </div>
      <div>
        <h3>Project Discussion</h3>
        <a href="mailto:projects@promach.example">projects@promach.example</a>
      </div>
      <div>
        <h3>Connect</h3>
        <a href="#contact">Request Quote</a>
        <a href="#capabilities">Capabilities</a>
      </div>
      <small>Copyright 2026 ProMach. Precision CNC Manufacturing.</small>
    </footer>
  );
}

export function LandingPage() {
  useFramePreloader();

  return (
    <SmoothScrollProvider>
      <main className="promach-page">
        <Navigation />
        <FrameSequence
          sectionId="top"
          config={frameSequences.hero}
          chapters={heroChapters}
          heightVh={500}
          className="hero-sequence"
          darken={0.54}
        />
        <GearTransferSection />
        <BallContinuation />
        <FrameSequence
          config={frameSequences.inside}
          chapters={insideChapters}
          heightVh={400}
          className="inside-sequence"
          darken={0.5}
          alignImage="right"
        />
        <FrameSequence
          config={frameSequences.material}
          chapters={materialChapters}
          heightVh={400}
          className="material-sequence"
          darken={0.5}
        />
        <FrameSequence
          config={frameSequences.finishing}
          chapters={finishingChapters}
          heightVh={400}
          className="finishing-sequence"
          darken={0.45}
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

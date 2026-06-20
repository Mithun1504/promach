"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import gearImage from "@/assets/images/gear.png";

gsap.registerPlugin(ScrollTrigger);

const messages = [
  {
    kicker: "Precision Transfer",
    title: "Motion finds its datum.",
    copy: "A chrome reference drops out of the machine path and aligns with the center of the next mechanical system.",
    stat: "0.00 mm",
    statLabel: "datum drift",
  },
  {
    kicker: "Mechanical Lock",
    title: "The gear accepts the load.",
    copy: "Once centered, the ball becomes the rotational reference while the surrounding geometry begins to move.",
    stat: "780 deg",
    statLabel: "scroll indexed rotation",
  },
  {
    kicker: "Controlled Rotation",
    title: "Every degree is intentional.",
    copy: "The transfer completes only after motion, alignment, and repeatability are visually confirmed.",
    stat: "3 gates",
    statLabel: "alignment checks",
  },
];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function GearTransferSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const gearRef = useRef<HTMLDivElement | null>(null);
  const [activeMessage, setActiveMessage] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    const gear = gearRef.current;
    if (!section || !gear) return undefined;

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.65,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const progress = clamp(self.progress, 0, 1);
        const index = progress < 0.34 ? 0 : progress < 0.68 ? 1 : 2;

        setActiveMessage((current) => (current === index ? current : index));

        gsap.set(gear, {
          rotate: progress * 780,
          scale: 0.96 + Math.sin(progress * Math.PI) * 0.055,
        });

        section.style.setProperty("--gear-progress", String(progress));
      },
    });

    return () => trigger.kill();
  }, []);

  const renderSplitTitle = (title: string, isActive: boolean) => {
    return title.split(" ").map((word, wordIndex, wordsArray) => (
      <span key={wordIndex} className="word-container">
        {word.split("").map((char, charIndex) => {
          const prevWordsCharCount = wordsArray
            .slice(0, wordIndex)
            .reduce((acc, w) => acc + w.length, 0);
          const charDelayIndex = prevWordsCharCount + charIndex;
          return (
            <span
              key={charIndex}
              className="char-unit"
              style={{
                animationDelay: isActive
                  ? `${charDelayIndex * 16}ms`
                  : "0ms",
              }}
            >
              {char}
            </span>
          );
        })}
      </span>
    ));
  };

  return (
    <section
      ref={sectionRef}
      className="gear-transfer animate-section"
      aria-label="Gear transfer sequence"
    >
      <div className="gear-transfer__stage">
        <div className="gear-transfer__bay-grid" aria-hidden="true" />
        <div className="gear-transfer__copy">
          {messages.map((message, index) => {
            const isActive = index === activeMessage;
            return (
              <article
                key={message.title}
                className={isActive ? "is-active" : ""}
              >
                <span className="section-kicker">{message.kicker}</span>
                <h2>{renderSplitTitle(message.title, isActive)}</h2>
                <p>{message.copy}</p>
                <div className="gear-transfer__readout">
                  <strong>{message.stat}</strong>
                  <span>{message.statLabel}</span>
                </div>
              </article>
            );
          })}
        </div>

        <div className="gear-transfer__visual" aria-hidden="true">
          <div className="gear-transfer__status">
            <span>TRANSFER BAY</span>
            <strong>LOCKED</strong>
          </div>
          <div className="gear-transfer__ring gear-transfer__ring--outer" />
          <div className="gear-transfer__ring gear-transfer__ring--inner" />
          <div ref={gearRef} className="gear-transfer__gear">
            <Image
              src={gearImage}
              alt=""
              fill
              sizes="(max-width: 640px) 78vw, (max-width: 980px) 72vw, 42vw"
              priority
              className="gear-transfer__gear-image"
            />
            <div className="gear-transfer__gear-hole" />
          </div>
          <div className="gear-transfer__inspection-card">
            <span>RUNOUT</span>
            <strong>+/- 0.005</strong>
            <small>ball seated to datum center</small>
          </div>
        </div>
      </div>
    </section>
  );
}

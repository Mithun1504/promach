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
  },
  {
    kicker: "Mechanical Lock",
    title: "The gear accepts the load.",
    copy: "Once centered, the ball becomes the rotational reference while the surrounding geometry begins to move.",
  },
  {
    kicker: "Controlled Rotation",
    title: "Every degree is intentional.",
    copy: "The transfer completes only after motion, alignment, and repeatability are visually confirmed.",
  },
];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function GearTransferSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const gearRef = useRef<HTMLDivElement | null>(null);
  const ballRef = useRef<HTMLDivElement | null>(null);
  const [activeMessage, setActiveMessage] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    const gear = gearRef.current;
    const ball = ballRef.current;
    if (!section || !gear || !ball) return undefined;

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.65,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const progress = clamp(self.progress, 0, 1);
        const index = progress < 0.34 ? 0 : progress < 0.68 ? 1 : 2;
        const dropProgress = clamp(progress / 0.28, 0, 1);
        const easedDrop = 1 - (1 - dropProgress) ** 3;

        setActiveMessage((current) => (current === index ? current : index));

        gsap.set(gear, {
          rotate: progress * 780,
          scale: 0.96 + Math.sin(progress * Math.PI) * 0.055,
        });

        gsap.set(ball, {
          xPercent: -50,
          yPercent: -50,
          y: -window.innerHeight * 0.58 * (1 - easedDrop),
          scale: 0.7 + easedDrop * 0.3,
          rotate: progress * 980,
          opacity: clamp(progress / 0.08, 0, 1),
        });

        section.style.setProperty("--gear-progress", String(progress));
      },
    });

    return () => trigger.kill();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="gear-transfer"
      aria-label="Gear transfer sequence"
    >
      <div className="gear-transfer__stage">
        <div className="gear-transfer__copy">
          {messages.map((message, index) => (
            <article
              key={message.title}
              className={index === activeMessage ? "is-active" : ""}
            >
              <span className="section-kicker">{message.kicker}</span>
              <h2>{message.title}</h2>
              <p>{message.copy}</p>
            </article>
          ))}
        </div>

        <div className="gear-transfer__visual" aria-hidden="true">
          <div className="gear-transfer__drop-line" />
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
          <div ref={ballRef} className="gear-transfer__ball">
            <span />
          </div>
        </div>
      </div>
    </section>
  );
}

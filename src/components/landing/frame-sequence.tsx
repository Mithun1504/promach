"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  type CSSProperties,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

gsap.registerPlugin(ScrollTrigger);

export const globalFrameCache = new Map<string, HTMLImageElement>();

export type FrameSequenceConfig = {
  id: string;
  folder: string;
  frameCount: number;
  extension: "webp" | "png" | "jpg";
  padLength: number;
  startFrame?: number;
  endFrame?: number;
  priority?: boolean;
};

export type FrameChapter = {
  from: number;
  to: number;
  kicker?: string;
  title: string;
  copy?: string;
  align?: "left" | "center" | "right";
  variant?: "stacked" | "wide" | "data";
};

type FrameSequenceProps = {
  config: FrameSequenceConfig;
  chapters: FrameChapter[];
  sectionId?: string;
  className?: string;
  heightVh: number;
  darken?: number;
  alignImage?: "left" | "center" | "right";
  children?: ReactNode;
};

type CachedFrame = {
  image?: HTMLImageElement;
  loading?: boolean;
  failed?: boolean;
  queued?: boolean;
};

const BASE_URL =
  process.env.NEXT_PUBLIC_S3_FRAMES_URL || '';

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function drawCover(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  canvas: HTMLCanvasElement,
  align: "left" | "center" | "right",
) {
  const canvasRatio = canvas.width / canvas.height;
  const imageRatio = image.naturalWidth / image.naturalHeight;
  let width = canvas.width;
  let height = canvas.height;
  let x = 0;
  let y = 0;

  // Detect mobile portrait viewport based on canvas dimensions
  const isMobilePortrait = canvas.width < 768 && canvasRatio < 0.75;

  if (isMobilePortrait) {
    // Zoom out on mobile portrait to fit the landscape frame sequence beautifully.
    // Scale by 0.76 to make the machine smaller, bringing it fully into focus.
    const zoomFactor = 0.76;
    if (imageRatio > canvasRatio) {
      height = canvas.height * zoomFactor;
      width = height * imageRatio;
      // Center the zoomed-out frame horizontally and vertically
      x = (canvas.width - width) / 2;
      y = (canvas.height - height) / 2;
    } else {
      width = canvas.width * zoomFactor;
      height = width / imageRatio;
      x = (canvas.width - width) / 2;
      y = (canvas.height - height) / 2;
    }
  } else {
    // Standard desktop cover cropping
    if (imageRatio > canvasRatio) {
      height = canvas.height;
      width = height * imageRatio;
      x =
        align === "left"
          ? 0
          : align === "right"
            ? canvas.width - width
            : (canvas.width - width) / 2;
    } else {
      width = canvas.width;
      height = width / imageRatio;
      y = (canvas.height - height) / 2;
    }
  }

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, x, y, width, height);
}

function chapterForFrame(chapters: FrameChapter[], frame: number) {
  return Math.max(
    0,
    chapters.findIndex((chapter) => frame >= chapter.from && frame <= chapter.to),
  );
}

export function FrameSequence({
  config,
  chapters,
  sectionId,
  className = "",
  heightVh,
  darken = 0.48,
  alignImage = "center",
  children,
}: FrameSequenceProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cacheRef = useRef<Map<number, CachedFrame>>(new Map());
  const queueRef = useRef<number[]>([]);
  const queuedSetRef = useRef<Set<number>>(new Set());
  const activeLoadsRef = useRef(0);
  const targetFrameRef = useRef(config.startFrame ?? 1);
  const displayFrameRef = useRef(config.startFrame ?? 1);
  const drawnFrameRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const mountedRef = useRef(false);
  const [activeChapter, setActiveChapter] = useState(0);

  const firstFrame = config.startFrame ?? 1;
  const lastFrame = config.endFrame ?? config.frameCount;
  const usableFrameCount = lastFrame - firstFrame + 1;

  const orderedFrames = useMemo(
    () => Array.from({ length: usableFrameCount }, (_, index) => firstFrame + index),
    [firstFrame, usableFrameCount],
  );

  const frameUrl = useCallback(
    (frame: number) => {
      const file = `${String(frame).padStart(config.padLength, "0")}.${
        config.extension
      }`;
      return `${BASE_URL.replace(/\/$/, "")}/${config.folder}/${file}`;
    },
    [config.extension, config.folder, config.padLength],
  );

  const setLoadedCount = useCallback(() => {
    if (!sectionRef.current) return;

    sectionRef.current.dataset.loadedFrames = String(
      Array.from(cacheRef.current.values()).filter((entry) => entry.image).length,
    );
  }, []);

  const drawFrame = useCallback(
    (requestedFrame: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const context = canvas.getContext("2d");
      if (!context) return;

      const safeFrame = clamp(requestedFrame, firstFrame, lastFrame);
      let drawableFrame = safeFrame;
      let image = cacheRef.current.get(safeFrame)?.image;

      if (!image) {
        for (let offset = 1; offset <= 12; offset += 1) {
          const before = cacheRef.current.get(safeFrame - offset)?.image;
          const after = cacheRef.current.get(safeFrame + offset)?.image;

          if (before) {
            drawableFrame = safeFrame - offset;
            image = before;
            break;
          }

          if (after) {
            drawableFrame = safeFrame + offset;
            image = after;
            break;
          }
        }
      }

      if (!image || drawnFrameRef.current === drawableFrame) return;

      drawCover(context, image, canvas, alignImage);
      drawnFrameRef.current = drawableFrame;

      if (sectionRef.current) {
        sectionRef.current.dataset.drawnFrame = String(drawableFrame);
      }
    },
    [alignImage, firstFrame, lastFrame],
  );

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(1, Math.round(rect.width * dpr));
    const height = Math.max(1, Math.round(rect.height * dpr));

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      drawnFrameRef.current = null;
      drawFrame(Math.round(displayFrameRef.current));
    }
  }, [drawFrame]);

  const pumpQueue = useCallback(() => {
    if (!mountedRef.current) return;

    const maxConcurrentLoads = config.priority ? 12 : 6;

    while (
      activeLoadsRef.current < maxConcurrentLoads &&
      queueRef.current.length > 0
    ) {
      const nextFrame = queueRef.current.shift();
      if (!nextFrame) continue;

      queuedSetRef.current.delete(nextFrame);

      const cached = cacheRef.current.get(nextFrame);
      if (cached?.image || cached?.loading || cached?.failed) continue;

      // Check global preloaded cache
      const url = frameUrl(nextFrame);
      const preloadedImg = globalFrameCache.get(url);
      if (preloadedImg) {
        cacheRef.current.set(nextFrame, { image: preloadedImg });
        if (nextFrame === firstFrame) {
          sectionRef.current?.setAttribute("data-first-frame-ready", "true");
        }
        drawFrame(Math.round(displayFrameRef.current));
        continue;
      }

      const image = new Image();
      activeLoadsRef.current += 1;
      cacheRef.current.set(nextFrame, { loading: true });

      image.decoding = "async";
      image.onload = () => {
        if (!mountedRef.current) return;

        cacheRef.current.set(nextFrame, { image });
        activeLoadsRef.current -= 1;
        setLoadedCount();

        if (nextFrame === firstFrame) {
          sectionRef.current?.setAttribute("data-first-frame-ready", "true");
        }

        drawFrame(Math.round(displayFrameRef.current));
        pumpQueue();
      };

      image.onerror = () => {
        if (!mountedRef.current) return;

        cacheRef.current.set(nextFrame, { failed: true });
        activeLoadsRef.current -= 1;
        pumpQueue();
      };

      image.src = url;
    }
  }, [config.priority, drawFrame, firstFrame, frameUrl, setLoadedCount]);

  const loadFrame = useCallback(
    (frame: number, priority = false) => {
      const safeFrame = clamp(frame, firstFrame, lastFrame);
      const cached = cacheRef.current.get(safeFrame);

      if (cached?.image || cached?.loading || cached?.failed) return;

      // Check global preloaded cache
      const url = frameUrl(safeFrame);
      const preloadedImg = globalFrameCache.get(url);
      if (preloadedImg) {
        cacheRef.current.set(safeFrame, { image: preloadedImg });
        if (safeFrame === firstFrame) {
          sectionRef.current?.setAttribute("data-first-frame-ready", "true");
        }
        drawFrame(Math.round(displayFrameRef.current));
        return;
      }

      if (queuedSetRef.current.has(safeFrame)) {
        if (priority) {
          queueRef.current = queueRef.current.filter(
            (queuedFrame) => queuedFrame !== safeFrame,
          );
          queueRef.current = [
            safeFrame,
            ...queueRef.current.filter(
              (queuedFrame) => Math.abs(queuedFrame - targetFrameRef.current) < 36,
            ),
          ];
        }
        pumpQueue();
        return;
      }

      queuedSetRef.current.add(safeFrame);
      cacheRef.current.set(safeFrame, { queued: true });

      if (priority) {
        queueRef.current.unshift(safeFrame);
      } else {
        queueRef.current.push(safeFrame);
      }

      pumpQueue();
    },
    [firstFrame, lastFrame, pumpQueue, frameUrl, drawFrame],
  );

  const warmFrames = useCallback(
    (centerFrame: number, radius: number) => {
      loadFrame(centerFrame, true);

      for (let offset = 1; offset <= radius; offset += 1) {
        loadFrame(centerFrame + offset, offset <= 4);
        loadFrame(centerFrame - offset, offset <= 2);
      }
    },
    [loadFrame],
  );

  useEffect(() => {
    mountedRef.current = true;
    resizeCanvas();
    loadFrame(firstFrame, true);

    orderedFrames.slice(0, config.priority ? 14 : 8).forEach((frame, index) => {
      window.setTimeout(() => loadFrame(frame), index * 18);
    });

    const resizeObserver = new ResizeObserver(resizeCanvas);
    if (canvasRef.current) resizeObserver.observe(canvasRef.current);
    window.addEventListener("resize", resizeCanvas);

    return () => {
      mountedRef.current = false;
      resizeObserver.disconnect();
      window.removeEventListener("resize", resizeCanvas);

      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, [config.priority, firstFrame, loadFrame, orderedFrames, resizeCanvas]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduceMotion) {
      targetFrameRef.current = firstFrame;
      displayFrameRef.current = firstFrame;
      loadFrame(firstFrame, true);
      return undefined;
    }

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.6,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const frame =
          firstFrame + Math.round(self.progress * (usableFrameCount - 1));
        const chapterIndex = chapterForFrame(chapters, frame);

        targetFrameRef.current = frame;
        section.dataset.currentFrame = String(frame);
        warmFrames(frame, config.priority ? 18 : 12);

        setActiveChapter((current) =>
          current === chapterIndex ? current : chapterIndex,
        );

        // Calculate continuous exit progress (0 to 1) when scroll progress is between 0.8 and 1.0
        const exitProgress = Math.max(0, (self.progress - 0.8) / 0.2);
        section.style.setProperty("--exit-progress", String(exitProgress));

        if (self.progress > 0.8) {
          section.classList.add("frame-sequence--transform-active");
        } else {
          section.classList.remove("frame-sequence--transform-active");
        }

        // Apply physical momentum (skew/tilt) based on velocity
        const stage = section.querySelector<HTMLElement>(".frame-sequence__stage");
        if (stage) {
          const rotation = Math.sin(self.progress * Math.PI) * 1.6;
          const skewX = Math.sin(self.progress * Math.PI) * 0.8;
          stage.style.transform = `rotate(${rotation}deg) skewX(${skewX}deg)`;
        }
      },
    });

    return () => {
      trigger.kill();
    };
  }, [
    chapters,
    config.priority,
    firstFrame,
    loadFrame,
    usableFrameCount,
    warmFrames,
  ]);

  useEffect(() => {
    const tick = () => {
      const target = targetFrameRef.current;
      const current = displayFrameRef.current;
      const next = current + (target - current) * 0.24;

      displayFrameRef.current =
        Math.abs(target - next) < 0.04 ? target : next;

      const roundedFrame = Math.round(displayFrameRef.current);
      drawFrame(roundedFrame);

      rafRef.current = window.requestAnimationFrame(tick);
    };

    rafRef.current = window.requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, [drawFrame]);

  // Splits headers into bouncy, spring-loaded letters, wrapping words to prevent awkward line breaks
  const renderSplitTitle = (title: string, isActive: boolean) => {
    return title.split("\n").map((line, lineIndex) => (
      <div key={lineIndex} className="line-container">
        {line.split(" ").map((word, wordIndex, wordsArray) => (
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
                      ? `${(lineIndex * 12 + charDelayIndex) * 16}ms`
                      : "0ms",
                  }}
                >
                  {char}
                </span>
              );
            })}
          </span>
        ))}
      </div>
    ));
  };

  return (
    <section
      ref={sectionRef}
      id={sectionId}
      className={`frame-sequence ${className}`}
      data-sequence={config.id}
      style={
        {
          "--sequence-height": `${heightVh}vh`,
          "--sequence-darken": darken,
        } as CSSProperties
      }
    >
      <div className="frame-sequence__stage">
        <div className="frame-sequence__canvas-wrapper">
          <canvas ref={canvasRef} className="frame-sequence__canvas" />
          <div className="frame-sequence__vignette" />
        </div>
        <div className="frame-sequence__loader">
          <span />
          Loading calibrated frames
        </div>
        <div className="frame-sequence__chapters">
          {chapters.map((chapter, index) => {
            const isActive = index === activeChapter;
            return (
              <div
                key={`${chapter.title}-${chapter.from}`}
                className={`frame-copy frame-copy--${chapter.align ?? "left"} frame-copy--${
                  chapter.variant ?? "stacked"
                } ${isActive ? "is-active" : ""}`}
              >
                {chapter.kicker ? (
                  <span className="section-kicker">{chapter.kicker}</span>
                ) : null}
                <h2>{renderSplitTitle(chapter.title, isActive)}</h2>
                {chapter.copy ? <p>{chapter.copy}</p> : null}
              </div>
            );
          })}
        </div>
        {children}
      </div>
    </section>
  );
}

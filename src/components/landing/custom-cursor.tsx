"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const followerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const follower = followerRef.current;
    if (!cursor || !follower) return undefined;

    const mouse = { x: 0, y: 0 };
    const pos = { x: 0, y: 0 };
    const scale = { current: 1, target: 1 };
    let isHovering = false;

    // Hide original cursor
    document.documentElement.style.cursor = "none";
    document.body.style.cursor = "none";

    const onMouseMove = (event: MouseEvent) => {
      mouse.x = event.clientX;
      mouse.y = event.clientY;

      // Position inner cursor instantly
      gsap.set(cursor, { x: mouse.x, y: mouse.y });
    };

    const onMouseOver = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        target.tagName === "A" ||
        target.tagName === "BUTTON" ||
        target.closest("a") ||
        target.closest("button") ||
        target.closest(".machine-explorer__controls button") ||
        target.hasAttribute("data-cursor-hover")
      ) {
        scale.target = 2.4;
        isHovering = true;
        follower.classList.add("is-hovering");
      } else {
        scale.target = 1;
        isHovering = false;
        follower.classList.remove("is-hovering");
      }
    };

    const onMouseDown = () => {
      scale.target = 0.72;
    };

    const onMouseUp = () => {
      scale.target = isHovering ? 2.4 : 1;
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseover", onMouseOver);
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);

    // Follower physics loop
    const tick = () => {
      // Lerp position
      pos.x += (mouse.x - pos.x) * 0.18;
      pos.y += (mouse.y - pos.y) * 0.18;

      // Calculate speed for stretching cursor during fast movement
      const dx = mouse.x - pos.x;
      const dy = mouse.y - pos.y;
      const speed = Math.min(Math.sqrt(dx * dx + dy * dy), 120);
      const stretch = speed * 0.0042;

      // Update scale
      scale.current += (scale.target - scale.current) * 0.2;

      // Calculate angle of motion
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);

      gsap.set(follower, {
        x: pos.x,
        y: pos.y,
        scaleX: scale.current + stretch,
        scaleY: scale.current - stretch * 0.5,
        rotate: angle,
      });

      requestAnimationFrame(tick);
    };

    const frameId = requestAnimationFrame(tick);

    return () => {
      document.documentElement.style.cursor = "auto";
      document.body.style.cursor = "auto";
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseover", onMouseOver);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <>
      <div ref={cursorRef} className="custom-cursor__dot" aria-hidden="true" />
      <div ref={followerRef} className="custom-cursor__follower" aria-hidden="true" />
    </>
  );
}

import React, { useState, MouseEvent, useRef } from "react";

/**
 * GlowCard — glassmorphic 3D tilt card with mouse spotlight glow.
 * Import this wherever you want the "hover on one side, other side bends" effect.
 */
export const GlowCard = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0, op: 0 });

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    const rx = ((y - r.height / 2) / r.height) * -12;
    const ry = ((x - r.width / 2) / r.width) * 12;
    ref.current.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.02)`;
    setPos({ x, y, op: 1 });
  };

  const onLeave = () => {
    if (ref.current)
      ref.current.style.transform =
        "perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)";
    setPos((p) => ({ ...p, op: 0 }));
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`relative transition-transform duration-200 ease-out overflow-hidden ${className}`}
    >
      {/* Spotlight glow layer */}
      <div
        className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300"
        style={{
          opacity: pos.op,
          background: `radial-gradient(380px at ${pos.x}px ${pos.y}px, rgba(255,255,255,0.13), transparent 60%)`,
        }}
      />
      {children}
    </div>
  );
};

export default GlowCard;

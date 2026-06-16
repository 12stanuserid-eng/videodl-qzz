'use client';

import type { ReactNode } from 'react';
import { useRef } from 'react';

export function TiltCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  function handleMove(event: React.MouseEvent<HTMLDivElement>) {
    const element = ref.current;
    if (!element) return;
    const rect = element.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const rotateX = (y / rect.height - 0.5) * -10;
    const rotateY = (x / rect.width - 0.5) * 10;
    element.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
  }

  function reset() {
    const element = ref.current;
    if (!element) return;
    element.style.transform = 'rotateX(0deg) rotateY(0deg) translateY(0px)';
  }

  return (
    <div className="perspective-1000">
      <div
        ref={ref}
        onMouseMove={handleMove}
        onMouseLeave={reset}
        className={`glass-card rounded-[2rem] p-6 transition-transform duration-200 will-change-transform ${className}`}
      >
        {children}
      </div>
    </div>
  );
}

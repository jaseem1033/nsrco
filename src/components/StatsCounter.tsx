import React, { useState, useEffect, useRef } from 'react';

interface StatsCounterProps {
  target: number;
  duration?: number;
}

export const StatsCounter: React.FC<StatsCounterProps> = ({ target, duration = 2000 }) => {
  const [count, setCount] = useState(0);
  const elementRef = useRef<HTMLSpanElement>(null);
  const animationStarted = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !animationStarted.current) {
          animationStarted.current = true;
          startAnimation();
        }
      },
      { threshold: 0.15 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [target, duration]);

  const startAnimation = () => {
    const startTime = performance.now();

    const updateCounter = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Quartic Out easing function for organic growth curve
      const ease = 1 - Math.pow(1 - progress, 4);
      
      setCount(Math.round(ease * target));
      
      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        setCount(target);
      }
    };

    requestAnimationFrame(updateCounter);
  };

  return (
    <span ref={elementRef} className="counter">
      {count}
    </span>
  );
};

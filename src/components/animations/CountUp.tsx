import { useEffect, useRef } from 'react';
import { useInView, useMotionValue, useSpring } from 'motion/react';

interface CountUpProps {
  to: number;
  from?: number;
  duration?: number;
  delay?: number;
  className?: string;
  startInView?: boolean;
  once?: boolean;
  decimals?: number;
}

export const CountUp = ({
  to,
  from = 0,
  duration = 2,
  delay = 0,
  className = '',
  startInView = true,
  once = true,
  decimals = 0,
}: CountUpProps) => {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(from);
  const springValue = useSpring(motionValue, {
    damping: 30,
    stiffness: 100,
  });
  const isInView = useInView(ref, { once, margin: "-100px" });

  useEffect(() => {
    if (isInView || !startInView) {
      const timeout = setTimeout(() => {
        motionValue.set(to);
      }, delay * 1000);
      return () => clearTimeout(timeout);
    }
  }, [isInView, startInView, motionValue, to, delay]);

  useEffect(() => {
    springValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = Intl.NumberFormat("en-US", {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }).format(latest);
      }
    });
  }, [springValue, decimals]);

  return <span ref={ref} className={className}>{from}</span>;
};

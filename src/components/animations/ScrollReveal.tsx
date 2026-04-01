import { motion, HTMLMotionProps } from 'motion/react';
import { ReactNode } from 'react';

interface ScrollRevealProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  y?: number;
  x?: number;
  scale?: number;
  once?: boolean;
  margin?: string;
}

export const ScrollReveal = ({
  children,
  className = '',
  delay = 0,
  duration = 0.8,
  y = 30,
  x = 0,
  scale = 1,
  once = true,
  margin = "-100px",
  ...props
}: ScrollRevealProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y, x, scale }}
      whileInView={{ opacity: 1, y: 0, x: 0, scale: 1 }}
      viewport={{ once, margin }}
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};

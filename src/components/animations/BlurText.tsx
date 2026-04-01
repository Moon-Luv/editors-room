import { motion, HTMLMotionProps } from 'motion/react';

interface BlurTextProps extends HTMLMotionProps<"span"> {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  once?: boolean;
}

export const BlurText = ({
  text,
  className = '',
  delay = 0,
  duration = 0.8,
  once = true,
  ...props
}: BlurTextProps) => {
  return (
    <motion.span
      initial={{ opacity: 0, filter: "blur(10px)" }}
      whileInView={{ opacity: 1, filter: "blur(0px)" }}
      viewport={{ once }}
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={className}
      {...props}
    >
      {text}
    </motion.span>
  );
};

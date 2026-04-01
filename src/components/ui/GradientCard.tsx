import React from 'react';
import { motion, useMotionValue, useMotionTemplate, HTMLMotionProps } from 'motion/react';
import { cn } from '@/src/lib/utils';

interface GradientCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  containerClassName?: string;
  animate?: boolean;
}

export const GradientCard = ({ 
  children, 
  className, 
  containerClassName,
  animate = true,
  ...props 
}: GradientCardProps) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      whileHover={animate ? { y: -8 } : {}}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "relative group rounded-2xl p-[1px] overflow-hidden transition-all duration-300",
        "bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-cyan-500/20",
        "hover:from-blue-500/40 hover:via-purple-500/40 hover:to-cyan-500/40",
        "dark:hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]",
        className
      )}
      {...props}
    >
      {/* Animated Gradient Border Overlay */}
      <motion.div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              350px circle at ${mouseX}px ${mouseY}px,
              rgba(59, 130, 246, 0.15),
              transparent 80%
            )
          `,
        }}
      />
      
      <div className={cn(
        "relative h-full w-full rounded-[calc(1rem-1px)] bg-white dark:bg-neutral-900 transition-colors duration-300",
        containerClassName
      )}>
        {children}
      </div>
    </motion.div>
  );
};

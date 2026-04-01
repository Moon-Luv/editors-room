import React from 'react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  containerClassName?: string;
}

export const Section = React.forwardRef<HTMLElement, SectionProps>(
  ({ children, className, containerClassName, ...props }, ref) => {
    return (
      <motion.section
        ref={ref}
        className={cn('py-20 md:py-32 overflow-hidden', className)}
        {...props}
      >
        <div className={cn('container mx-auto px-4 md:px-6', containerClassName)}>
          {children}
        </div>
      </motion.section>
    );
  }
);

Section.displayName = 'Section';

import React from 'react';
import { motion } from 'motion/react';

interface AnimatedHeadingProps {
  title: string;
  subtitle?: string;
  className?: string;
  subtitleClassName?: string;
  align?: 'left' | 'center' | 'right';
}

export const AnimatedHeading: React.FC<AnimatedHeadingProps> = ({
  title,
  subtitle,
  className = "",
  subtitleClassName = "",
  align = 'left'
}) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    },
  };

  const words = title.split(' ');

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={containerVariants}
      className={`flex flex-col ${align === 'center' ? 'items-center text-center' : align === 'right' ? 'items-end text-right' : 'items-start text-left'}`}
    >
      {subtitle && (
        <motion.span
          variants={itemVariants}
          className={subtitleClassName}
        >
          {subtitle}
        </motion.span>
      )}
      <h2 className={className}>
        {words.map((word, i) => (
          <span key={i} className="inline-block overflow-hidden mr-[0.2em] last:mr-0">
            <motion.span
              variants={itemVariants}
              className="inline-block"
            >
              {word}
            </motion.span>
          </span>
        ))}
      </h2>
    </motion.div>
  );
};

interface MaskedHeadingProps {
  children: React.ReactNode;
  className?: string;
}

export const MaskedHeading: React.FC<MaskedHeadingProps> = ({ children, className = "" }) => {
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      }
    }
  };

  const child = {
    hidden: { opacity: 0, y: "100%" },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 1,
        ease: [0.16, 1, 0.3, 1] as const,
      }
    }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      className={className}
    >
      {React.Children.map(children, (item, i) => {
        if (typeof item === 'string') {
          return item.split(' ').map((word, j) => (
            <span key={`${i}-${j}`} className="inline-block overflow-hidden mr-[0.25em] last:mr-0">
              <motion.span variants={child} className="inline-block">
                {word}
              </motion.span>
            </span>
          ));
        }
        if (React.isValidElement(item) && item.type === 'br') {
          return <br key={i} />;
        }
        return (
          <span key={i} className="inline-block overflow-hidden">
            <motion.span variants={child} className="inline-block">
              {item}
            </motion.span>
          </span>
        );
      })}
    </motion.div>
  );
};

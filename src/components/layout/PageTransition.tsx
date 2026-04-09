'use client';

import type { HTMLMotionProps } from 'framer-motion';
import { AnimatePresence, motion } from 'framer-motion';
import type { ReactNode } from 'react';

/**
 * Page transition props.
 */
export interface PageTransitionProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
}

const variants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
};

/**
 * Page transition wrapper with Framer Motion fade and slide animation.
 */
export function PageTransition({ children, ...props }: PageTransitionProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial="initial"
        animate="animate"
        exit="exit"
        variants={variants}
        transition={{ duration: 0.2 }}
        {...props}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

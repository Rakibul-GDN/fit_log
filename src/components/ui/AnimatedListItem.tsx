'use client';

import type { HTMLMotionProps } from 'framer-motion';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

/**
 * Animated list item props.
 */
export interface AnimatedListItemProps extends HTMLMotionProps<'li'> {
  children: ReactNode;
  index?: number;
}

/**
 * Animated list item with staggered fade-in animation.
 */
export function AnimatedListItem({
  children,
  index = 0,
  ...props
}: AnimatedListItemProps) {
  return (
    <motion.li
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      {...props}
    >
      {children}
    </motion.li>
  );
}

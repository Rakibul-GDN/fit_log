'use client';

import type { ModalProps } from '@heroui/react';
import { Modal as HeroModal } from '@heroui/react';
import type { ReactNode } from 'react';

/**
 * Modal component — wrapper around HeroUI Modal.
 */
export function Modal({
  children,
  ...props
}: ModalProps): ReactNode {
  return <HeroModal {...props}>{children}</HeroModal>;
}

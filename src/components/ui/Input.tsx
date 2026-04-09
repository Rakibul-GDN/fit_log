'use client';

import { Input as HeroInput } from '@heroui/react';

/**
 * Input component — wrapper around HeroUI Input.
 * Uses generic props to allow all standard input attributes.
 */
export function Input(props: Record<string, unknown>) {
  return <HeroInput {...(props as object)} />;
}

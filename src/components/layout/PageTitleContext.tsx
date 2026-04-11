'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

interface PageTitleContextType {
  title: string;
  setTitle: (t: string) => void;
}

const PageTitleContext = createContext<PageTitleContextType>({
  title: '',
  setTitle: () => {},
});

export function PageTitleProvider({ children }: { children: ReactNode }): ReactNode {
  const [title, setTitle] = useState('');
  return (
    <PageTitleContext.Provider value={{ title, setTitle }}>
      {children}
    </PageTitleContext.Provider>
  );
}

export function usePageTitle(): PageTitleContextType {
  return useContext(PageTitleContext);
}

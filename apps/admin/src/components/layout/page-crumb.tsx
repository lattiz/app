import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

type PageCrumbContextValue = {
  label: string | null;
  setLabel: (label: string | null) => void;
};

const PageCrumbContext = createContext<PageCrumbContextValue | null>(null);

export function PageCrumbProvider({ children }: { children: ReactNode }) {
  const [label, setLabel] = useState<string | null>(null);
  const value = useMemo(() => ({ label, setLabel }), [label]);

  return <PageCrumbContext.Provider value={value}>{children}</PageCrumbContext.Provider>;
}

export function usePageCrumb(): string | null {
  return useContext(PageCrumbContext)?.label ?? null;
}

/** Puts the open record's name in the header breadcrumb until the page unmounts. */
export function PageCrumb({ label }: { label: string }) {
  const setLabel = useContext(PageCrumbContext)?.setLabel;
  const setStable = useCallback(
    (next: string | null) => {
      setLabel?.(next);
    },
    [setLabel],
  );

  useEffect(() => {
    setStable(label);
    return () => setStable(null);
  }, [label, setStable]);

  return null;
}

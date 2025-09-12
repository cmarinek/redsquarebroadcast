// Environment detection utility for RedSquare platform
export const isMobile = (): boolean => {
  try {
    return typeof window !== 'undefined' && window.innerWidth < 768;
  } catch {
    return false;
  }
};

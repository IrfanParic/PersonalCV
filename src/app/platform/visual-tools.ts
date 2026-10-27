/** Keep animation and scene libraries out of the initial bundle. */
export const loadGsap = () => import('gsap').then(module => module.gsap);
export const loadThree = () => import('three');

let cancelCurrentScroll: (() => void) | undefined;

export function stickyHeaderHeight(): number {
  return document.getElementById('header')?.getBoundingClientRect().height ?? 0;
}

/** One scroll at a time, including requests still waiting for the lazy import. */
export async function scrollToSection(target: HTMLElement | number, signal: AbortSignal): Promise<void> {
  cancelCurrentScroll?.();
  if (signal.aborted) return;

  let cancelled = false;
  let tween: { kill(): void } | undefined;
  const cleanup = () => {
    signal.removeEventListener('abort', cancel);
    window.removeEventListener('wheel', cancel);
    window.removeEventListener('touchstart', cancel);
    window.removeEventListener('pointerdown', cancel);
    window.removeEventListener('keydown', onKeyDown);
    if (cancelCurrentScroll === cancel) cancelCurrentScroll = undefined;
  };
  const cancel = () => {
    cancelled = true;
    tween?.kill();
    cleanup();
  };
  const onKeyDown = (event: KeyboardEvent) => {
    if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key)) cancel();
  };
  const destination = () => typeof target === 'number'
    ? target
    : Math.max(0, window.scrollY + target.getBoundingClientRect().top - stickyHeaderHeight());
  const immediately = () => {
    if (!cancelled) window.scrollTo({ top: destination(), behavior: 'instant' });
    cleanup();
  };

  cancelCurrentScroll = cancel;
  signal.addEventListener('abort', cancel, { once: true });
  window.addEventListener('wheel', cancel, { passive: true });
  window.addEventListener('touchstart', cancel, { passive: true });
  window.addEventListener('pointerdown', cancel, { passive: true });
  window.addEventListener('keydown', onKeyDown);

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    immediately();
    return;
  }
  try {
    const [gsap, { ScrollToPlugin }] = await Promise.all([loadGsap(), import('gsap/ScrollToPlugin')]);
    if (cancelled) return;
    gsap.registerPlugin(ScrollToPlugin);
    tween = gsap.to(window, {
      duration: 0.85,
      ease: 'power2.inOut',
      scrollTo: { y: destination(), autoKill: true, onAutoKill: cancel },
      onComplete: cleanup,
      onInterrupt: cleanup
    });
  } catch {
    immediately();
  }
}

import { createSignal, onMount, onCleanup, type Accessor } from "solid-js";

interface UseIntersectionObserverOptions {
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
}

export function useIntersectionObserver(
  options: UseIntersectionObserverOptions = {}
): [Accessor<boolean>, (el: HTMLElement) => void] {
  const { threshold = 0.1, rootMargin = "0px", once = true } = options;
  const [isVisible, setIsVisible] = createSignal(false);
  let observer: IntersectionObserver | null = null;
  let element: HTMLElement | null = null;

  const setRef = (el: HTMLElement) => {
    element = el;
  };

  onMount(() => {
    if (!element) return;

    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (once && observer && element) {
              observer.unobserve(element);
            }
          } else if (!once) {
            setIsVisible(false);
          }
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);
  });

  onCleanup(() => {
    if (observer && element) {
      observer.unobserve(element);
    }
  });

  return [isVisible, setRef];
}

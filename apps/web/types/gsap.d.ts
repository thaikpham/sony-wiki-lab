declare module "gsap/ScrollTrigger" {
  export const ScrollTrigger: {
    scrollerProxy(
      element: Element | string,
      config: Record<string, unknown>
    ): void;
    update(): void;
    refresh(): void;
    addEventListener(event: string, callback: () => void): void;
    removeEventListener(event: string, callback: () => void): void;
  };
}

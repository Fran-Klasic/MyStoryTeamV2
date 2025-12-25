const main = document.querySelector<HTMLElement>("main");
const bg = document.querySelector<HTMLElement>(".main-bg");

if (!main || !bg) {
  throw new Error("Parallax elements not found in DOM");
}

const updateParallax = (): void => {
  const rect: DOMRect = main.getBoundingClientRect();
  const viewportHeight: number = window.innerHeight;

  // How much of <main> has entered the viewport
  const scrollProgress: number =
    (viewportHeight - rect.top) / (viewportHeight + rect.height);

  // Clamp between 0 and 1
  const clamped: number = Math.min(Math.max(scrollProgress, 0), 1);

  // Dynamic movement based on content height
  const maxTranslate: number = rect.height * 0.25;
  const translateY: number = clamped * maxTranslate;

  bg.style.transform = `translateY(${translateY}px)`;
};

window.addEventListener("scroll", updateParallax, { passive: true });
window.addEventListener("resize", updateParallax);

updateParallax();

let ticking = false;

const onScroll = (): void => {
  if (!ticking) {
    window.requestAnimationFrame(() => {
      updateParallax();
      ticking = false;
    });
    ticking = true;
  }
};

window.addEventListener("scroll", onScroll, { passive: true });

const initParallax = (): void => {
  const main = document.querySelector<HTMLElement>("main");
  const bg = document.querySelector<HTMLElement>(".main-bg");

  if (!main || !bg) return;

  let currentY = 0;
  let targetY = 0;
  const SMOOTHNESS = 0.08;

  const clamp = (v: number, min: number, max: number): number =>
    Math.min(Math.max(v, min), max);

  const updateTarget = (): void => {
  const rect = main.getBoundingClientRect();
  const viewportHeight = window.innerHeight;

  // Sync background height to main
  const bgHeight = bg.offsetHeight;
  bg.style.height = `${rect.height * 1.2}px`;

  // How far the background can move
  const maxTranslate = bg.offsetHeight - rect.height;

  // Scroll progress of main through viewport
  const progress =
    (viewportHeight - rect.top) / (viewportHeight + rect.height);

  const clamped = clamp(progress, 0, 1);

  // FULL mapping: top → bottom
  targetY = clamped * maxTranslate;
};


const animate = (): void => {
  currentY += (targetY - currentY) * SMOOTHNESS;
  bg.style.transform = `translateX(-50%) translateY(${currentY}px)`;
  requestAnimationFrame(animate);
};


  window.addEventListener("scroll", updateTarget, { passive: true });
  window.addEventListener("resize", updateTarget);

  updateTarget();
  animate();
};

initParallax();

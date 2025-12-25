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

    // Sync height
    bg.style.height = `${rect.height}px`;

    const progress =
      (viewportHeight - rect.top) / (viewportHeight + rect.height);

    targetY = clamp(progress, 0, 1) * rect.height * 0.25;
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

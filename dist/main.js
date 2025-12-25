"use strict";
const initParallax = () => {
    const main = document.querySelector("main");
    const bg = document.querySelector(".main-bg");
    if (!main || !bg)
        return;
    let currentY = 0;
    let targetY = 0;
    const SMOOTHNESS = 0.08;
    const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
    const updateTarget = () => {
        const rect = main.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        // Sync height
        bg.style.height = `${rect.height}px`;
        const progress = (viewportHeight - rect.top) / (viewportHeight + rect.height);
        targetY = clamp(progress, 0, 1) * rect.height * 0.25;
    };
    const animate = () => {
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
//# sourceMappingURL=main.js.map
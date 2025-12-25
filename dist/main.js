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
        // Sync background height to main
        const bgHeight = bg.offsetHeight;
        bg.style.height = `${rect.height * 1.2}px`;
        // How far the background can move
        const maxTranslate = bg.offsetHeight - rect.height;
        // Scroll progress of main through viewport
        const progress = (viewportHeight - rect.top) / (viewportHeight + rect.height);
        const clamped = clamp(progress, 0, 1);
        // FULL mapping: top → bottom
        targetY = clamped * maxTranslate;
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
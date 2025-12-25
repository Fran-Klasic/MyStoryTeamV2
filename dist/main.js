"use strict";
const main = document.querySelector("main");
const bg = document.querySelector(".main-bg");
if (!main || !bg) {
    throw new Error("Parallax elements not found in DOM");
}
const updateParallax = () => {
    const rect = main.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    // How much of <main> has entered the viewport
    const scrollProgress = (viewportHeight - rect.top) / (viewportHeight + rect.height);
    // Clamp between 0 and 1
    const clamped = Math.min(Math.max(scrollProgress, 0), 1);
    // Dynamic movement based on content height
    const maxTranslate = rect.height * 0.25;
    const translateY = clamped * maxTranslate;
    bg.style.transform = `translateY(${translateY}px)`;
};
window.addEventListener("scroll", updateParallax, { passive: true });
window.addEventListener("resize", updateParallax);
updateParallax();
let ticking = false;
const onScroll = () => {
    if (!ticking) {
        window.requestAnimationFrame(() => {
            updateParallax();
            ticking = false;
        });
        ticking = true;
    }
};
window.addEventListener("scroll", onScroll, { passive: true });
//# sourceMappingURL=main.js.map
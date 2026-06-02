/* ==========================================================================
   SILICON ENGINEERING — INTERACTIVE STAGE & CANVAS CONTROLLER
   ========================================================================== */

import './style.css';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Frame Names Definition (35 New Sequence Files)
    const frameNames = ['frame_001.jpg', 'frame_002.jpg', 'frame_003.jpg', 'frame_004.jpg', 'frame_005.jpg', 'frame_008.jpg', 'frame_009.jpg', 'frame_010.jpg', 'frame_011.jpg', 'frame_012.jpg', 'frame_014.jpg', 'frame_015.jpg', 'frame_017.jpg', 'frame_018.jpg', 'frame_019.jpg', 'frame_020.jpg', 'frame_021.jpg', 'frame_022.jpg', 'frame_023.jpg', 'frame_024.jpg', 'frame_027.jpg', 'frame_028.jpg', 'frame_029.jpg', 'frame_030.jpg', 'frame_031.jpg', 'frame_032.jpg', 'frame_034.jpg', 'frame_035.jpg', 'frame_036.jpg', 'frame_037.jpg', 'frame_040.jpg', 'frame_042.jpg', 'frame_043.jpg', 'frame_044.jpg', 'frame_045.jpg'];

    const totalFrames = frameNames.length;
    const folder = '/Tower_construction_progression_v__202606022052_frames/';
    const images = [];
    let loadedCount = 0;

    // DOM Elements
    const canvas = document.getElementById('facade-canvas');
    const ctx = canvas.getContext('2d');
    const preloadProgress = document.getElementById('preload-progress');
    const loader = document.querySelector('.canvas-loader');
    const storySection = document.getElementById('story');
    const mobileFallbackImg = document.getElementById('mobile-fallback-img');
    const heroBgFrame = document.getElementById('hero-bg-frame');
    const contactBgFrame = document.getElementById('contact-bg-frame');

    // 2. Preload Hero & Contact backgrounds first for immediate luxury load (cropped dynamically via custom CSS or Canvas)
    if (heroBgFrame) {
        heroBgFrame.style.backgroundImage = `url('${folder}${frameNames[0]}')`;
    }
    if (contactBgFrame) {
        contactBgFrame.style.backgroundImage = `url('${folder}${frameNames[totalFrames - 1]}')`;
    }

    // 3. Image Preloading Core
    function preloadImages() {
        for (let i = 0; i < totalFrames; i++) {
            const img = new Image();
            img.src = folder + frameNames[i];
            img.onload = () => {
                loadedCount++;
                const percentage = Math.round((loadedCount / totalFrames) * 100);
                if (preloadProgress) {
                    preloadProgress.style.width = `${percentage}%`;
                    preloadProgress.innerText = `${percentage}%`;
                }

                if (loadedCount === totalFrames) {
                    onPreloadComplete();
                }
            };
            images.push(img);
        }
    }

    function onPreloadComplete() {
        // Fade out loader
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.style.display = 'none';
            }, 800);
        }

        // Initialize Canvas size and render initial frame
        resizeCanvas();
        renderFrame(0);

        // Start Scroll Loop
        window.addEventListener('scroll', handleScroll);
        window.addEventListener('resize', resizeCanvas);
    }

    // 4. Responsive Canvas Sizing
    function resizeCanvas() {
        if (!canvas) return;
        const parent = canvas.parentElement;
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
        
        // Redraw current interpolated frame immediately on resize
        const scrollPercent = getScrollFraction();
        const targetFrameIndex = Math.min(totalFrames - 1, Math.floor(scrollPercent * totalFrames));
        renderFrame(targetFrameIndex);
    }

    // Render logic with letterbox/fill fitting AND watermark-hiding crop
    function renderFrame(index) {
        if (!images[index] || !canvas) return;
        const img = images[index];

        // Crop the bottom 8% of the source image to completely hide the watermark
        const cropPercent = 0.08;
        const sourceWidth = img.naturalWidth;
        const sourceHeight = img.naturalHeight * (1 - cropPercent);

        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;

        const imgRatio = sourceWidth / sourceHeight;
        const canvasRatio = canvasWidth / canvasHeight;

        let drawWidth, drawHeight, offsetX, offsetY;

        if (canvasRatio > imgRatio) {
            drawWidth = canvasWidth;
            drawHeight = canvasWidth / imgRatio;
            offsetX = 0;
            offsetY = (canvasHeight - drawHeight) / 2;
        } else {
            drawWidth = canvasHeight * imgRatio;
            drawHeight = canvasHeight;
            offsetX = (canvasWidth - drawWidth) / 2;
            offsetY = 0;
        }

        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        // Draw only the cropped top 92% of the source image to hide the bottom watermark
        ctx.drawImage(
            img, 
            0, 0,                      // Source start x, y
            sourceWidth, sourceHeight,  // Source width, height (cropped)
            offsetX, offsetY,          // Destination start x, y
            drawWidth, drawHeight      // Destination width, height
        );
    }

    // 5. Scroll Fraction & Smoothed Lerp Render
    let currentFraction = 0;
    let targetFraction = 0;
    const lerpSpeed = 0.05; // Lowered to 0.05 for extreme buttery scroll smoothness

    function getScrollFraction() {
        if (!storySection) return 0;
        const rect = storySection.getBoundingClientRect();
        
        // Check if inside story bounds
        const scrollTop = -rect.top;
        const scrollHeight = rect.height - window.innerHeight;
        
        if (rect.top > 0) return 0;
        if (rect.bottom < window.innerHeight) return 1;

        return Math.max(0, Math.min(1, scrollTop / scrollHeight));
    }

    function handleScroll() {
        targetFraction = getScrollFraction();
    }

    // High performance animation loop
    function updateAnimation() {
        // Interpolate scroll position for cinematic feeling
        currentFraction += (targetFraction - currentFraction) * lerpSpeed;

        const isMobile = window.innerWidth <= 767;

        if (loadedCount === totalFrames) {
            const frameIndex = Math.min(totalFrames - 1, Math.floor(currentFraction * totalFrames));
            
            if (isMobile) {
                // Mobile dynamic image switch
                if (mobileFallbackImg && mobileFallbackImg.src !== images[frameIndex].src) {
                    mobileFallbackImg.src = images[frameIndex].src;
                }
            } else {
                // Desktop Canvas drawing
                renderFrame(frameIndex);
            }

            // Sync text captions & stages based on smoothed progression
            updateCaptions(currentFraction);
        }

        requestAnimationFrame(updateAnimation);
    }

    // Start rendering frame update loop
    requestAnimationFrame(updateAnimation);

    // 6. Stage & Captions Synchronizer
    const captionSlides = document.querySelectorAll('.story-caption-slide');
    
    function updateCaptions(progress) {
        // Divide progress (0 to 1) into 8 discrete stage steps
        const numStages = 8;
        let activeStage = Math.floor(progress * numStages) + 1;
        if (activeStage > numStages) activeStage = numStages;

        captionSlides.forEach((slide) => {
            const stage = parseInt(slide.getAttribute('data-stage'));
            if (stage === activeStage) {
                slide.classList.add('active');
            } else {
                slide.classList.remove('active');
            }
        });
    }

    // 7. Interactive Upward Stat Counters (Section 5)
    const statsSection = document.getElementById('impact');
    const counters = document.querySelectorAll('.counter');
    let countersAnimated = false;

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting && !countersAnimated) {
                animateCounters();
                countersAnimated = true;
            }
        });
    }, { threshold: 0.3 });

    if (statsSection) {
        counterObserver.observe(statsSection);
    }

    function animateCounters() {
        counters.forEach((counter) => {
            const target = +counter.getAttribute('data-target');
            const duration = 2000; // 2 seconds animate duration
            const startTime = performance.now();

            function updateCounter(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Out-cubic easing
                const easeProgress = 1 - Math.pow(1 - progress, 3);
                
                const currentValue = Math.floor(easeProgress * target);
                counter.innerText = currentValue;

                if (progress < 1) {
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.innerText = target;
                }
            }

            requestAnimationFrame(updateCounter);
        });
    }

    // 8. Horizontal Installation Timeline Process Progress (Section 6)
    const processSection = document.getElementById('process');
    const timelineProgress = document.querySelector('.timeline-progress');
    const timelineSteps = document.querySelectorAll('.timeline-step');
    let timelineAnimated = false;

    const processObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting && !timelineAnimated) {
                animateTimeline();
                timelineAnimated = true;
            }
        });
    }, { threshold: 0.2 });

    if (processSection) {
        processObserver.observe(processSection);
    }

    function animateTimeline() {
        let currentStep = 0;
        const totalSteps = timelineSteps.length;
        
        function activateNextStep() {
            if (currentStep < totalSteps) {
                timelineSteps[currentStep].classList.add('active');
                
                // Set timeline bar progress percentage
                const progressPercent = ((currentStep) / (totalSteps - 1)) * 100;
                if (timelineProgress) {
                    timelineProgress.style.width = `${progressPercent}%`;
                }

                currentStep++;
                setTimeout(activateNextStep, 500); // 500ms delay between steps
            }
        }

        activateNextStep();
    }

    // 9. Premium Mobile Menu Overlay Interaction
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileNavOverlay = document.querySelector('.mobile-nav-overlay');
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');

    if (mobileMenuBtn && mobileNavOverlay) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenuBtn.classList.toggle('active');
            mobileNavOverlay.classList.toggle('active');
            
            // Toggle hamburger animation styles
            const bars = mobileMenuBtn.querySelectorAll('.bar');
            if (mobileMenuBtn.classList.contains('active')) {
                bars[0].style.transform = 'translateY(7px) rotate(45deg)';
                bars[1].style.transform = 'translateY(-7px) rotate(-45deg)';
            } else {
                bars[0].style.transform = 'none';
                bars[1].style.transform = 'none';
            }
        });

        mobileLinks.forEach((link) => {
            link.addEventListener('click', () => {
                mobileMenuBtn.classList.remove('active');
                mobileNavOverlay.classList.remove('active');
                
                const bars = mobileMenuBtn.querySelectorAll('.bar');
                bars[0].style.transform = 'none';
                bars[1].style.transform = 'none';
            });
        });
    }

    // Begin Preload sequence
    preloadImages();
});

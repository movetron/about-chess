(() => {
    "use strict";
    let addWindowScrollEvent = false;
    setTimeout((() => {
        if (addWindowScrollEvent) {
            let windowScroll = new Event("windowScroll");
            window.addEventListener("scroll", (function(e) {
                document.dispatchEvent(windowScroll);
            }));
        }
    }), 0);
    function debounce(callee, timeout) {
        let lastCallTimer;
        return function perform(...args) {
            const context = this;
            if (lastCallTimer) clearTimeout(lastCallTimer);
            lastCallTimer = setTimeout((() => {
                callee.apply(context, args);
            }), timeout);
        };
    }
    function createSlideShow(gridStepsSelector) {
        let currentSlideIndex = 0;
        let stageCards = document.querySelector(gridStepsSelector);
        const steps = stageCards.querySelectorAll(".stages-cards__card");
        const prevButton = document.querySelector(".slider-controls__button_type_prev");
        const nextButton = document.querySelector(".slider-controls__button_type_next");
        const indicatorsContainer = document.querySelector(".slider-controls__buttons-container");
        let cachedSlides = calculateSlides(steps);
        function showCurrentSlide() {
            steps.forEach((step => {
                step.style.visibility = "hidden";
                step.style.position = "absolute";
                step.style.opacity = "0";
            }));
            cachedSlides[currentSlideIndex].forEach((step => {
                step.style.opacity = "1";
                step.style.visibility = "visible";
                step.style.position = "relative";
            }));
            updateActiveIndicators();
            prevButton.disabled = currentSlideIndex === 0;
            nextButton.disabled = currentSlideIndex === cachedSlides.length - 1;
        }
        function calculateSlides() {
            const gridStepsStyles = window.getComputedStyle(stageCards);
            const gridStepsPaddingTop = parseInt(gridStepsStyles.paddingTop, 10);
            const gridStepsPaddingBottom = parseInt(gridStepsStyles.paddingBottom, 10);
            const containerHeight = stageCards.offsetHeight - gridStepsPaddingBottom - gridStepsPaddingTop;
            const slides = [];
            let currentSlide = [];
            let totalHeight = 0;
            steps.forEach((step => {
                const stepHeight = step.offsetHeight;
                if (stepHeight > containerHeight / 2) {
                    if (totalHeight > 0) {
                        slides.push(currentSlide);
                        currentSlide = [];
                        totalHeight = 0;
                    }
                    slides.push([ step ]);
                } else if (totalHeight + stepHeight > containerHeight) {
                    slides.push(currentSlide);
                    currentSlide = [ step ];
                    totalHeight = stepHeight;
                } else {
                    currentSlide.push(step);
                    totalHeight += stepHeight;
                }
            }));
            if (currentSlide.length > 0) slides.push(currentSlide);
            return slides;
        }
        function addIndicators() {
            const indicatorContainer = document.querySelector(".slider-controls__buttons-container");
            indicatorContainer.innerHTML = "";
            for (let i = 0; i < cachedSlides.length; i++) {
                const indicator = document.createElement("button");
                indicator.classList.add("slider-controls__circle-button");
                indicator.addEventListener("click", (() => {
                    currentSlideIndex = i;
                    showCurrentSlide();
                }));
                indicatorContainer.appendChild(indicator);
            }
            updateActiveIndicators();
        }
        function updateActiveIndicators() {
            indicatorsContainer.querySelectorAll(".slider-controls__circle-button").forEach(((indicator, index) => {
                indicator.classList.toggle("slider-controls__circle-button_active", index === currentSlideIndex);
            }));
        }
        let isSliderInitialized = false;
        let eventListenersAdded = false;
        function initSlider() {
            if (!isSliderInitialized) {
                cachedSlides = calculateSlides();
                currentSlideIndex = Math.min(currentSlideIndex, cachedSlides.length - 1);
                addIndicators();
                showCurrentSlide();
                if (!eventListenersAdded) {
                    nextButton.addEventListener("click", nextSlide);
                    prevButton.addEventListener("click", prevSlide);
                    eventListenersAdded = true;
                }
                isSliderInitialized = true;
            }
        }
        function deinitSlider() {
            if (isSliderInitialized) {
                steps.forEach((step => {
                    step.style.visibility = "";
                    step.style.position = "";
                    step.style.opacity = "";
                }));
                if (eventListenersAdded) {
                    nextButton.removeEventListener("click", nextSlide);
                    prevButton.removeEventListener("click", prevSlide);
                    eventListenersAdded = false;
                }
                isSliderInitialized = false;
            }
        }
        function nextSlide() {
            if (currentSlideIndex < cachedSlides.length - 1) {
                currentSlideIndex++;
                showCurrentSlide();
            }
        }
        function prevSlide() {
            if (currentSlideIndex > 0) {
                currentSlideIndex--;
                showCurrentSlide();
            }
        }
        function checkSlideShow() {
            if (window.matchMedia("(max-width: 680px)").matches) if (!isSliderInitialized) initSlider(); else {
                cachedSlides = calculateSlides(steps);
                addIndicators();
                showCurrentSlide();
            } else deinitSlider();
        }
        checkSlideShow();
        const debouncedCheckSlideShow = debounce(checkSlideShow, 150);
        window.addEventListener("resize", debouncedCheckSlideShow);
    }
    document.addEventListener("DOMContentLoaded", (function() {
        createSlideShow(".stages-cards");
    }));
    function createCarousel(containerSelector) {
        const container = document.querySelector(containerSelector);
        const prevButton = container.querySelector(".members__prev-btn");
        const nextButton = container.querySelector(".members__next-btn");
        const membersList = container.querySelector(".members__list");
        const members = container.querySelectorAll(".member");
        const membersLength = members.length;
        const member = container.querySelector(".member");
        const currentmembers = container.querySelector(".members__current-items");
        const countmembers = container.querySelector(".members__count-items");
        let currentIndex = 0;
        let visibleItems = calculateVisiblemembers(membersList.offsetWidth, member.offsetWidth);
        let autoSlideTimeout;
        function autoSlide(initialDelay = 0) {
            clearTimeout(autoSlideTimeout);
            autoSlideTimeout = setTimeout((() => {
                if (currentIndex + visibleItems < membersLength) currentIndex += visibleItems; else currentIndex = 0;
                updateUI();
                autoSlide(4e3);
            }), initialDelay);
        }
        function updateUI() {
            countmembers.textContent = membersLength.toString();
            movemembersList();
            updateButtonState();
            updateIndicator();
        }
        function movemembersList() {
            currentIndex = Math.min(currentIndex, membersLength - visibleItems);
            const offset = currentIndex * (member.offsetWidth + (window.innerWidth > 1350 ? 20 : 0));
            membersList.style.transform = `translateX(-${offset}px)`;
        }
        function handleClickNext() {
            clearTimeout(autoSlideTimeout);
            if (currentIndex + visibleItems < membersLength) currentIndex += visibleItems;
            updateUI();
            autoSlide(4e3);
        }
        function handleClickPrev() {
            clearTimeout(autoSlideTimeout);
            currentIndex = Math.max(0, currentIndex - visibleItems);
            updateUI();
            autoSlide(4e3);
        }
        function calculateVisiblemembers(containerWidth, itemWidth) {
            const tolerance = .05;
            const exactCount = containerWidth / itemWidth;
            const roundedCount = Math.floor(exactCount);
            const fraction = exactCount - roundedCount;
            return 1 - fraction <= tolerance ? roundedCount + 1 : roundedCount;
        }
        function updateIndicator() {
            const endIndex = Math.min(currentIndex + visibleItems, membersLength);
            currentmembers.textContent = endIndex.toString();
        }
        function updateButtonState() {
            prevButton.disabled = currentIndex <= 0;
            nextButton.disabled = currentIndex >= membersLength - visibleItems;
        }
        nextButton.addEventListener("click", handleClickNext);
        prevButton.addEventListener("click", handleClickPrev);
        window.addEventListener("resize", debounce((() => {
            visibleItems = calculateVisiblemembers(membersList.offsetWidth, member.offsetWidth);
            if (currentIndex > membersLength - visibleItems) currentIndex = Math.max(0, membersLength - visibleItems);
            updateUI();
            autoSlide(4e3);
        }), 150));
        updateUI();
        autoSlide(4e3);
    }
    document.addEventListener("DOMContentLoaded", (function() {
        createCarousel(".carousel");
    }));
    document.fonts.load('1em "Merriweather"').then((function() {
        const runningLineContainers = document.querySelectorAll(".runline-list__text");
        runningLineContainers.forEach((container => {
            const clonedContainer = container.cloneNode(true);
            const parentSection = container.parentElement;
            parentSection.appendChild(clonedContainer);
        }));
        document.querySelectorAll(".runline-list__text").forEach((container => {
            container.classList.add("running-line__animated");
        }));
    }));
})();
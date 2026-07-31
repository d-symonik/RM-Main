import { SELECTORS } from './constants.js';
import { getElement } from './helpers.js';

const HEADER_SCROLL_OFFSET = 20;
const TIMELINE_START_PERCENT = 20;
const TIMELINE_RANGE_PERCENT = 75;
const TIMELINE_HEIGHT_FACTOR = 0.45;

function updateTimelineProgress(timeline) {
	if (!timeline) return;
	const bounds = timeline.getBoundingClientRect();
	const progress = Math.max(0, Math.min(1, (window.innerHeight - bounds.top) /
		(window.innerHeight + bounds.height * TIMELINE_HEIGHT_FACTOR)));
	const progressLine = getElement('.timeline-progress', timeline);
	if (progressLine) progressLine.style.height = `${TIMELINE_START_PERCENT + progress * TIMELINE_RANGE_PERCENT}%`;
}

export function setupScroll() {
	const header = getElement(SELECTORS.header);
	const timeline = getElement(SELECTORS.timeline);
	let isAnimationFramePending = false;

	function handleScroll() {
		if (isAnimationFramePending) return;
		isAnimationFramePending = true;
		window.requestAnimationFrame(() => {
			header?.classList.toggle('scrolled', window.scrollY > HEADER_SCROLL_OFFSET);
			updateTimelineProgress(timeline);
			isAnimationFramePending = false;
		});
	}

	window.addEventListener('scroll', handleScroll, { passive: true });
	handleScroll();
}

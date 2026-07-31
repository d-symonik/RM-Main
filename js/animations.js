import { BREAKPOINTS, MOTION_QUERY, SELECTORS } from './constants.js';
import { formatNumber, getElement, getElements } from './helpers.js';

const COUNTER_DURATION = 1400;

function hasReducedMotion() {
	return window.matchMedia(MOTION_QUERY).matches;
}

function formatCounterValue(counter, value) {
	const decimalPlaces = Number(counter.dataset.decimals || 0);
	const prefix = counter.dataset.prefix || '';
	const suffix = counter.dataset.suffix || '';
	const formattedValue = decimalPlaces > 0
		? Number(value).toFixed(decimalPlaces)
		: formatNumber(Math.round(value));
	return `${prefix}${formattedValue}${suffix}`;
}

function setCounterValue(counter, value) {
	const formattedValue = formatCounterValue(counter, value);
	counter.style.minWidth = `${formattedValue.length}ch`;
	counter.textContent = formattedValue;
}

export function updateCounterTarget(selector, value) {
	const counter = getElement(selector);
	if (!counter) return;
	counter.dataset.target = String(value);
	counter.dataset.counterVersion = String(Number(counter.dataset.counterVersion || 0) + 1);
	if (counter.dataset.counterStarted === 'true') setCounterValue(counter, value);
	else counter.style.minWidth = `${formatCounterValue(counter, value).length}ch`;
}

export function setupRevealAnimations() {
	const revealItems = getElements(SELECTORS.revealItems);
	if (hasReducedMotion() || !('IntersectionObserver' in window)) {
		revealItems.forEach((item) => item.classList.add('visible'));
		return;
	}
	const observer = new IntersectionObserver((entries) => {
		entries.forEach((entry) => {
			if (!entry.isIntersecting) return;
			entry.target.classList.add('visible');
			observer.unobserve(entry.target);
		});
	}, { threshold: 0.12 });
	revealItems.forEach((item) => observer.observe(item));
}

export function setupCounters() {
	getElements(SELECTORS.counters).forEach((counter) => {
		const target = Number(counter.dataset.target);
		counter.style.minWidth = `${formatCounterValue(counter, target).length}ch`;
		if (hasReducedMotion() || !('IntersectionObserver' in window)) {
			setCounterValue(counter, target);
			return;
		}
		const observer = new IntersectionObserver(([entry]) => {
			if (!entry.isIntersecting) return;
			const version = counter.dataset.counterVersion || '0';
			counter.dataset.counterStarted = 'true';
			const startTime = performance.now();
			function renderCounter(time) {
				if ((counter.dataset.counterVersion || '0') !== version) return;
				const progress = Math.min(1, (time - startTime) / COUNTER_DURATION);
				counter.textContent = formatCounterValue(counter, target * (1 - (1 - progress) ** 3));
				if (progress < 1) window.requestAnimationFrame(renderCounter);
			}
			window.requestAnimationFrame(renderCounter);
			observer.disconnect();
		}, { threshold: 0.2 });
		observer.observe(counter);
	});
}

export function setupCardTilt() {
	if (hasReducedMotion()) return;
	getElements(SELECTORS.tiltCards).forEach((card) => {
		card.addEventListener('pointermove', (event) => {
			const bounds = card.getBoundingClientRect();
			const horizontalPosition = (event.clientX - bounds.left) / bounds.width - 0.5;
			const verticalPosition = (event.clientY - bounds.top) / bounds.height - 0.5;
			card.style.transform = `perspective(900px) rotateY(${horizontalPosition * 4}deg) ` +
				`rotateX(${-verticalPosition * 4}deg) translateY(-4px)`;
		});
		card.addEventListener('pointerleave', () => { card.style.transform = ''; });
	});
}

export function setupHeroParallax() {
	const hero = getElement(SELECTORS.hero);
	if (!hero || hasReducedMotion()) return;
	window.addEventListener('pointermove', (event) => {
		if (window.innerWidth < BREAKPOINTS.heroParallax) return;
		hero.style.setProperty('--mx', `${(event.clientX / window.innerWidth - 0.5) * 10}px`);
		hero.style.setProperty('--my', `${(event.clientY / window.innerHeight - 0.5) * 7}px`);
	}, { passive: true });
}

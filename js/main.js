'use strict';

const SELECTORS = {
	header: '#header',
	navigation: '#nav',
	menuToggle: '#menuToggle',
	hero: '#heroVisual',
	timeline: '#timeline',
	sections: 'main section[id]',
	revealItems: '.reveal',
	counters: '.counter',
	tiltCards: '.tilt',
	allocationGrid: '#allocationGrid',
	allocationProgress: '#allocationProgress'
};

// Set to false when GET /api/allocations is available on the backend.
const USE_MOCK_ALLOCATIONS = true;
const ALLOCATIONS_ENDPOINT = '/api/allocations';
const MOCK_ALLOCATIONS = [
		{ name: 'Genesis', rmAmount: 250000, passCount: 25000, price: 100, allocatedAmount: 80000, tone: 'orange',},
		{ name: 'Growth', rmAmount: 250000, passCount: 25000, price: 200, allocatedAmount: 209000, tone: 'silver',isActive: true  },
		{ name: 'Expansion', rmAmount: 20000, passCount: 25000, price: 300, allocatedAmount: 0, tone: 'gold' },
		{ name: 'Legacy', rmAmount: 250000, passCount: 25000, price: 400, allocatedAmount: 0, tone: 'cyan' }
	]


const header = document.querySelector(SELECTORS.header);
const navigation = document.querySelector(SELECTORS.navigation);
const menuToggle = document.querySelector(SELECTORS.menuToggle);
const hero = document.querySelector(SELECTORS.hero);
const timeline = document.querySelector(SELECTORS.timeline);
const allocationGrid = document.querySelector(SELECTORS.allocationGrid);
const allocationProgress = document.querySelector(SELECTORS.allocationProgress);
const sections = [...document.querySelectorAll(SELECTORS.sections)];
const navigationLinks = navigation ? [...navigation.querySelectorAll('a')] : [];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let scrollTicking = false;

function updateActiveNavigation() {
	const currentSection = sections.reduce((current, section) => (
		window.scrollY >= section.offsetTop - 140 ? section.id : current
	), 'overview');
	navigationLinks.forEach((link) => link.classList.toggle('active', link.hash === `#${currentSection}`));
}

function updateTimelineProgress() {
	if (!timeline) return;
	const bounds = timeline.getBoundingClientRect();
	const progress = Math.max(0, Math.min(1, (window.innerHeight - bounds.top) /
		(window.innerHeight + bounds.height * 0.45)));
	const progressLine = timeline.querySelector('.timeline-progress');
	if (progressLine) progressLine.style.height = `${20 + progress * 75}%`;
}

function handleScroll() {
	if (scrollTicking) return;
	scrollTicking = true;
	window.requestAnimationFrame(() => {
		header?.classList.toggle('scrolled', window.scrollY > 20);
		updateActiveNavigation();
		updateTimelineProgress();
		scrollTicking = false;
	});
}

function setMenuState(isOpen) {
	navigation?.classList.toggle('open', isOpen);
	menuToggle?.setAttribute('aria-expanded', String(isOpen));
	menuToggle?.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
}

function setupMenu() {
	menuToggle?.addEventListener('click', () => setMenuState(!navigation?.classList.contains('open')));
	navigationLinks.forEach((link) => link.addEventListener('click', () => setMenuState(false)));
	window.addEventListener('resize', () => {
		if (window.innerWidth > 767) setMenuState(false);
	}, { passive: true });
}

function setupRevealAnimations() {
	const revealItems = document.querySelectorAll(SELECTORS.revealItems);
	if (reduceMotion.matches || !('IntersectionObserver' in window)) {
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

function setupCounters() {
	const counters = document.querySelectorAll(SELECTORS.counters);
	counters.forEach((counter) => { counter.style.minWidth = `${Number(counter.dataset.target).toLocaleString().length}ch`; });
	if (reduceMotion.matches || !('IntersectionObserver' in window)) {
		counters.forEach((counter) => { counter.textContent = Number(counter.dataset.target).toLocaleString(); });
		return;
	}
	counters.forEach((counter) => {
		const observer = new IntersectionObserver(([entry]) => {
			if (!entry.isIntersecting) return;
			const target = Number(counter.dataset.target);
			const version = counter.dataset.counterVersion || '0';
			counter.dataset.counterStarted = 'true';
			const start = performance.now();
			const render = (time) => {
				if ((counter.dataset.counterVersion || '0') !== version) return;
				const progress = Math.min(1, (time - start) / 1400);
				counter.textContent = Math.round(target * (1 - (1 - progress) ** 3)).toLocaleString();
				if (progress < 1) window.requestAnimationFrame(render);
			};
			window.requestAnimationFrame(render);
			observer.disconnect();
		}, { threshold: 0.2 });
		observer.observe(counter);
	});
}

function updateCounterTarget(selector, value) {
	const counter = document.querySelector(selector);
	if (!counter) return;
	const formattedValue = Number(value).toLocaleString();
	counter.dataset.target = String(value);
	counter.dataset.counterVersion = String(Number(counter.dataset.counterVersion || 0) + 1);
	counter.style.minWidth = `${formattedValue.length}ch`;
	if (counter.dataset.counterStarted === 'true') counter.textContent = formattedValue;
}

async function getMockAllocations() {
	return Promise.resolve(MOCK_ALLOCATIONS);
}

async function getAllocations() {
	if (USE_MOCK_ALLOCATIONS) return getMockAllocations();
	const response = await fetch(ALLOCATIONS_ENDPOINT, { headers: { Accept: 'application/json' } });
	if (!response.ok) throw new Error(`Failed to load allocations: ${response.status}`);
	const payload = await response.json();
	return payload.data;
}

function renderAllocationCards(allocations) {
	if (!allocationGrid) return;
	const fragment = document.createDocumentFragment();
	allocations.forEach((allocation) => {
		const card = document.createElement('article');
		const title = document.createElement('b');
		const amount = document.createElement('span');
		const passes = document.createElement('span');
		const price = document.createElement('strong');
		card.className = `cycle ${allocation.tone}${allocation.isActive ? ' is-active' : ''}`;
		title.textContent = allocation.name;
		amount.textContent = `${allocation.rmAmount.toLocaleString()} RM`;
		passes.textContent = `${allocation.passCount.toLocaleString()} Passes`;
		price.textContent = `$${allocation.price.toLocaleString()}`;
		card.append(title, amount, passes, price);
		if (allocation.isActive) {
			const badge = document.createElement('em');
			badge.className = 'cycle-badge';
			badge.textContent = 'LIVE';
			card.append(badge);
		}
		fragment.append(card);
	});
	allocationGrid.replaceChildren(fragment);
	allocationGrid.setAttribute('aria-busy', 'false');
}

function renderActiveAllocation(activeAllocation, allocations) {
	if (!allocationProgress || !activeAllocation) return;
	const nextAllocation = allocations[allocations.indexOf(activeAllocation) + 1];
	const sold = activeAllocation.allocatedAmount;
	const remaining = activeAllocation.rmAmount - sold;
	const priceNow = document.querySelector('#allocPriceNow');
	const priceNext = document.querySelector('#allocPriceNext');
	const kicker = document.querySelector('#allocationKicker');
	const title = document.querySelector('#allocationTitle');
	const description = document.querySelector('#allocationDescription');

	document.querySelector('#allocSold').textContent = sold.toLocaleString();
	document.querySelector('#allocRemaining').textContent = remaining.toLocaleString();

	kicker.textContent = `ALLOCATION ${allocations.indexOf(activeAllocation) + 1} — LIVE NOW`;
	title.textContent = `${activeAllocation.rmAmount.toLocaleString()} RM at $${activeAllocation.price.toLocaleString()}`;
	description.textContent = nextAllocation
		? `The next ${nextAllocation.rmAmount.toLocaleString()} RM will be available at $${nextAllocation.price.toLocaleString()} per RM once this allocation is fully allocated.`
		: `This is the final allocation. Once fully allocated, no further RM will be issued.`;

	[kicker, title, description].forEach((el) => el.classList.remove('is-hidden'));

	priceNow.textContent = `CURRENT PRICE — $${activeAllocation.price.toLocaleString()}`;
	priceNext.textContent = nextAllocation ? `NEXT PRICE — $${nextAllocation.price.toLocaleString()}` : 'FINAL ALLOCATION';
	allocationProgress.classList.remove('is-hidden');
	allocationProgress.dataset.total = String(activeAllocation.rmAmount);
	allocationProgress.dataset.sold = String(sold);
	const track = document.querySelector('#allocFill')?.parentElement;
	const fill = document.querySelector('#allocFill');
	track?.setAttribute('aria-valuemax', String(activeAllocation.rmAmount));
	track?.setAttribute('aria-valuenow', String(sold));
	if (fill) fill.style.width = `${(sold / activeAllocation.rmAmount) * 100}%`;
}
function renderSupplyStats(allocations, activeAllocation) {
	const totalSupply = allocations.reduce((total, allocation) => total + allocation.rmAmount, 0);
	const formattedTotal = `${totalSupply.toLocaleString()} RM`;
	const titleAmount = document.querySelector('#fixedSupplyTitleAmount');
	const descriptionAmount = document.querySelector('#fixedSupplyDescriptionAmount');
	const activeLabel = document.querySelector('#activeAllocationLabel');

	titleAmount.textContent = formattedTotal;
	descriptionAmount.textContent = formattedTotal;
	titleAmount.classList.remove('is-hidden');
	descriptionAmount.classList.remove('is-hidden');
	updateCounterTarget('#totalSupplyCounter', totalSupply);

	if (activeAllocation) {
		const activeIndex = allocations.indexOf(activeAllocation) + 1;
		activeLabel.textContent = `ALLOCATION ${activeIndex} — ${activeAllocation.name.toUpperCase()}`;
		activeLabel.classList.remove('is-hidden');
		updateCounterTarget('#activeAllocationCounter', activeAllocation.rmAmount);
	}
}
function showFallbackAllocationState() {
	allocationGrid.replaceChildren();
	const message = document.createElement('p');
	message.className = 'allocation-status';
	message.textContent = 'Allocation details will be updated shortly.';
	allocationGrid.append(message);
	allocationGrid.setAttribute('aria-busy', 'false');

	const titleAmount = document.querySelector('#fixedSupplyTitleAmount');
	const descriptionAmount = document.querySelector('#fixedSupplyDescriptionAmount');
	titleAmount.textContent = '—';
	descriptionAmount.textContent = '';
	document.querySelector('#totalSupplyCounter').textContent = '—';
	document.querySelector('#activeAllocationCounter').textContent = '—';

	showNoActiveAllocationMessage();
}
async function loadAllocations() {
	if (!allocationGrid) return;
	let allocations;
	try {
		allocations = await getAllocations();
	} catch (error) {
		console.error('Unable to load allocations.', error);
		showFallbackAllocationState();
		return;
	}

	if (!allocations || !allocations.length) {
		showFallbackAllocationState();
		return;
	}

	const activeAllocation = allocations.find((allocation) => allocation.isActive);

	renderAllocationCards(allocations);
	renderSupplyStats(allocations, activeAllocation);

	if (activeAllocation) {
		renderActiveAllocation(activeAllocation, allocations);
	} else {
		showNoActiveAllocationMessage();
	}
}
function showNoActiveAllocationMessage() {
	const kicker = document.querySelector('#allocationKicker');
	const title = document.querySelector('#allocationTitle');
	const description = document.querySelector('#allocationDescription');
	kicker.textContent = 'NO ALLOCATION LIVE';
	title.textContent = 'No allocation is currently active.';
	description.textContent = 'Check back soon for the next allocation window.';
	[kicker, title, description].forEach((el) => el.classList.remove('is-hidden'));
	allocationProgress?.classList.add('is-hidden');
}
function setupCardTilt() {
	if (reduceMotion.matches) return;
	document.querySelectorAll(SELECTORS.tiltCards).forEach((card) => {
		card.addEventListener('pointermove', (event) => {
			const bounds = card.getBoundingClientRect();
			const x = (event.clientX - bounds.left) / bounds.width - 0.5;
			const y = (event.clientY - bounds.top) / bounds.height - 0.5;
			card.style.transform = `perspective(900px) rotateY(${x * 4}deg) rotateX(${-y * 4}deg) translateY(-4px)`;
		});
		card.addEventListener('pointerleave', () => { card.style.transform = ''; });
	});
}

function setupHeroParallax() {
	if (!hero || reduceMotion.matches) return;
	window.addEventListener('pointermove', (event) => {
		if (window.innerWidth < 900) return;
		hero.style.setProperty('--mx', `${(event.clientX / window.innerWidth - 0.5) * 10}px`);
		hero.style.setProperty('--my', `${(event.clientY / window.innerHeight - 0.5) * 7}px`);
	}, { passive: true });
}

function setupVideoPlayButton() {
	const frame = document.querySelector('#videoFrame');
	const video = document.querySelector('#watchVideo');
	const bigPlay = document.querySelector('#videoBigPlay');
	if (!frame || !video || !bigPlay) return;

	bigPlay.addEventListener('click', () => {
		video.controls = true;
		video.play().catch(() => {
		});
	});

	video.addEventListener('play', () => frame.classList.add('is-playing'), { once: true });
}

window.addEventListener('scroll', handleScroll, { passive: true });
setupMenu();
setupRevealAnimations();
setupCounters();
loadAllocations();
setupCardTilt();
setupHeroParallax();
setupVideoPlayButton();
handleScroll();
export const SELECTORS = {
	header: '#header',
	navigation: '#nav',
	menuToggle: '#menuToggle',
	hero: '#heroVisual',
	timeline: '#timeline',
	revealItems: '.reveal',
	counters: '.counter',
	tiltCards: '.tilt',
	allocationGrid: '#allocationGrid',
	allocationProgress: '#allocationProgress',
	allocationFill: '#allocFill',
	allocationSold: '#allocSold',
	allocationRemaining: '#allocRemaining',
	allocationPriceNow: '#allocPriceNow',
	allocationPriceNext: '#allocPriceNext',
	allocationKicker: '#allocationKicker',
	allocationTitle: '#allocationTitle',
	allocationDescription: '#allocationDescription',
	fixedSupplyTitleAmount: '#fixedSupplyTitleAmount',
	fixedSupplyDescriptionAmount: '#fixedSupplyDescriptionAmount',
	totalSupplyCounter: '#totalSupplyCounter',
	activeAllocationCounter: '#activeAllocationCounter',
	activeAllocationLabel: '#activeAllocationLabel',
	videoFrame: '#videoFrame',
	watchVideo: '#watchVideo',
	videoBigPlay: '#videoBigPlay'
};

export const ENDPOINTS = {
	allocations: '/api/allocations'
};

export const BREAKPOINTS = {
	mobileNavigation: 767,
	heroParallax: 900
};

export const MOTION_QUERY = '(prefers-reduced-motion: reduce)';
export const USE_MOCK_ALLOCATIONS = true;

export const MOCK_ALLOCATIONS = [
	{ name: 'Genesis', rmAmount: 250000, passCount: 25000, price: 100, allocatedAmount: 80000, tone: 'orange' },
	{ name: 'Growth', rmAmount: 250000, passCount: 25000, price: 200, allocatedAmount: 209000, tone: 'silver', isActive: true },
	{ name: 'Expansion', rmAmount: 20000, passCount: 25000, price: 300, allocatedAmount: 0, tone: 'gold' },
	{ name: 'Legacy', rmAmount: 250000, passCount: 25000, price: 400, allocatedAmount: 0, tone: 'cyan' }
];

import { ENDPOINTS, MOCK_ALLOCATIONS, SELECTORS, USE_MOCK_ALLOCATIONS } from './constants.js';
import { formatNumber, getElement, setText } from './helpers.js';
import { updateCounterTarget } from './animations.js';

function getActiveAllocationElements() {
	return {
		progress: getElement(SELECTORS.allocationProgress),
		fill: getElement(SELECTORS.allocationFill),
		sold: getElement(SELECTORS.allocationSold),
		remaining: getElement(SELECTORS.allocationRemaining),
		priceNow: getElement(SELECTORS.allocationPriceNow),
		priceNext: getElement(SELECTORS.allocationPriceNext),
		title: getElement(SELECTORS.allocationTitle),
		description: getElement(SELECTORS.allocationDescription)
	};
}

async function getAllocations() {
	if (USE_MOCK_ALLOCATIONS) return MOCK_ALLOCATIONS;
	const response = await fetch(ENDPOINTS.allocations, { headers: { Accept: 'application/json' } });
	if (!response.ok) throw new Error(`Failed to load allocations: ${response.status}`);
	const payload = await response.json();
	return payload?.data;
}

function renderAllocationCards(allocationGrid, allocations) {
	const fragment = document.createDocumentFragment();
	allocations.forEach((allocation) => {
		const card = document.createElement('article');
		const title = document.createElement('b');
		const amount = document.createElement('span');
		const passes = document.createElement('span');
		const price = document.createElement('strong');
		card.className = `cycle ${allocation.tone}${allocation.isActive ? ' is-active' : ''}`;
		title.textContent = allocation.name;
		amount.textContent = `${formatNumber(allocation.rmAmount)} RM`;
		passes.textContent = `${formatNumber(allocation.passCount)} Passes`;
		price.textContent = `$${formatNumber(allocation.price)}`;
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
	const elements = getActiveAllocationElements();
	if (!elements.progress) return;
	const nextAllocation = allocations[allocations.indexOf(activeAllocation) + 1];
	const soldAmount = activeAllocation.allocatedAmount;
	const remainingAmount = activeAllocation.rmAmount - soldAmount;

	if (elements.sold) elements.sold.textContent = formatNumber(soldAmount);
	if (elements.remaining) elements.remaining.textContent = formatNumber(remainingAmount);
	if (elements.title) {
		elements.title.textContent = `${formatNumber(activeAllocation.rmAmount)} RM at $${formatNumber(activeAllocation.price)}`;
	}
	if (elements.description) {
		elements.description.textContent = nextAllocation
			? `The next ${formatNumber(nextAllocation.rmAmount)} RM will be available at $${formatNumber(nextAllocation.price)} per RM once this allocation is fully allocated.`
			: 'This is the final allocation. Once fully allocated, no further RM will be issued.';
	}
	[elements.title, elements.description].filter(Boolean).forEach((element) => element.classList.remove('is-hidden'));
	if (elements.priceNow) elements.priceNow.textContent = `CURRENT PRICE — $${formatNumber(activeAllocation.price)}`;
	if (elements.priceNext) elements.priceNext.textContent = nextAllocation
		? `NEXT PRICE — $${formatNumber(nextAllocation.price)}`
		: 'FINAL ALLOCATION';
	elements.progress.classList.remove('is-hidden');
	elements.progress.dataset.total = String(activeAllocation.rmAmount);
	elements.progress.dataset.sold = String(soldAmount);
	const track = elements.fill?.parentElement;
	track?.setAttribute('aria-valuemax', String(activeAllocation.rmAmount));
	track?.setAttribute('aria-valuenow', String(soldAmount));
	if (elements.fill) elements.fill.style.width = `${(soldAmount / activeAllocation.rmAmount) * 100}%`;
}

function renderSupplyStats(allocations, activeAllocation) {
	const totalSupply = allocations.reduce((total, allocation) => total + allocation.rmAmount, 0);
	const formattedTotalSupply = `${formatNumber(totalSupply)} RM`;
	const titleAmount = setText(SELECTORS.fixedSupplyTitleAmount, formattedTotalSupply);
	const descriptionAmount = setText(SELECTORS.fixedSupplyDescriptionAmount, formattedTotalSupply);
	titleAmount?.classList.remove('is-hidden');
	descriptionAmount?.classList.remove('is-hidden');
	updateCounterTarget(SELECTORS.totalSupplyCounter, totalSupply);
	if (!activeAllocation) return;
	const activeIndex = allocations.indexOf(activeAllocation) + 1;
	const activeLabel = setText(
		SELECTORS.activeAllocationLabel,
		`ALLOCATION ${activeIndex} — ${activeAllocation.name.toUpperCase()}`
	);
	activeLabel?.classList.remove('is-hidden');
	updateCounterTarget(SELECTORS.activeAllocationCounter, activeAllocation.rmAmount);
}

function showNoActiveAllocationMessage() {
	const kicker = setText(SELECTORS.allocationKicker, 'NO ALLOCATION LIVE');
	const title = setText(SELECTORS.allocationTitle, 'No allocation is currently active.');
	const description = setText(SELECTORS.allocationDescription, 'Check back soon for the next allocation window.');
	[kicker, title, description].filter(Boolean).forEach((element) => element.classList.remove('is-hidden'));
	getElement(SELECTORS.allocationProgress)?.classList.add('is-hidden');
}

function showFallbackAllocationState(allocationGrid) {
	const message = document.createElement('p');
	message.className = 'allocation-status';
	message.textContent = 'Allocation details will be updated shortly.';
	allocationGrid.replaceChildren(message);
	allocationGrid.setAttribute('aria-busy', 'false');
	setText(SELECTORS.fixedSupplyTitleAmount, '—');
	setText(SELECTORS.fixedSupplyDescriptionAmount, '');
	setText(SELECTORS.totalSupplyCounter, '—');
	setText(SELECTORS.activeAllocationCounter, '—');
	showNoActiveAllocationMessage();
}

export async function loadAllocations() {
	const allocationGrid = getElement(SELECTORS.allocationGrid);
	if (!allocationGrid) return;
	let allocations;
	try {
		allocations = await getAllocations();
	} catch (error) {
		console.warn('Unable to load allocations.', error);
		showFallbackAllocationState(allocationGrid);
		return;
	}
	if (!Array.isArray(allocations) || allocations.length === 0) {
		showFallbackAllocationState(allocationGrid);
		return;
	}
	const activeAllocation = allocations.find((allocation) => allocation.isActive);
	renderAllocationCards(allocationGrid, allocations);
	renderSupplyStats(allocations, activeAllocation);
	if (activeAllocation) renderActiveAllocation(activeAllocation, allocations);
	else showNoActiveAllocationMessage();
}

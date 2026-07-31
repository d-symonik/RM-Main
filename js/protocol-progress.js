'use strict';

const progressList = document.querySelector('#progressList');
const progressTotalBadge = document.querySelector('#progressTotalBadge');
const progressTotalCounter = document.querySelector('#progressTotalCounter');

const PROGRESS_ENDPOINT = '/api/protocol-progress';
const USE_MOCK_PROGRESS = true;

const MOCK_PROGRESS = {
	totalPasses: 100000,
	maximumSupply: 100000,
	allocations: [
		{ name: 'Allocation 1', status: 'live', percent: 62, passesAllocated: 15500, price: 100 },
		{ name: 'Allocation 2', status: 'next', percent: 0, passesAllocated: 0, price: 200 },
		{ name: 'Allocation 3', status: 'next', percent: 0, passesAllocated: 0, price: 300 },
		{ name: 'Allocation 4', status: 'next', percent: 0, passesAllocated: 0, price: 400 }
	]
};

const PEOPLE_ICON = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
	'<path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>' +
	'</svg>';

function animateCount(element, target) {
	if (!element) return;
	const formatted = Number(target).toLocaleString();
	element.style.minWidth = `${formatted.length}ch`;
	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
		element.textContent = formatted;
		return;
	}
	const start = performance.now();
	const render = (time) => {
		const progress = Math.min(1, (time - start) / 1200);
		element.textContent = Math.round(target * (1 - (1 - progress) ** 3)).toLocaleString();
		if (progress < 1) window.requestAnimationFrame(render);
	};
	window.requestAnimationFrame(render);
}

function statusLabel(status) {
	if (status === 'live') return 'LIVE';
	if (status === 'complete') return 'FULLY ALLOCATED';
	return 'COMING NEXT';
}

function buildRow(allocation, index) {
	const { status, percent, passesAllocated, price, name } = allocation;

	const row = document.createElement('article');
	row.className = `progress-row${status === 'live' ? ' is-live' : ''}${status === 'complete' ? ' is-complete' : ''}`;

	// Left: number + name + status badge
	const numBlock = document.createElement('div');
	numBlock.className = 'progress-num-block';
	const num = document.createElement('span');
	num.className = 'progress-num';
	num.textContent = String(index + 1).padStart(2, '0');
	const nameWrap = document.createElement('div');
	const nameEl = document.createElement('div');
	nameEl.className = 'progress-alloc-name';
	nameEl.textContent = name.toUpperCase();
	const badge = document.createElement('span');
	badge.className = `progress-status status-${status}`;
	badge.textContent = statusLabel(status);
	nameWrap.append(nameEl, badge);
	numBlock.append(num, nameWrap);

	// Middle: progress bar + passes allocated
	const mid = document.createElement('div');
	mid.className = 'progress-mid';
	const barLabel = document.createElement('div');
	barLabel.className = 'progress-bar-label';
	const barLabelText = document.createElement('span');
	barLabelText.textContent = 'PROGRESS';
	const barLabelPercent = document.createElement('b');
	barLabelPercent.textContent = `${percent}%`;
	barLabel.append(barLabelText, barLabelPercent);

	const track = document.createElement('div');
	track.className = 'progress-bar-track';
	track.setAttribute('role', 'progressbar');
	track.setAttribute('aria-label', `${name} allocation progress`);
	track.setAttribute('aria-valuemin', '0');
	track.setAttribute('aria-valuemax', '100');
	track.setAttribute('aria-valuenow', String(percent));
	const fill = document.createElement('div');
	fill.className = 'progress-bar-fill';
	track.append(fill);

	const meta = document.createElement('div');
	meta.className = 'progress-meta';
	meta.innerHTML = PEOPLE_ICON;
	const metaText = document.createElement('span');
	metaText.textContent = `${passesAllocated.toLocaleString()} Passes Allocated`;
	meta.append(metaText);

	mid.append(barLabel, track, meta);

	// Right: contribution price
	const contribution = document.createElement('div');
	contribution.className = 'progress-contribution';
	const contribLabel = document.createElement('span');
	contribLabel.className = 'progress-contribution-label';
	contribLabel.textContent = 'CONTRIBUTION';
	const priceEl = document.createElement('strong');
	priceEl.className = 'progress-price';
	priceEl.textContent = `$${price.toLocaleString()}`;
	const unit = document.createElement('span');
	unit.className = 'progress-unit';
	unit.textContent = '/ RM';
	contribution.append(contribLabel, priceEl, unit);

	row.append(numBlock, mid, contribution);

	// Animate the fill in after insertion so the transition is visible.
	requestAnimationFrame(() => requestAnimationFrame(() => { fill.style.width = `${percent}%`; }));

	return row;
}

function showFallback(message) {
	if (!progressList) return;
	const messageElement = document.createElement('p');
	messageElement.className = 'allocation-status allocation-status--error';
	messageElement.textContent = message;
	progressList.replaceChildren(messageElement);
	progressList.setAttribute('aria-busy', 'false');
	progressTotalCounter && (progressTotalCounter.textContent = '—');
	progressTotalBadge?.setAttribute('aria-busy', 'false');
}

async function getMockProgress() {
	return Promise.resolve(MOCK_PROGRESS);
}

async function getProgress() {
	if (USE_MOCK_PROGRESS) return getMockProgress();
	const response = await fetch(PROGRESS_ENDPOINT, { headers: { Accept: 'application/json' } });
	if (!response.ok) throw new Error(`Failed to load protocol progress: ${response.status}`);
	const payload = await response.json();
	return payload.data;
}

async function loadProgress() {
	if (!progressList) return;

	let progress;
	try {
		progress = await getProgress();
	} catch (error) {
		console.warn('Unable to load protocol progress.', error);
		showFallback('Allocation progress will be updated shortly.');
		return;
	}

	if (!progress || !progress.allocations || !progress.allocations.length) {
		showFallback('No allocations are available yet.');
		return;
	}

	animateCount(progressTotalCounter, progress.totalPasses);
	progressTotalBadge?.setAttribute('aria-busy', 'false');

	const fragment = document.createDocumentFragment();
	progress.allocations.forEach((allocation, index) => fragment.append(buildRow(allocation, index)));
	progressList.replaceChildren(fragment);
	progressList.setAttribute('aria-busy', 'false');
}

loadProgress();

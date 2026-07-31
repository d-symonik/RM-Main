export function getElement(selector, parent = document) {
	return parent.querySelector(selector);
}

export function getElements(selector, parent = document) {
	return [...parent.querySelectorAll(selector)];
}

export function formatNumber(value) {
	return Number(value).toLocaleString();
}

export function setText(selector, value) {
	const element = getElement(selector);
	if (element) element.textContent = value;
	return element;
}

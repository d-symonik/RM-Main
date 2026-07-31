import { BREAKPOINTS, SELECTORS } from './constants.js';
import { getElement, getElements } from './helpers.js';

function getCurrentPageName() {
	const path = window.location.pathname.replace(/\/$/, '');
	const pageName = path.split('/').pop();
	return pageName?.includes('.') ? pageName : 'index.html';
}

function setMenuState(navigation, menuToggle, isOpen) {
	navigation?.classList.toggle('open', isOpen);
	menuToggle?.setAttribute('aria-expanded', String(isOpen));
	menuToggle?.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
}

export function setupNavigation() {
	const navigation = getElement(SELECTORS.navigation);
	const menuToggle = getElement(SELECTORS.menuToggle);
	const navigationLinks = navigation ? getElements('a', navigation) : [];
	const currentPageName = getCurrentPageName();

	navigationLinks.forEach((link) => {
		const linkPageName = link.pathname.split('/').pop() || 'index.html';
		link.classList.toggle('active', linkPageName === currentPageName);
		link.addEventListener('click', () => setMenuState(navigation, menuToggle, false));
	});

	menuToggle?.addEventListener('click', () => {
		setMenuState(navigation, menuToggle, !navigation?.classList.contains('open'));
	});

	window.addEventListener('resize', () => {
		if (window.innerWidth > BREAKPOINTS.mobileNavigation) setMenuState(navigation, menuToggle, false);
	}, { passive: true });
}

import { loadAllocations } from './allocations.js';
import {
	setupCardTilt,
	setupCounters,
	setupHeroParallax,
	setupRevealAnimations
} from './animations.js';
import { setupNavigation } from './navigation.js';
import { setupScroll } from './scroll.js';
import { setupVideoPlayer } from './video.js';
import { setupContactForm } from './contact-form.js';

function initializePage() {
	setupNavigation();
	setupScroll();
	setupRevealAnimations();
	setupCounters();
	loadAllocations();
	setupCardTilt();
	setupHeroParallax();
	setupVideoPlayer();
	setupContactForm();
}

initializePage();

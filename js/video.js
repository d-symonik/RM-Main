import { SELECTORS } from './constants.js';
import { getElement } from './helpers.js';

export function setupVideoPlayer() {
	const frame = getElement(SELECTORS.videoFrame);
	const video = getElement(SELECTORS.watchVideo);
	const playButton = getElement(SELECTORS.videoBigPlay);
	if (!frame || !video || !playButton) return;

	const playVideo = () => {
		video.controls = true;
		video.play().catch(() => {});
	};

	playButton.addEventListener('click', () => {
		playVideo();
	});
	video.addEventListener('play', () => frame.classList.add('is-playing'), { once: true });

	if (!('IntersectionObserver' in window)) {
		playVideo();
		return;
	}

	const observer = new IntersectionObserver(([entry]) => {
		if (!entry.isIntersecting) return;
		playVideo();
		observer.unobserve(frame);
	}, { threshold: 0.8 });
	observer.observe(frame);
}

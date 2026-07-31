import { SELECTORS } from './constants.js';
import { getElement } from './helpers.js';

export function setupVideoPlayer() {
	const frame = getElement(SELECTORS.videoFrame);
	const video = getElement(SELECTORS.watchVideo);
	const playButton = getElement(SELECTORS.videoBigPlay);
	if (!frame || !video || !playButton) return;

	playButton.addEventListener('click', () => {
		video.controls = true;
		video.play().catch(() => {});
	});
	video.addEventListener('play', () => frame.classList.add('is-playing'), { once: true });
}

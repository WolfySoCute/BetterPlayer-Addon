import {normalizePath} from '@/utils';

export class Background {
    constructor(public backgroundSelector: string) {
        this.backgroundSelector = backgroundSelector;
    }

    get backgroundDiv(): HTMLDivElement | null {
        if (!document.body) {
            return null;
        }

        return document.querySelector(this.backgroundSelector);
    }

    public setBrightness(brightness: number) {
        const backgroundDiv = this.backgroundDiv;
        if (!backgroundDiv || brightness == undefined) return;

        const brightnessNormalized = brightness / 100;
        backgroundDiv.style.setProperty('--brightness', brightnessNormalized.toString());
    }

    public setImage(imageLink: string) {
        const backgroundDiv = this.backgroundDiv;
        if (!backgroundDiv) return;

        const backgroundImage = imageLink ? `url("${normalizePath(imageLink)}")` : 'none';

        if (backgroundDiv.style.getPropertyValue('--background') === backgroundImage) return;
        if (backgroundDiv.style.getPropertyValue('--background-next')) return;

        backgroundDiv.style.setProperty('--background-next', backgroundImage);
        backgroundDiv.classList.add('animate');

        const onTransitionEnd = (event: TransitionEvent) => {
            if (event.propertyName !== 'opacity') return;

            backgroundDiv.style.setProperty('--background', backgroundImage);
            backgroundDiv.classList.remove('animate');
            backgroundDiv.style.removeProperty('--background-next');
            backgroundDiv.removeEventListener('transitionend', onTransitionEnd);
        };

        backgroundDiv.addEventListener('transitionend', onTransitionEnd);
    }
}
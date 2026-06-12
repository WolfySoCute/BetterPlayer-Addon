import {getBrightnessCorrection, normalizePath} from '@/utils';
import {FULLSCREEN_PLAYER} from '@/player/constants';
import {logger} from '@/logger';

export class Background {
    private _brightnessCorrection: boolean = false;
    private _isAnimating: boolean = false;
    private _pendingImageLink: string | undefined = undefined;
    private _safetyTimer: number | null = null;

    get backgroundDiv(): HTMLDivElement | null {
        if (!document.body) {
            return null;
        }

        return document.querySelector(FULLSCREEN_PLAYER);
    }

    public setBrightnessCorrection(brightnessCorrection: boolean) {
        this._brightnessCorrection = brightnessCorrection;
        if (!this._pendingImageLink) return;

        this.updateBrightnessCorrection(this._pendingImageLink);
    }

    private updateBrightnessCorrection(targetImageLink: string | undefined) {
        const backgroundDiv = this.backgroundDiv;
        if (!backgroundDiv) return;

        if (!targetImageLink || !this._brightnessCorrection) {
            backgroundDiv.style.setProperty('--brightness-correction', '1');
            logger.debug('--brightness-correction изменен на:', backgroundDiv.style.getPropertyValue('--brightness-correction'));
            return;
        }

        getBrightnessCorrection(normalizePath(targetImageLink))
            .then(r => {
                if (this._pendingImageLink !== targetImageLink) return;
                backgroundDiv.style.setProperty('--brightness-correction', r.toString());
                logger.debug('--brightness-correction изменен на:', backgroundDiv.style.getPropertyValue('--brightness-correction'));
            })
            .catch(e => console.error(e));
    }

    public setBrightness(brightness: number) {
        const backgroundDiv = this.backgroundDiv;
        if (!backgroundDiv || brightness == undefined) return;

        const brightnessNormalized = brightness / 100;
        backgroundDiv.style.setProperty('--brightness', brightnessNormalized.toString());
        logger.debug('--brightness изменен на:', backgroundDiv.style.getPropertyValue('--brightness'));
    }

    public setImage(imageLink: string) {
        const backgroundDiv = this.backgroundDiv;
        if (!backgroundDiv) return;

        this._pendingImageLink = imageLink;
        if (this._isAnimating) return;

        const backgroundImage = imageLink ? `url("${normalizePath(imageLink)}")` : 'none';

        if (backgroundDiv.style.getPropertyValue('--background') === backgroundImage) {
            this.updateBrightnessCorrection(imageLink);
            return;
        }

        this._isAnimating = true;
        if (this._safetyTimer) clearTimeout(this._safetyTimer);

        this.updateBrightnessCorrection(imageLink);
        backgroundDiv.style.setProperty('--background-next', backgroundImage);
        logger.debug('--background-next изменен на:', backgroundDiv.style.getPropertyValue('--background-next'));

        const finishAnimation = () => {
            if (this._safetyTimer) clearTimeout(this._safetyTimer);
            backgroundDiv.removeEventListener('transitionend', onTransitionEnd);

            backgroundDiv.style.setProperty('--background', backgroundImage);
            logger.debug('--background изменен на:', backgroundDiv.style.getPropertyValue('--background'));
            backgroundDiv.classList.remove('animate');
            backgroundDiv.style.removeProperty('--background-next');
            logger.debug('--background-next изменен на:', backgroundDiv.style.getPropertyValue('--background-next'));

            setTimeout(() => {
                this._isAnimating = false;
                if (this._pendingImageLink !== imageLink) {
                    this.setImage(this._pendingImageLink as string);
                }
            }, 50);
        }

        const onTransitionEnd = (event: TransitionEvent) => {
            if (event.target === backgroundDiv && event.propertyName === 'opacity') {
                finishAnimation();
            }
        };

        this._safetyTimer = window.setTimeout(() => {
            logger.warn("Safety timeout triggered: transitionend missed.");
            finishAnimation();
        }, 700);

        backgroundDiv.addEventListener('transitionend', onTransitionEnd);

        requestAnimationFrame(() => {
            backgroundDiv.classList.add('animate');
        });
    }

    public setBlur(blur: number) {
        const backgroundDiv = this.backgroundDiv;
        if (!backgroundDiv) return;

        backgroundDiv.style.setProperty('--blur', `${blur}px`);
        logger.debug('--blur изменен на:', backgroundDiv.style.getPropertyValue('--blur'));
    }
}
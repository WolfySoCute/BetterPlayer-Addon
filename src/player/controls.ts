import {FULLSCREEN_PLAYER, PLAYER_CONTROLS} from '@/player/constants';
import {
    ButtonSize, ContextMenuButton,
    LikeButton,
    LyricsButton,
    NextButton,
    PlayButton,
    PrevButton, QueueButton,
    RepeatButton, ShuffleButton,
} from '@/elements/controlButton';

export class Controls {
    get fullscreenPlayerDiv(): HTMLDivElement | null {
        if (!document.body) {
            return null;
        }

        return document.querySelector(FULLSCREEN_PLAYER);
    }

    public setContentBackground(id: number) {
        const fullscreenPlayerDiv = this.fullscreenPlayerDiv;
        fullscreenPlayerDiv?.style.setProperty('--content-background-style', id.toString());
    }

    private createControlsDiv() {
        const controlsDiv = document.createElement('div');

        const queueButton = new QueueButton(ButtonSize.SMALL);
        const contextMenuButton = new ContextMenuButton(ButtonSize.SMALL);
        const shuffleButton = new ShuffleButton(ButtonSize.SMALL);
        const prevButton = new PrevButton(ButtonSize.MEDIUM);
        const playButton = new PlayButton(ButtonSize.MEDIUM);
        const nextButton = new NextButton(ButtonSize.MEDIUM);
        const repeatButton = new RepeatButton(ButtonSize.SMALL);
        const likeButton = new LikeButton(ButtonSize.SMALL)
        const lyricsButton = new LyricsButton(ButtonSize.SMALL);

        controlsDiv.classList.add('customControls');
        controlsDiv.appendChild(queueButton.element);
        controlsDiv.appendChild(contextMenuButton.element);
        controlsDiv.appendChild(shuffleButton.element);
        controlsDiv.appendChild(prevButton.element);
        controlsDiv.appendChild(playButton.element);
        controlsDiv.appendChild(nextButton.element);
        controlsDiv.appendChild(repeatButton.element);
        controlsDiv.appendChild(likeButton.element);
        controlsDiv.appendChild(lyricsButton.element);

        return controlsDiv;
    }

    public setCustomControls(controlsEnabled: boolean) {
        const fullscreenPlayerDiv = this.fullscreenPlayerDiv;
        if (!fullscreenPlayerDiv) return;

        const customControls = fullscreenPlayerDiv.querySelector('.customControls');
        if (controlsEnabled && customControls) return;

        if (controlsEnabled) {
            fullscreenPlayerDiv.dataset.customControls = 'true';
            const timecodeWrapper = fullscreenPlayerDiv.querySelector(PLAYER_CONTROLS.timecodeWrapper);
            const playerControls = timecodeWrapper?.parentElement;

            playerControls?.appendChild(this.createControlsDiv());
        } else {
            fullscreenPlayerDiv.dataset.customControls = 'false';
            if (customControls) {
                customControls.remove();
            }
        }
    }
}
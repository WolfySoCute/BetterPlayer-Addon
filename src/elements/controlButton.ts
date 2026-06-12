import {CONTROLS_ICONS, ControlsIconsType, PLAYER_CONTROLS} from '@/player/constants';
import {logger} from '@/logger';

export enum ButtonSize {
    SMALL = 0,
    MEDIUM = 1,
    LARGE = 2
}

export abstract class ControlButton {
    protected  _button: HTMLButtonElement;
    protected originalControlButton: HTMLButtonElement | null = null;
    protected observedAttributes: string[] = ['disabled', 'aria-pressed'];

    private domObserver: MutationObserver | null = null;
    private attributesObserver: MutationObserver | null = null;

    protected constructor(
        protected id: string,
        protected selector: string,
        public size: ButtonSize,
        public icon: ControlsIconsType,
        public haveBorder: boolean = false
    ) {
        logger.debug('Создаем кнопку', this.id);
        this._button = this.createButton();
        this.bindEvents();
        this.initObservers();
        logger.debug(`Кнопка ${this.id} создана`);
    }

    private createButton() {
        const button = document.createElement('button');
        button.id = this.id;
        button.classList.add('customButton');
        if (this.haveBorder) button.classList.add('bordered');

        switch (this.size) {
            case ButtonSize.SMALL:
                button.classList.add('small');
                break;

            case ButtonSize.MEDIUM:
                button.classList.add('medium');
                break;

            case ButtonSize.LARGE:
                button.classList.add('large');
                break;
        }

        button.innerHTML =
            '<span class="JjlbHZ4FaP9EAcR_1DxF">' +
            '<svg focusable="false">' +
            `<use xlink:href="/icons/sprite.svg#${this.icon}"></use>` +
            '</svg>' +
            '</span>';

        return button;
    }

    public setIcon(icon: ControlsIconsType) {
        this.icon = icon;
        const useElement = this._button.querySelector('use');
        if (useElement) {
            useElement.setAttribute('xlink:href', `/icons/sprite.svg#${this.icon}`);
        }
    }

    protected onClick(): void {}
    protected onSyncState(): void {}

    private bindEvents() {
        this._button.addEventListener('click', () => {
            if (this.disabled) return;
            logger.debug(`Кнопка ${this.id} нажата`);

            if (this.originalControlButton) {
                this.originalControlButton.click();
            }
            this.onClick();
        });

    }

    private initObservers() {
        logger.debug(`Инициализация обсерверов кнопки ${this.id}...`);
        this.attributesObserver = new MutationObserver(() => this.syncOriginalState());

        this.domObserver = new MutationObserver(() => this.findOriginalButton());

        this.domObserver.observe(document.querySelector(PLAYER_CONTROLS.posterControls)!, {
            childList: true,
            subtree: true
        });

        this.findOriginalButton();
    }

    private findOriginalButton() {
        logger.debug(`Поиск оригинальной кнопки ${this.id}...`, this.selector);
        const playerContainer = document.querySelector(PLAYER_CONTROLS.posterContent);

        let foundBtn: HTMLButtonElement | null = null;

        if (playerContainer) {
            foundBtn = playerContainer.querySelector<HTMLButtonElement>(this.selector);
            logger.debug(`Оригинальная кнопка ${this.id} найдена!`, foundBtn);
        }

        if (foundBtn !== this.originalControlButton) {
            this.originalControlButton = foundBtn;
            this.attributesObserver?.disconnect();

            if (this.originalControlButton) {
                this.attributesObserver?.observe(this.originalControlButton, {
                    attributes: true,
                    attributeFilter: this.observedAttributes
                });
            }
        }

        this.syncOriginalState();
    }

    private syncOriginalState() {
        logger.debug('Синхронизация состояния кнопки', this.id);

        if (!this.originalControlButton) {
            this.disabled = true;
        } else {
            this.disabled = this.originalControlButton.disabled;

            this.onSyncState();
        }
    }

    get disabled() { return this._button.disabled; }

    set disabled(disabled: boolean) { this._button.disabled = disabled; }

    public get element(): HTMLButtonElement { return this._button; }
}

export class LikeButton extends ControlButton {
    private isLiked: boolean = false;

    constructor(size: ButtonSize) {
        super('like_button', PLAYER_CONTROLS.likeButton, size, CONTROLS_ICONS.like);
    }

    protected override onSyncState(): void {
        if (this.originalControlButton) {
            const ariaPressed = this.originalControlButton.getAttribute('aria-pressed');
            const isCurrentlyLiked = ariaPressed === 'true';

            if (this.isLiked !== isCurrentlyLiked) {
                this.isLiked = isCurrentlyLiked;
                this.setIcon(this.isLiked ? CONTROLS_ICONS.liked : CONTROLS_ICONS.like);
            }
        }
    }
}

export class LyricsButton extends ControlButton {
    constructor(size: ButtonSize) {
        super('lyrics_button', PLAYER_CONTROLS.syncLyricsButton, size, CONTROLS_ICONS.lyrics);
    }

    protected override onSyncState(): void {
        if (!this.originalControlButton) return;

        const ariaPressed = this.originalControlButton.getAttribute('aria-pressed');
        const isCurrentlyActive = ariaPressed === 'true';

        if (!isCurrentlyActive) {
            this._button.classList.add('notActive');
        } else {
            this._button.classList.remove('notActive');
        }
    }
}

export class RepeatButton extends ControlButton {
    protected override observedAttributes = ['disabled', 'data-test-id'];

    constructor(size: ButtonSize) {
        super('repeat_button', PLAYER_CONTROLS.repeatButton, size, CONTROLS_ICONS.repeat);
    }

    protected override onSyncState(): void {
        if (!this.originalControlButton) return;

        const testId = this.originalControlButton.getAttribute('data-test-id');

        switch (testId) {
            case 'REPEAT_BUTTON_NO_REPEAT':
                this.setIcon(CONTROLS_ICONS.repeat);
                this._button.classList.add('notActive');
                break;

            case 'REPEAT_BUTTON_REPEAT_CONTEXT':
                this.setIcon(CONTROLS_ICONS.repeat);
                this._button.classList.remove('notActive');
                break;

            case 'REPEAT_BUTTON_REPEAT_ONE':
                this.setIcon(CONTROLS_ICONS.repeatOne);
                this._button.classList.remove('notActive');
                break;
        }
    }
}

export class PlayButton extends ControlButton {
    protected override observedAttributes = ['disabled', 'data-test-id'];

    constructor(size: ButtonSize) {
        super('play_button', PLAYER_CONTROLS.playButton, size, CONTROLS_ICONS.play, true);
    }

    protected override onSyncState(): void {
        if (!this.originalControlButton) return;

        const testId = this.originalControlButton.getAttribute('data-test-id');

        switch (testId) {
            case 'PLAY_BUTTON':
                this.setIcon(CONTROLS_ICONS.play);
                break;

            case 'PAUSE_BUTTON':
                this.setIcon(CONTROLS_ICONS.pause);
                break;
        }
    }
}

export class NextButton extends ControlButton {
    constructor(size: ButtonSize) {
        super('next_button', PLAYER_CONTROLS.nextTrackButton, size, CONTROLS_ICONS.next);
    }
}

export class PrevButton extends ControlButton {
    constructor(size: ButtonSize) {
        super('prev_button', PLAYER_CONTROLS.previousTrackButton, size, CONTROLS_ICONS.previous);
    }
}

export class ShuffleButton extends ControlButton {
    protected override observedAttributes = ['disabled', 'data-test-id'];

    constructor(size: ButtonSize) {
        super('shuffle_button', PLAYER_CONTROLS.shuffleButton, size, CONTROLS_ICONS.shuffle);
    }

    protected override onSyncState(): void {
        if (!this.originalControlButton) return;

        const testId = this.originalControlButton.getAttribute('data-test-id');

        switch (testId) {
            case 'SHUFFLE_BUTTON':
                this._button.classList.add('notActive');
                break;

            case 'SHUFFLE_BUTTON_ON':
                this._button.classList.remove('notActive');
                break;
        }
    }
}

export class ContextMenuButton extends ControlButton {
    constructor(size: ButtonSize) {
        super('context_menu_button', PLAYER_CONTROLS.contextMenuButton, size, CONTROLS_ICONS.context);
    }
}

export class QueueButton extends ControlButton {
    constructor(size: ButtonSize) {
        super('context_menu_button', PLAYER_CONTROLS.queueButton, size, CONTROLS_ICONS.queue);
    }

    protected override onSyncState(): void {
        if (!this.originalControlButton) return;

        const ariaPressed = this.originalControlButton.getAttribute('aria-pressed');
        const isCurrentlyActive = ariaPressed === 'true';

        if (!isCurrentlyActive) {
            this._button.classList.add('notActive');
        } else {
            this._button.classList.remove('notActive');
        }
    }
}
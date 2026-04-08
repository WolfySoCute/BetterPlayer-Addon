import addonConfig from '../../addon.config.mjs'
import {FULLSCREEN_PLAYER} from '@/player/constants';
import {Background} from '@/player/background';


interface AddonSettings {
    backgroundCover: { value: boolean, default: boolean };
    backgroundImage: { value: string, default: string };
    backgroundBrightness: { value: number, default: number };
    backgroundBrightnessCorrection: { value: boolean, default: boolean };
}

export function mountPlayer(): void {
    if (!window.__WOLFYLIBRARY_LOADED__ || window.Addon == undefined) {
        setTimeout(mountPlayer, 100);
        return;
    }

    const addon = new window.Addon<AddonSettings>(addonConfig.name);
    const background = new Background(FULLSCREEN_PLAYER);

    addon.addAction('backgroundImage', (ctx) => {
        const backgroundCover = ctx.settings.get('backgroundCover');

        if (!backgroundCover.value) background.setImage(ctx.setting.value);
    });

    addon.addAction('backgroundBrightness', (ctx) => {
        background.setBrightness(ctx.setting.value);
    });

    addon.addAction('backgroundBrightnessCorrection', (ctx) => {
        background.setBrightnessCorrection(ctx.setting.value);
    });

    addon.player.on('openPlayer', (ctx) => {
        const backgroundCover = ctx.settings.get('backgroundCover');
        const backgroundImage = ctx.settings.get('backgroundImage');
        const backgroundBrightness = ctx.settings.get('backgroundBrightness');

        const image = backgroundCover.value ?
            'https://' + ctx.state.track.coverUri.replace('%%', '1000x1000') :
            backgroundImage.value;

        background.setImage(image);
        background.setBrightness(backgroundBrightness.value);
    });

    addon.player.on('trackChange', (ctx) => {
        const backgroundCover = ctx.settings.get('backgroundCover');
        const image = 'https://' + ctx.state.track.coverUri.replace('%%', '1000x1000');

        if (backgroundCover.value) background.setImage(image);
    });


    addon.start();
}
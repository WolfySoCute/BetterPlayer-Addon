import addonConfig from '../../addon.config.mjs'
import {AddonSettings} from '@/player/constants';
import {Background} from '@/player/background';
import {Controls} from '@/player/controls';

export function mountPlayer(): void {
    if (!window.__WOLFYLIBRARY_LOADED__ || window.Addon == undefined) {
        setTimeout(mountPlayer, 100);
        return;
    }

    const addon = new window.Addon<AddonSettings>(addonConfig.name);
    const background = new Background();
    const controls = new Controls();

    addon.addAction('controlsEnabled', (ctx) => {
        controls.setCustomControls(ctx.setting.value);
    });

    addon.addAction('controlsHideCover', (ctx) => {
        controls.hideCover(ctx.setting.value);
    });

    addon.addAction('controlsContentBackgroundStyle', (ctx) => {
        controls.setContentBackground(ctx.setting.value);
    });

    addon.addAction('backgroundImage', (ctx) => {
        const backgroundCover = ctx.settings.get('backgroundCover');

        if (!backgroundCover.value) background.setImage(ctx.setting.value);
    });

    addon.addAction('backgroundCover', (ctx) => {
        const backgroundImage = ctx.settings.get('backgroundImage');

        const image = ctx.setting.value ?
            'https://' + ctx.state.track.coverUri.replace('%%', '1000x1000') :
            backgroundImage.value;

        background.setImage(image);
    });

    addon.addAction('backgroundBrightness', (ctx) => {
        background.setBrightness(ctx.setting.value);
    });

    addon.addAction('backgroundBrightnessCorrection', (ctx) => {
        background.setBrightnessCorrection(ctx.setting.value);
    });

    addon.addAction('backgroundBlur', (ctx) => {
        background.setBlur(ctx.setting.value);
    });

    addon.player.on('openPlayer', (ctx) => {
        const backgroundCover = ctx.settings.get('backgroundCover');
        const backgroundImage = ctx.settings.get('backgroundImage');
        const backgroundBrightness = ctx.settings.get('backgroundBrightness');
        const backgroundBlur = ctx.settings.get('backgroundBlur');
        const controlsHideCover = ctx.settings.get('controlsHideCover');
        const controlsEnabled = ctx.settings.get('controlsEnabled');
        const controlsContentBackgroundStyle = ctx.settings.get('controlsContentBackgroundStyle');

        const image = backgroundCover.value ?
            'https://' + ctx.state.track.coverUri.replace('%%', '1000x1000') :
            backgroundImage.value;

        background.setImage(image);
        controls.hideCover(controlsHideCover.value);
        background.setBrightness(backgroundBrightness.value);
        background.setBlur(backgroundBlur.value);
        controls.setCustomControls(controlsEnabled.value);
        controls.setContentBackground(controlsContentBackgroundStyle.value);
    });

    addon.player.on('trackChange', (ctx) => {
        const backgroundCover = ctx.settings.get('backgroundCover');
        const image = 'https://' + ctx.state.track.coverUri.replace('%%', '1000x1000');

        if (backgroundCover.value) background.setImage(image);
    });


    addon.start();
}
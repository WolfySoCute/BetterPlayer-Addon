import addonConfig from '../../addon.config.mjs'
import {AddonSettings} from '@/player/constants';
import {Background} from '@/player/background';
import {Controls} from '@/player/controls';
import {logger} from '@/logger';

export function mountPlayer(): void {
    if (!window.__WOLFYLIBRARY_LOADED__ || window.Addon == undefined) {
        logger.info('WolfyLibrary ещё не инициализирован! Повторная попытка инициализации аддона...');
        setTimeout(mountPlayer, 100);
        return;
    }

    logger.info('WolfyLibrary инициализирован. Инициализация аддона продолжается...');

    const addon = new window.Addon<AddonSettings>(addonConfig.name);
    const background = new Background();
    const controls = new Controls();

    addon.addAction('controlsEnabled', (ctx) => {
        controls.setCustomControls(ctx.setting.value);
        if (!ctx.changed) return;

        logger.debug('controlsEnabled изменил значение:', ctx.setting.value);
    });

    addon.addAction('controlsContentBackgroundStyle', (ctx) => {
        controls.setContentBackground(ctx.setting.value);
        if (!ctx.changed) return;

        logger.debug('controlsContentBackgroundStyle изменил значение:', ctx.setting.value);
    });

    addon.addAction('backgroundImage', (ctx) => {
        const backgroundCover = ctx.settings.get('backgroundCover');
        if (!ctx.changed) return;

        if (!backgroundCover.value) background.setImage(ctx.setting.value);
        logger.debug('backgroundImage изменил значение:', ctx.setting.value);
    });

    addon.addAction('backgroundCover', (ctx) => {
        const backgroundImage = ctx.settings.get('backgroundImage');
        if (!ctx.changed) return;

        const image = ctx.setting.value ?
            'https://' + ctx.state.track.coverUri.replace('%%', '1000x1000') :
            backgroundImage.value;

        background.setImage(image);
        logger.debug('backgroundCover изменил значение:', ctx.setting.value);
    });

    addon.addAction('backgroundBrightness', (ctx) => {
        background.setBrightness(ctx.setting.value);
        if (!ctx.changed) return;

        logger.debug('backgroundBrightness изменил значение:', ctx.setting.value);
    });

    addon.addAction('backgroundBrightnessCorrection', (ctx) => {
        background.setBrightnessCorrection(ctx.setting.value);
        if (!ctx.changed) return;

        logger.debug('backgroundBrightnessCorrection изменил значение:', ctx.setting.value);
    });

    addon.addAction('backgroundBlur', (ctx) => {
        background.setBlur(ctx.setting.value);
        if (!ctx.changed) return;

        logger.debug('backgroundBlur изменил значение:', ctx.setting.value);
    });

    addon.addAction('debugMode', (ctx) => {
        logger.setDebug(ctx.setting.value);
        if (!ctx.changed) return;

        logger.debug('debugMode изменил значение:', ctx.setting.value);
    });

    addon.player.on('openPlayer', (ctx) => {
        logger.debug('Плеер открыт. Применяем изменения');

        const backgroundCover = ctx.settings.get('backgroundCover');
        const backgroundImage = ctx.settings.get('backgroundImage');
        const backgroundBrightness = ctx.settings.get('backgroundBrightness');
        const backgroundBlur = ctx.settings.get('backgroundBlur');
        const controlsEnabled = ctx.settings.get('controlsEnabled');
        const controlsContentBackgroundStyle = ctx.settings.get('controlsContentBackgroundStyle');

        const image = backgroundCover.value ?
            'https://' + ctx.state.track.coverUri.replace('%%', '1000x1000') :
            backgroundImage.value;

        background.setImage(image);
        background.setBrightness(backgroundBrightness.value);
        background.setBlur(backgroundBlur.value);
        controls.setCustomControls(controlsEnabled.value);
        controls.setContentBackground(controlsContentBackgroundStyle.value);
    });

    addon.player.on('trackChange', (ctx) => {
        logger.debug('Трек изменен. Обновляем некоторые элементы');

        const backgroundCover = ctx.settings.get('backgroundCover');
        const image = 'https://' + ctx.state.track.coverUri.replace('%%', '1000x1000');

        if (backgroundCover.value) background.setImage(image);
    });


    addon.start();
}
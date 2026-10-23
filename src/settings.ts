import { defineAddonSettings, SettingType, type SettingsSchema } from '@pulsesync/addon-sdk'

const controlsSettings = {
    controlsEnabled: {
        type: SettingType.BOOLEAN,
        name: 'Новый вид управления плеером',
        description: 'Включить измененный вид панели управления плеером',
        default: true,
    },
    controlsContentBackgroundStyle: {
        type: SettingType.SELECT,
        name: 'Стиль фона элементов управления плеером',
        default: 2,
        options: [
            { value: 1, label: 'Отсутствует' },
            { value: 2, label: 'Темный с размытием' },
            { value: 3, label: 'Инвертированный' },
        ],
    },
} satisfies SettingsSchema

const backgroundSettings = {
    backgroundCover: {
        type: SettingType.BOOLEAN,
        name: 'Обложка на фон',
        description: 'Заменить фон плеера на обложку трека',
        default: true,
    },
    backgroundImage: {
        type: SettingType.STRING,
        name: 'Своё фоновое изображение',
        description: 'Установить своё изображение для полноэкранного плеера',
        default: '',
    },
    backgroundBrightness: {
        type: SettingType.NUMBER,
        name: 'Яркость (%)',
        description: 'Яркость фона полноэкранного плеера',
        min: 0,
        max: 100,
        step: 1,
        default: 100,
    },
    backgroundBrightnessCorrection: {
        type: SettingType.BOOLEAN,
        name: 'Нормализация яркости',
        description: 'Автоматическое затемнение яркости фона плеера',
        default: true,
    },
    backgroundBlur: {
        type: SettingType.NUMBER,
        name: 'Блюр (px)',
        description: 'Блюр фона полноэкранного плеера',
        min: 0,
        max: 30,
        step: 1,
        default: 8,
    },
} satisfies SettingsSchema

const debugSettings = {
    debugMode: {
        type: SettingType.BOOLEAN,
        name: 'Debug режим',
        description: 'Включает debug логирование в консоли',
        default: false,
    },
} satisfies SettingsSchema

export const settings = defineAddonSettings({ ...controlsSettings, ...backgroundSettings, ...debugSettings })

export function settingsConfig() {
    const items = settings.toConfig().sections.flatMap(section => section.items)
    return {
        sections: [
            { title: 'Управление', schema: controlsSettings },
            { title: 'Фон', schema: backgroundSettings },
            { title: 'Дополнительное', schema: debugSettings },
        ].map(({ title, schema }) => ({ title, items: items.filter(item => Object.hasOwn(schema, String(item.id))) })),
    }
}

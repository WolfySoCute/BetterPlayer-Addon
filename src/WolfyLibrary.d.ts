export interface PlayerProgress {
    duration: number;
    loaded: number;
    position: number;
    remainingBufferedTime: number;
}

export interface TrackFade {
    inStart: number;
    inStop: number;
    outStart: number;
    outStop: number;
}

export interface TrackDerivedColors {
    accent: string;
    average: string;
    miniPlayer: string;
    waveText: string;
}

export interface TrackLyricsInfo {
    hasAvailableSyncLyrics: boolean;
    hasAvailableTextLyrics: boolean;
}

export interface TrackMajor {
    id: number;
    name: string;
}

export interface TrackR128 {
    i: number;
    tp: number;
}

export interface TrackInfo {
    albums: any[];
    artists: any[];
    available: boolean;
    availableForOptions: any[];
    availableForPremiumUsers: boolean;
    availableFullWithoutPermission: boolean;
    coverUri: string;
    derivedColors: TrackDerivedColors;
    disclaimers: any[];
    durationMs: number;
    fade: TrackFade;
    fileSize: number;
    id: string;
    lyricsAvailable: boolean;
    lyricsInfo: TrackLyricsInfo;
    major: TrackMajor;
    ogImage: string;
    previewDurationMs: number;
    r128: TrackR128;
    realId: string;
    rememberPosition: boolean;
    specialAudioResources: any[];
    storageDir: string;
    title: string;
    trackSharingFlag: string;
    trackSource: string;
    type: string;
    version: string;
}

export interface PlayerState {
    speed: number;
    status: 'paused' | 'playing' | string;
    page: string;
    volume: number;
    progress: PlayerProgress;
    shuffle: boolean;
    repeat: string;
    track: TrackInfo;
}

export interface EventContext<TSettings extends Record<string, any> = Record<string, any>> {
    settings: SettingsManager<TSettings>;
    styles: StylesManager;
    state: PlayerState;
}

export interface ActionContext<
    TSettings extends Record<string, any> = Record<string, any>,
    TSettingValue = any
> {
    setting: TSettingValue;
    changed: boolean;
    styles: StylesManager;
    settings: SettingsManager<TSettings>;
    state: PlayerState;
}

export type ActionCallback<
    TSettings extends Record<string, any> = Record<string, any>,
    TSettingValue = any
> = (context: ActionContext<TSettings, TSettingValue>) => void;


export type PlayerEventMap<TSettings extends Record<string, any>> = {
    play: EventContext<TSettings>;
    pause: EventContext<TSettings>;
    trackChange: EventContext<TSettings>;
    seek: EventContext<TSettings>;
    progressChange: EventContext<TSettings>;
    volumeChange: EventContext<TSettings>;
    shuffleChange: EventContext<TSettings>;
    repeatChange: EventContext<TSettings>;
    pageChange: EventContext<TSettings>;
    openPlayer: EventContext<TSettings>;
    closePlayer: EventContext<TSettings>;
    openText: EventContext<TSettings>;
    closeText: EventContext<TSettings>;
    openQueue: EventContext<TSettings>;
    closeQueue: EventContext<TSettings>;
}

export type SettingsEventMap<TSettings extends Record<string, any>> = {
    update: EventContext<TSettings>;
} & {
    [K in keyof TSettings as `change:${string & K}`]: EventContext<TSettings>;
}


export class StylesManager {
    constructor(addonName: string);
    get result(): string;
    apply(): void;
    add(id: string, styles: string): void;
    remove(id: string): boolean;
    clear(): void;
}

export class EventEmitter<TEventMap extends Record<string, any> = Record<string, any>> {
    constructor();

    // Строгая типизация для известных событий
    on<K extends keyof TEventMap>(eventName: K, callback: (data: TEventMap[K]) => void): void;
    // Фолбек для любых других строк
    on(eventName: string, callback: (data?: any) => void): void;

    off<K extends keyof TEventMap>(eventName: K, callback: (data: TEventMap[K]) => void): void;
    off(eventName: string, callback: (data?: any) => void): void;

    emit<K extends keyof TEventMap>(eventName: K, data: TEventMap[K]): void;
    emit(eventName: string, data?: any): void;

    once<K extends keyof TEventMap>(eventName: K, callback: (data: TEventMap[K]) => void): void;
    once(eventName: string, callback: (data?: any) => void): void;

    removeAllListeners(eventName: string | keyof TEventMap): void;
}

export class SettingsManager<
    TSettings extends Record<string, any> = Record<string, any>
> extends EventEmitter<SettingsEventMap<TSettings>> {
    settings: TSettings;
    oldSettings: TSettings;

    constructor(addon: Addon<TSettings>);
    start(): void;
    update(): Promise<TSettings | null>;
    get<K extends keyof TSettings>(id: K): TSettings[K];
    get(id: string): any;
    hasChanged(id: string | keyof TSettings): boolean;
}

export class AssetsManager {
    constructor(addonName: string);
    getContent<T = any>(fileName: string): Promise<T>;
    getFileLink(fileName: string): string;
    get files(): Promise<string[]>;
}

export class PlayerEvents<
    TSettings extends Record<string, any> = Record<string, any>
> extends EventEmitter<PlayerEventMap<TSettings>> {
    settingsManager: SettingsManager<TSettings>;
    stylesManager: StylesManager;
    state: PlayerState;

    constructor(addon: Addon<TSettings>);
}

export class Addon<TSettings extends Record<string, any> = Record<string, any>> {
    name: string;
    actions: Record<string, ActionCallback<TSettings>>;
    stylesManager: StylesManager;
    assetsManager: AssetsManager;
    settingsManager: SettingsManager<TSettings>;
    player: PlayerEvents<TSettings>;

    constructor(addonName: string);
    applyTheme(): void;
    addAction<K extends keyof TSettings>(id: K, callback: ActionCallback<TSettings, TSettings[K]>): void;
    addAction(id: string, callback: ActionCallback<TSettings>): void;
    update(): Promise<void>;
    start(): void;
}

declare global {
    interface Window {
        __WOLFYLIBRARY_LOADED__?: boolean;
        __WOLFYLIBRARY_PLAYER_EVENTS_BRIDGE__?: any;
        __WOLFYLIBRARY_PLAYER_EVENTS_BRIDGE_STARTED__?: boolean;

        WolfyLibrary: {
            StylesManager: typeof StylesManager;
            EventEmitter: typeof EventEmitter;
            SettingsManager: typeof SettingsManager;
            AssetsManager: typeof AssetsManager;
            PlayerEvents: typeof PlayerEvents;
            Addon: typeof Addon;
        };

        Addon?: typeof Addon;

        sonataState?: {
            playerState: any;
            queueState: any;
            [key: string]: any;
        };
    }
}
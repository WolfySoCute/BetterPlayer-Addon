export interface AddonSettings {
    controlsEnabled: { value: boolean, default: boolean };
    controlsContentBackgroundStyle: { value: number, default: number };

    backgroundCover: { value: boolean, default: boolean };
    backgroundImage: { value: string, default: string };
    backgroundBrightness: { value: number, default: number };
    backgroundBrightnessCorrection: { value: boolean, default: boolean };
    backgroundBlur: { value: number, default: number };
}

export const FULLSCREEN_PLAYER = 'div[data-test-id="FULLSCREEN_PLAYER_MODAL"]';

export const PLAYER_CONTROLS = {
    posterContent: 'div[data-test-id="FULLSCREEN_PLAYER_POSTER_CONTENT"]',
    posterControls: 'div[data-test-id="FULLSCREEN_PLAYER_POSTER_CONTENT"] div',

    likeButton: 'button[data-test-id="LIKE_BUTTON"]',
    queueButton: 'button[data-test-id="FULLSCREEN_PLAYER_QUEUE_BUTTON"]',
    playButton: 'button[data-test-id="PLAY_BUTTON"], '+
        'button[data-test-id="PAUSE_BUTTON"]',
    previousTrackButton: 'button[data-test-id="PREVIOUS_TRACK_BUTTON"]',
    nextTrackButton: 'button[data-test-id="NEXT_TRACK_BUTTON"]',
    contextMenuButton: 'button[data-test-id="FULLSCREEN_PLAYER_CONTEXT_MENU_BUTTON"]',
    syncLyricsButton: 'button[data-test-id="PLAYERBAR_DESKTOP_SYNC_LYRICS_BUTTON"]',

    repeatButton: 'button[data-test-id="REPEAT_BUTTON_NO_REPEAT"], ' +
        'button[data-test-id="REPEAT_BUTTON_REPEAT_CONTEXT"], ' +
        'button[data-test-id="REPEAT_BUTTON_REPEAT_ONE"]',

    shuffleButton: 'button[data-test-id="SHUFFLE_BUTTON"], ' +
        'button[data-test-id="SHUFFLE_BUTTON_ON"]',

    trackTitle: 'a[data-test-id="TRACK_TITLE"]',
    explicitMark: 'svg[data-test-id="EXPLICIT_MARK_ICON"]',
    artistTitle: 'a[data-test-id="SEPARATED_ARTIST_TITLE"]',

    timecodeWrapper: 'div[data-test-id="TIMECODE_WRAPPER"]',
    timecodeSlider: 'input[data-test-id="TIMECODE_SLIDER"]',
    timecodeTimeStart: 'span[data-test-id="TIMECODE_TIME_START"]',
    timecodeTimeEnd: 'span[data-test-id="TIMECODE_TIME_END"]'
} as const;

export const CONTROLS_ICONS = {
    play: 'play_m',
    pause: 'pause_m',
    next: 'next_xxs',
    previous: 'previous_xxs',
    repeat: 'repeat_xxs',
    repeatOne: 'repeat_one_xxs',
    lyrics: 'syncLyrics_m',
    shuffle: 'shuffle_xxs',
    like: 'like_m',
    liked: 'liked_m',
    context: 'more_m',
    queue: 'playQueue_m'
} as const;
export type ControlsIconsType = typeof CONTROLS_ICONS[keyof typeof CONTROLS_ICONS];
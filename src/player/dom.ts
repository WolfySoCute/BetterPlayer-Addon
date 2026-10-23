export const FULLSCREEN_PLAYER = '[data-test-id="FULLSCREEN_PLAYER_MODAL"]'

export function getControlsTarget(): HTMLElement | null {
    return document.querySelector(FULLSCREEN_PLAYER)?.querySelector('[data-test-id="TIMECODE_WRAPPER"]')?.parentElement ?? null
}

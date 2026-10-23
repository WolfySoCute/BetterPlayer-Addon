import { useEffect, useState, type RefObject } from 'react'

import { FULLSCREEN_PLAYER } from './dom'
import { anchorContextMenu } from './contextMenu'

// These native panels have no open/close methods in the WebHost API.
const panelSelectors = {
    queue: '[data-test-id="FULLSCREEN_PLAYER_QUEUE_BUTTON"]',
    lyrics: '[data-test-id="PLAYERBAR_DESKTOP_SYNC_LYRICS_BUTTON"]',
    context: '[data-test-id="FULLSCREEN_PLAYER_CONTEXT_MENU_BUTTON"]',
} as const

const stateSelectors = {
    ...panelSelectors,
    play: ':is([data-test-id="PLAY_BUTTON"], [data-test-id="PAUSE_BUTTON"])',
    shuffle: ':is([data-test-id="SHUFFLE_BUTTON"], [data-test-id="SHUFFLE_BUTTON_ON"])',
    repeat: ':is([data-test-id="REPEAT_BUTTON_NO_REPEAT"], [data-test-id="REPEAT_BUTTON_REPEAT_CONTEXT"], [data-test-id="REPEAT_BUTTON_REPEAT_ONE"])',

    like: '[data-test-id="LIKE_BUTTON"]',
    previous: '[data-test-id="PREVIOUS_TRACK_BUTTON"]',
    next: '[data-test-id="NEXT_TRACK_BUTTON"]',
} as const

type NativeControl = { disabled: boolean; pressed: boolean | null }
type NativeState = Partial<Record<keyof typeof stateSelectors, NativeControl>>

function findButton(root: Element, selector: string): HTMLButtonElement | null {
    return root.querySelector(`[data-test-id="FULLSCREEN_PLAYER_POSTER_CONTENT"] button${selector}`) ?? root.querySelector(`button${selector}`)
}

export function useNativeControlState(ref: RefObject<HTMLElement | null>): NativeState {
    const [state, setState] = useState<NativeState>({})
    useEffect(() => {
        const root = ref.current?.closest(FULLSCREEN_PLAYER)
        if (!root) return
        const update = () => {
            const next: NativeState = {}
            for (const [name, selector] of Object.entries(stateSelectors)) {
                const button = findButton(root, selector)
                if (!button) continue
                const pressed = button.getAttribute('aria-pressed')
                next[name as keyof NativeState] = { disabled: button.disabled, pressed: pressed === null ? null : pressed === 'true' }
            }
            setState(previous => (JSON.stringify(previous) === JSON.stringify(next) ? previous : next))
        }
        const observer = new MutationObserver(update)
        observer.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ['disabled', 'aria-pressed', 'data-test-id'] })
        update()
        return () => observer.disconnect()
    }, [ref])
    return state
}

export function openNativePanel(anchor: HTMLElement | null, panel: keyof typeof panelSelectors): void {
    const root = anchor?.closest(FULLSCREEN_PLAYER)
    const button = root ? findButton(root, panelSelectors[panel]) : null
    if (button && !button.disabled) button.click()
}

export function openNativeContextMenu(anchor: HTMLButtonElement): () => void {
    const root = anchor.closest(FULLSCREEN_PLAYER)
    const button = root ? findButton(root, panelSelectors.context) : null
    if (!button || button.disabled) return () => {}
    return anchorContextMenu(anchor, () => button.click())
}

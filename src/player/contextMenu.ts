const MENU_SELECTOR = '[data-test-id="TRACK_CONTEXT_MENU"]'
const MARKER = 'data-betterplayer-anchored-menu'
const PROPERTIES = ['--betterplayer-menu-left', '--betterplayer-menu-top', '--betterplayer-menu-height']

export function menuPosition(
    anchor: Pick<DOMRect, 'left' | 'top' | 'bottom'>,
    width: number,
    height: number,
    viewportWidth: number,
    viewportHeight: number,
) {
    const padding = 8
    const gap = 8
    const above = Math.max(0, anchor.top - gap - padding)
    const below = Math.max(0, viewportHeight - anchor.bottom - gap - padding)
    const placeAbove = height <= above || above >= below
    const maxHeight = Math.max(1, placeAbove ? above : below)
    const visibleHeight = Math.min(height, maxHeight)
    return {
        left: Math.max(padding, Math.min(anchor.left, viewportWidth - width - padding)),
        top: Math.max(
            padding,
            Math.min(placeAbove ? anchor.top - gap - visibleHeight : anchor.bottom + gap, viewportHeight - visibleHeight - padding),
        ),
        maxHeight,
    }
}

/** Anchors only the native menu opened by this action; submenus keep native placement. */
export function anchorContextMenu(anchor: HTMLButtonElement, open: () => void): () => void {
    const doc = anchor.ownerDocument
    const existing = new Set(doc.querySelectorAll(MENU_SELECTOR))
    let menu: Element | null = null
    let floating: HTMLElement | null = null
    let active = true
    let frame = 0
    let timeout = 0
    const resize = new ResizeObserver(() => schedule())

    const setProperty = (name: string, value: number) => {
        const next = `${value}px`
        if (floating && floating.style.getPropertyValue(name) !== next) floating.style.setProperty(name, next)
    }
    const position = () => {
        frame = 0
        if (!active) return
        if (!anchor.isConnected || (menu && !menu.isConnected)) {
            cleanup()
            return
        }
        if (!floating || !menu) return
        const bounds = floating.getBoundingClientRect()
        const result = menuPosition(
            anchor.getBoundingClientRect(),
            bounds.width,
            Math.max(floating.scrollHeight, menu.scrollHeight, bounds.height),
            doc.documentElement.clientWidth,
            doc.documentElement.clientHeight,
        )
        setProperty(PROPERTIES[0], result.left)
        setProperty(PROPERTIES[1], result.top)
        setProperty(PROPERTIES[2], result.maxHeight)
    }
    const schedule = () => {
        if (active && !frame) frame = requestAnimationFrame(position)
    }
    const discover = () => {
        if (menu) {
            schedule()
            return
        }
        menu = Array.from(doc.querySelectorAll(MENU_SELECTOR)).find(element => !existing.has(element)) ?? null
        floating = menu?.parentElement ?? null
        if (!floating) return
        clearTimeout(timeout)
        floating.setAttribute(MARKER, '')
        resize.observe(anchor)
        resize.observe(floating)
        position()
    }
    const observer = new MutationObserver(discover)
    const cleanup = () => {
        if (!active) return
        active = false
        observer.disconnect()
        resize.disconnect()
        cancelAnimationFrame(frame)
        clearTimeout(timeout)
        window.removeEventListener('resize', schedule)
        window.removeEventListener('scroll', schedule, true)
        floating?.removeAttribute(MARKER)
        for (const name of PROPERTIES) floating?.style.removeProperty(name)
    }

    observer.observe(doc.body, { childList: true, subtree: true })
    window.addEventListener('resize', schedule)
    window.addEventListener('scroll', schedule, true)
    timeout = window.setTimeout(cleanup, 2_000)
    try {
        open()
        discover()
    } catch (error) {
        cleanup()
        throw error
    }
    return cleanup
}

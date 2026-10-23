import { usePlayer, type AddonComponentProps } from '@pulsesync/addon-sdk'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'

import { settings } from '@/settings'
import { ControlButton } from './ControlButton'
import { FULLSCREEN_PLAYER, getControlsTarget } from './dom'
import { openNativeContextMenu, openNativePanel, useNativeControlState } from './nativeControls'

export function PlayerControls(props: AddonComponentProps) {
    const { controlsEnabled } = settings.use(['controlsEnabled'])
    return controlsEnabled ? <ControlsPanel {...props} /> : null
}

function ControlsPanel({ api }: AddonComponentProps) {
    const ref = useRef<HTMLDivElement>(null)
    const contextMenuCleanup = useRef<(() => void) | undefined>(undefined)
    useLayoutEffect(() => () => contextMenuCleanup.current?.(), [])
    const snapshot = usePlayer()
    const native = useNativeControlState(ref)
    const { controlsContentBackgroundStyle } = settings.use(['controlsContentBackgroundStyle'])
    const trackId = snapshot?.track?.id
    const albumId = snapshot?.track?.albums?.[0]?.id?.toString()
    const likeRevision = useRef(0)
    const [likedTrack, setLikedTrack] = useState<{ id: string; liked: boolean } | null>(null)
    const liked = native.like?.pressed ?? (likedTrack !== null && likedTrack.id === trackId && likedTrack.liked)
    const disabled = !snapshot?.track
    const repeat = snapshot?.repeatMode ?? 'none'

    useLayoutEffect(() => {
        const root = ref.current?.closest<HTMLElement>(FULLSCREEN_PLAYER)
        const panel = getControlsTarget()
        if (!root || !panel) return
        const originalControls = root.getAttribute('data-betterplayer-controls')
        const originalPanel = panel.getAttribute('data-betterplayer-panel')
        root.setAttribute('data-betterplayer-controls', 'true')
        panel.setAttribute('data-betterplayer-panel', '')
        return () => {
            if (originalControls === null) root.removeAttribute('data-betterplayer-controls')
            else root.setAttribute('data-betterplayer-controls', originalControls)
            if (originalPanel === null) panel.removeAttribute('data-betterplayer-panel')
            else panel.setAttribute('data-betterplayer-panel', originalPanel)
        }
    }, [])

    useLayoutEffect(() => {
        const root = ref.current?.closest<HTMLElement>(FULLSCREEN_PLAYER)
        if (!root) return
        const name = '--content-background-style'
        const original = root.style.getPropertyValue(name)
        const priority = root.style.getPropertyPriority(name)
        root.style.setProperty(name, String(controlsContentBackgroundStyle))
        return () => {
            if (original) root.style.setProperty(name, original, priority)
            else root.style.removeProperty(name)
        }
    }, [controlsContentBackgroundStyle])

    useEffect(() => {
        if (!trackId) return
        const revision = ++likeRevision.current
        let active = true
        void api.client
            .isTrackLiked(trackId, albumId)
            .then(liked => {
                if (active && revision === likeRevision.current) setLikedTrack({ id: trackId, liked })
            })
            .catch(error => {
                if (active) api.logger.warn('Не удалось получить отметку «Мне нравится»', error)
            })
        return () => {
            active = false
            likeRevision.current += 1
        }
    }, [api, trackId, albumId])

    const toggleLike = async () => {
        if (!trackId) return
        const revision = ++likeRevision.current
        const current = await api.client.isTrackLiked(trackId, albumId)
        const changed = await (current ? api.client.unlikeTrack(trackId, { albumId }) : api.client.likeTrack(trackId, { albumId }))
        if (changed && revision === likeRevision.current && !api.signal.aborted) setLikedTrack({ id: trackId, liked: !current })
    }

    return (
        <div ref={ref} className="customControls" role="group" aria-label="Управление плеером BetterPlayer">
            <ControlButton
                api={api}
                label="Очередь воспроизведения"
                icon="playQueue"
                iconSize="m"
                disabled={native.queue?.disabled ?? true}
                pressed={native.queue?.pressed ?? false}
                muted={!native.queue?.pressed}
                onClick={() => openNativePanel(ref.current, 'queue')}
            />
            <ControlButton
                api={api}
                label="Меню трека"
                icon="more"
                iconSize="m"
                disabled={native.context?.disabled ?? true}
                onClick={anchor => {
                    contextMenuCleanup.current?.()
                    contextMenuCleanup.current = openNativeContextMenu(anchor)
                }}
            />
            <ControlButton
                api={api}
                label={snapshot?.shuffle ? 'Выключить перемешивание' : 'Перемешать'}
                icon="shuffle"
                disabled={disabled || native.shuffle?.disabled}
                pressed={snapshot?.shuffle ?? false}
                muted={!snapshot?.shuffle}
                onClick={() => api.client.toggleShuffle()}
            />
            <ControlButton
                api={api}
                label="Предыдущий трек"
                icon="previous"
                size="medium"
                disabled={disabled || native.previous?.disabled}
                onClick={() => api.client.previous()}
            />
            <ControlButton
                api={api}
                label={snapshot?.isPlaying ? 'Пауза' : 'Воспроизвести'}
                icon={snapshot?.isPlaying ? 'pause' : 'play'}
                iconSize="m"
                size="medium"
                bordered
                disabled={disabled || native.play?.disabled}
                onClick={() => api.client.togglePlayPause()}
            />
            <ControlButton
                api={api}
                label="Следующий трек"
                icon="next"
                size="medium"
                disabled={disabled || native.next?.disabled}
                onClick={() => api.client.next()}
            />
            <ControlButton
                api={api}
                label={repeat === 'one' ? 'Повторять один трек' : repeat === 'none' ? 'Включить повтор' : 'Повторять очередь'}
                icon={repeat === 'one' ? 'repeat_one' : 'repeat'}
                disabled={disabled || native.repeat?.disabled}
                pressed={repeat !== 'none'}
                muted={repeat === 'none'}
                onClick={() => api.client.setRepeatMode(repeat === 'none' ? 'context' : repeat === 'one' ? 'none' : 'one')}
            />
            <ControlButton
                api={api}
                label={liked ? 'Убрать отметку «Мне нравится»' : 'Мне нравится'}
                icon={liked ? 'liked' : 'like'}
                iconSize="m"
                disabled={disabled || native.like?.disabled}
                pressed={liked}
                onClick={toggleLike}
            />
            <ControlButton
                api={api}
                label="Текст песни"
                icon="syncLyrics"
                iconSize="m"
                disabled={native.lyrics?.disabled ?? true}
                pressed={native.lyrics?.pressed ?? false}
                muted={!native.lyrics?.pressed}
                onClick={() => openNativePanel(ref.current, 'lyrics')}
            />
        </div>
    )
}

import { useCurrentTrack, type AddonComponentProps, type CurrentTrack } from '@pulsesync/addon-sdk'
import { useEffect, useState, type CSSProperties } from 'react'

import { settings } from '@/settings'
import { getBrightnessCorrection, loadImage, normalizePath } from '@/utils'

function coverUrl(track: CurrentTrack | null, size: 'orig' | '1000x1000'): string {
    const uri = track?.coverUri?.trim()
    if (!uri) return ''
    const resolved = uri.replace(/%%/g, size)
    const url = resolved.includes('/get-music-content/') ? resolved.replace(/\/(?:\d+x\d+|orig)(?=\/?(?:[?#]|$))/, `/${size}`) : resolved
    return /^https?:\/\//i.test(url) ? url : `https://${url.replace(/^\/\//, '')}`
}

function imageStyle(image: string): CSSProperties {
    return { backgroundImage: image ? `url(${JSON.stringify(image)})` : 'none' }
}

export function PlayerBackground({ api }: AddonComponentProps) {
    const track = useCurrentTrack()
    const values = settings.use()
    const preferredCover = coverUrl(track, 'orig')
    const fallbackCover = coverUrl(track, '1000x1000')
    const [loadedCover, setLoadedCover] = useState('')
    const image = values.backgroundCover ? (preferredCover ? loadedCover : '') : normalizePath(values.backgroundImage)
    const [layers, setLayers] = useState({ image, previous: '' })
    const [brightness, setBrightness] = useState({ image: '', value: 1 })
    if (layers.image !== image) setLayers({ image, previous: layers.image })

    useEffect(() => {
        if (!values.backgroundCover || !preferredCover) return
        const controller = new AbortController()
        const loadCover = async () => {
            try {
                let url = preferredCover
                try {
                    await loadImage(url, controller.signal)
                } catch (error) {
                    if (controller.signal.aborted || fallbackCover === preferredCover) throw error
                    url = fallbackCover
                    await loadImage(url, controller.signal)
                }
                if (!controller.signal.aborted) setLoadedCover(url)
            } catch (error) {
                if (!controller.signal.aborted) api.logger.warn('Не удалось загрузить обложку для фона', error)
            }
        }
        void loadCover()
        return () => controller.abort()
    }, [api, preferredCover, fallbackCover, values.backgroundCover])

    useEffect(() => {
        if (!layers.previous) return
        const timer = window.setTimeout(() => {
            setLayers(current => (current.image === layers.image ? { ...current, previous: '' } : current))
        }, 550)
        return () => clearTimeout(timer)
    }, [layers.image, layers.previous])

    useEffect(() => {
        if (!image || !values.backgroundBrightnessCorrection) return
        const controller = new AbortController()
        void getBrightnessCorrection(image, 0.3, controller.signal)
            .then(value => {
                if (!controller.signal.aborted) setBrightness({ image, value })
            })
            .catch(error => {
                if (!controller.signal.aborted) api.logger.warn('Не удалось нормализовать яркость фона', error)
            })
        return () => controller.abort()
    }, [api, image, values.backgroundBrightnessCorrection])

    useEffect(() => {
        if (values.debugMode) api.logger.info('Настройки BetterPlayer', values)
    }, [api, values])

    const correction = values.backgroundBrightnessCorrection && brightness.image === image ? brightness.value : 1
    const style = {
        '--betterplayer-blur': `${values.backgroundBlur}px`,
        '--betterplayer-brightness': (values.backgroundBrightness / 100) * correction,
    } as CSSProperties

    return (
        <div className="betterplayerBackground" style={style} aria-hidden="true">
            {layers.previous ? (
                <div
                    key={`previous:${layers.image}`}
                    className="betterplayerBackgroundLayer betterplayerBackgroundPrevious"
                    style={imageStyle(layers.previous)}
                />
            ) : null}
            <div key={layers.image} className="betterplayerBackgroundLayer betterplayerBackgroundCurrent" style={imageStyle(layers.image)} />
        </div>
    )
}

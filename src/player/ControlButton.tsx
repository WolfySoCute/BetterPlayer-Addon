import { setNativeTooltip, YandexMusicIcon, type AddonApi, type YandexMusicIconName, type YandexMusicIconSize } from '@pulsesync/addon-sdk'
import { settings } from '@/settings'
import { useLayoutEffect, useRef, useState } from 'react'

type Props = {
    api: AddonApi
    label: string
    icon: YandexMusicIconName
    iconSize?: YandexMusicIconSize
    size?: 'small' | 'medium'
    bordered?: boolean
    disabled?: boolean
    pressed?: boolean
    muted?: boolean
    onClick: (anchor: HTMLButtonElement) => void | Promise<unknown>
}

export function ControlButton({
    api,
    label,
    icon,
    iconSize = 'xxs',
    size = 'small',
    bordered = false,
    disabled = false,
    pressed,
    muted = false,
    onClick,
}: Props) {
    const ref = useRef<HTMLButtonElement>(null)
    const pending = useRef(false)
    const alive = useRef(true)
    const [busy, setBusy] = useState(false)
    useLayoutEffect(() => {
        alive.current = true
        return () => {
            alive.current = false
        }
    }, [])
    useLayoutEffect(() => {
        if (ref.current) return setNativeTooltip(ref.current, { content: label })
    }, [label])

    const activate = async () => {
        if (disabled || pending.current || api.signal.aborted || !ref.current) return
        pending.current = true
        setBusy(true)
        try {
            if (settings.store.debugMode) api.logger.info(`Кнопка «${label}» нажата`)
            await onClick(ref.current)
        } catch (error) {
            if (!api.signal.aborted) api.logger.error(`Не удалось выполнить действие «${label}»`, error)
        } finally {
            pending.current = false
            if (alive.current) setBusy(false)
        }
    }

    return (
        <button
            ref={ref}
            type="button"
            className={`customButton ${size}${bordered ? ' bordered' : ''}${muted ? ' notActive' : ''}`}
            aria-label={label}
            aria-pressed={pressed}
            aria-busy={busy || undefined}
            disabled={disabled || busy}
            onClick={() => void activate()}
        >
            <span className="betterplayerButtonIcon">
                <YandexMusicIcon
                    name={icon}
                    size={iconSize}
                    style={{
                        width: size === 'medium' ? 'var(--ym-icon-size-m)' : 'var(--ym-icon-size-xs)',
                        height: size === 'medium' ? 'var(--ym-icon-size-m)' : 'var(--ym-icon-size-xs)',
                    }}
                />
            </span>
        </button>
    )
}

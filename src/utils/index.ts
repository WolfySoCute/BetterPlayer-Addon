export function normalizePath(input: string): string {
    if (!input) return ''
    const trimmed = input.trim()

    if (/^(https?|data):/i.test(trimmed)) {
        return trimmed
    }

    return trimmed.replace(/\\/g, '/')
}

export function loadImage(url: string, signal?: AbortSignal): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image()
        const cleanup = () => {
            img.onload = null
            img.onerror = null
            signal?.removeEventListener('abort', abort)
        }
        const abort = () => {
            cleanup()
            img.removeAttribute('src')
            reject(signal?.reason ?? new DOMException('Image loading aborted', 'AbortError'))
        }
        if (signal?.aborted) {
            abort()
            return
        }
        img.crossOrigin = 'Anonymous'
        img.onload = () => {
            cleanup()
            resolve(img)
        }
        img.onerror = () => {
            cleanup()
            reject(new Error(`Failed to load background image: ${url}`))
        }
        signal?.addEventListener('abort', abort, { once: true })
        img.src = url
    })
}

export async function getBrightnessCorrection(imageUrl: string | 'none', targetBrightness: number = 0.3, signal?: AbortSignal) {
    if (imageUrl === 'none') return 1

    const img = await loadImage(imageUrl, signal)

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d', { willReadFrequently: true })

    if (!ctx) return 1

    const scale = 100 / Math.max(img.width, img.height)
    const width = Math.max(1, Math.floor(img.width * scale))
    const height = Math.max(1, Math.floor(img.height * scale))

    canvas.width = width
    canvas.height = height

    ctx.drawImage(img, 0, 0, width, height)

    const imageData = ctx.getImageData(0, 0, width, height)
    const pixels = imageData.data

    const brightnessList = []

    const invWidth = 1 / width
    const invHeight = 1 / height

    let i = 0
    for (let y = 0; y < height; y++) {
        const dy = y * invHeight - 0.5
        const dy2 = dy * dy

        for (let x = 0; x < width; x++) {
            const dx = x * invWidth - 0.5
            const weight = 1 - Math.sqrt(dx * dx + dy2) * 2

            if (weight > 0) {
                const r = pixels[i]
                const g = pixels[i + 1]
                const b = pixels[i + 2]
                const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255

                brightnessList.push(brightness)
            }
            i += 4
        }
    }

    if (brightnessList.length === 0) return 1

    brightnessList.sort((a, b) => a - b)
    const percentile = brightnessList[Math.floor(brightnessList.length * 0.9)]

    if (percentile === 0) return 1

    let coefficient = targetBrightness / percentile
    return Math.min(Math.max(coefficient, 0.4), 1)
}

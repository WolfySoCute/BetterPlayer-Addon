export function normalizePath(input: string): string {
    if (!input) return '';
    const trimmed = input.trim();

    if (/^(https?|data):/i.test(trimmed)) {
        return trimmed;
    }

    return trimmed.replace(/\\/g, '/');
}

export function loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = url;
    });
}

export async function getBrightnessCorrection(imageUrl: string | 'none', targetBrightness: number = 0.3) {
    if (imageUrl === 'none') return 1;

    const img = await loadImage(imageUrl);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (!ctx) return 1;

    const scale = 100 / Math.max(img.width, img.height);
    const width = Math.floor(img.width * scale);
    const height = Math.floor(img.height * scale);

    canvas.width = width;
    canvas.height = height;

    ctx.drawImage(img, 0, 0, width, height);

    const imageData = ctx.getImageData(0, 0, width, height);
    const pixels = imageData.data;

    const brightnessList = [];

    const invWidth = 1 / width;
    const invHeight = 1 / height;

    let i = 0;
    for (let y = 0; y < height; y++) {
        const dy = y * invHeight - 0.5;
        const dy2 = dy * dy;

        for (let x = 0; x < width; x++) {
            const dx = x * invWidth - 0.5;
            const weight = 1 - Math.sqrt(dx * dx + dy2) * 2;

            if (weight > 0) {
                const r = pixels[i];
                const g = pixels[i + 1];
                const b = pixels[i + 2];
                const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

                brightnessList.push(brightness);
            }
            i += 4;
        }
    }

    if (brightnessList.length === 0) return 1;

    brightnessList.sort((a, b) => a - b);
    const percentile = brightnessList[Math.floor(brightnessList.length * 0.9)];

    if (percentile === 0) return 1;

    let coefficient = targetBrightness / percentile;
    return Math.min(Math.max(coefficient, 0.4), 1);
}
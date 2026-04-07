export function normalizePath(input: string): string {
    const trimmed = input.trim();

    if (/^(https?|data):/i.test(trimmed)) {
        return trimmed;
    }

    return trimmed.replace(/\\/g, '/');
}

export async function loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = url;
    });
}
import addonConfig from '../addon.config.mjs'

class AddonLogger {
    private isDebugEnabled: boolean = false;

    public setDebug(enabled: boolean): void {
        this.isDebugEnabled = enabled;
    }

    public getDebugStatus(): boolean {
        return this.isDebugEnabled;
    }

    private getPrefix(level: string): string {
        const name = addonConfig?.name || 'UnknownAddon';
        const version = addonConfig?.version || '0.0.0';
        return `[${name} v${version}] [${level}]`;
    }

    public info(message: string, ...args: any[]): void {
        console.log(`${this.getPrefix('INFO')} ${message}`, ...args);
    }

    public warn(message: string, ...args: any[]): void {
        console.warn(`${this.getPrefix('WARN')} ${message}`, ...args);
    }

    public error(message: string, ...args: any[]): void {
        console.error(`${this.getPrefix('ERROR')} ${message}`, ...args);
    }

    public debug(message: string, ...args: any[]): void {
        if (this.isDebugEnabled) {
            console.log(`${this.getPrefix('DEBUG')} ${message}`, ...args);
        }
    }
}

export const logger = new AddonLogger();
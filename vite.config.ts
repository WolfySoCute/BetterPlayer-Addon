import path from 'node:path'
import { promises as fs } from 'node:fs'

import { addonPlugin, defineAddonManifest } from '@pulsesync/addon-sdk/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

import addonConfig from './addon.config.mjs'
import { settings, settingsConfig } from './src/settings.ts'

export default defineConfig(({ mode }) => ({
    resolve: { alias: { '@': path.resolve(import.meta.dirname, 'src') } },
    plugins: [
        react(),
        addonPlugin({
            manifest: defineAddonManifest(addonConfig),
            settings,
            minify: mode === 'development' ? false : 'oxc',
            ...(process.env.PULSESYNC_ADDON_OUT_DIR ? { outDir: process.env.PULSESYNC_ADDON_OUT_DIR } : {}),
        }),
        {
            name: 'betterplayer-settings-sections',
            closeBundle: {
                order: 'post',
                sequential: true,
                async handler() {
                    const output = path.resolve(process.env.PULSESYNC_ADDON_OUT_DIR ?? path.join('dist', addonConfig.directoryName))
                    const file = path.join(output, 'metadata.json')
                    const metadata = JSON.parse(await fs.readFile(file, 'utf8'))
                    metadata.settings = settingsConfig()
                    await fs.writeFile(file, `${JSON.stringify(metadata, null, 4)}\n`)
                },
            },
        },
    ],
}))

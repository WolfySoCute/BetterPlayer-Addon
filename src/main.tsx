import '@/styles/additionalContent.css'
import '@/styles/background.css'
import '@/styles/customControls.css'
import '@/styles/customControlsThemes.css'

import { defineAddon } from '@pulsesync/addon-sdk'

import addonConfig from '../addon.config.mjs'
import { FULLSCREEN_PLAYER, getControlsTarget } from '@/player/dom'
import { PlayerBackground } from '@/player/PlayerBackground'
import { PlayerControls } from '@/player/PlayerControls'
import { settings } from '@/settings'

export default defineAddon({
    id: addonConfig.id,
    name: addonConfig.name,
    settings,
    mounts: [
        { target: FULLSCREEN_PLAYER, component: PlayerBackground },
        { target: getControlsTarget, component: PlayerControls },
    ],
})

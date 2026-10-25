const addonConfig = {
    id: 'betterplayer',
    directoryName: 'betterplayer',
    name: 'BetterPlayer',
    description: 'Кастомизация для стандартного полноэкранного плеера',
    version: '2.0.1',
    author: ['WolfySoCute', 'forea.adoxid'],
    cssScope: 'global',
    requirements: {
        minHostApi: 1,
        capabilities: ['lifecycle-v1', 'async-start-v1', 'net-per-addon-v1', 'typed-settings-v1'],
    },
    image: 'image.png',
    banner: 'banner.png',
    libraryLogo: '',
    tags: ['customization', 'player'],
    dependencies: [],
    allowedUrls: ['https://i.ibb.co/', 'https://i.postimg.cc/', 'https://files.catbox.moe/'],
    supportedVersions: ['>=5.123.4'],
}

export default addonConfig

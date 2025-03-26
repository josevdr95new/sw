// Configuration file for DailyDosis app

export const config = {
    // App Information
    appName: "DailyDosis",
    version: "1.0",
    developer: "josevdr95",
    year: "2025",
    
    // Content update settings
    refreshInterval: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    
    // Share settings
    shareText: "Visita DailyDosis en https://dailydosis.pages.dev/",
    
    // Developer link
    developerUrl: "www.apklis.cu/developer/josevdr95",
    
    // Content sources settings
    contentSources: {
        joke: {
            enabled: true,
            refreshable: true
        },
        horoscope: {
            enabled: true,
            refreshable: true,
            signs: []
        },
        fact: {
            enabled: true,
            refreshable: true
        },
        word: {
            enabled: true,
            refreshable: true
        },
        riddle: {
            enabled: true,
            refreshable: true
        },
        number: {
            enabled: true,
            refreshable: true,
            min: 1,
            max: 100,
            favoritable: false
        },
        letter: {
            enabled: true,
            refreshable: true,
            favoritable: false
        },
        color: {
            enabled: true,
            refreshable: true
        }
    }
};
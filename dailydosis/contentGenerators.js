// Content data generators for DailyDosis app
import { config } from 'https://josevdr95new.github.io/sw/dailydosis/data/config.js';
import { jokes } from 'https://josevdr95new.github.io/sw/dailydosis/data/data/jokes.js';
import { horoscopePredictions, signs } from 'https://josevdr95new.github.io/sw/dailydosis/data/horoscopes.js';
import { facts } from 'https://josevdr95new.github.io/sw/dailydosis/data/facts.js';
import { words } from 'https://josevdr95new.github.io/sw/dailydosis/data/words.js';
import { riddles } from 'https://josevdr95new.github.io/sw/dailydosis/data/riddles.js';
import { colors } from 'https://josevdr95new.github.io/sw/dailydosis/data/colors.js';
import { letters } from 'https://josevdr95new.github.io/sw/dailydosis/data/letters.js';

export const contentGenerators = {
    joke: () => {
        return jokes[Math.floor(Math.random() * jokes.length)];
    },
    
    horoscope: () => {
        const sign = signs[Math.floor(Math.random() * signs.length)];
        const prediction = horoscopePredictions[Math.floor(Math.random() * horoscopePredictions.length)];
        return { sign: sign, prediction: prediction };
    },
    
    fact: () => {
        return facts[Math.floor(Math.random() * facts.length)];
    },
    
    word: () => {
        return words[Math.floor(Math.random() * words.length)];
    },
    
    riddle: () => {
        return riddles[Math.floor(Math.random() * riddles.length)];
    },
    
    number: () => {
        const min = config.contentSources.number.min;
        const max = config.contentSources.number.max;
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    
    letter: () => {
        return letters[Math.floor(Math.random() * letters.length)];
    },
    
    color: () => {
        return colors[Math.floor(Math.random() * colors.length)];
    }
};
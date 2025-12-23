const BANNED_WORDS = ['바보', '멍청이', '욕설1', '욕설2']; // 예시 금지어

export const filterProfanity = (text: string): string => {
    let filteredText = text;
    BANNED_WORDS.forEach(word => {
        const regex = new RegExp(word, 'gi');
        filteredText = filteredText.replace(regex, '*'.repeat(word.length));
    });
    return filteredText;
};

export const hasProfanity = (text: string): boolean => {
    return BANNED_WORDS.some(word => text.includes(word));
};

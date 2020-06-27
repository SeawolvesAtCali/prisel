const generateUsername = (index: number) => {
    const usernameList = [
        'dog',
        'cat',
        'cow',
        'sheep',
        'rabbit',
        'duck',
        'chicken',
        'hen',
        'horse',
        'pig',
        'turkey',
        'donkey',
        'goat',
        'guinea pig',
        'llama',
    ];
    if (index < usernameList.length) {
        return usernameList[index];
    }
    return `user-${index}`;
};

export default generateUsername;

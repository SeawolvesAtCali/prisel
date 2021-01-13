export const log = {
    info(message: string, ...rest: any[]) {
        console.log(message, ...rest);
    },
    warn(message: string, ...rest: any[]) {
        console.log(`!!${message}`, ...rest);
    },
    error(message: string, ...rest: any[]) {
        console.error(message, ...rest);
    },
};

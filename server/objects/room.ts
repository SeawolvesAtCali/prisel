export type Room = {
    id: string;
    name: string;
    host: string; // client id
    guests: Array<string>; // client id
    displays: Array<any>;
};

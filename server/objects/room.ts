export interface Room {
    id: string;
    name: string;
    host: string; // client id
    guests: string[]; // client id
    displays: any[];
}

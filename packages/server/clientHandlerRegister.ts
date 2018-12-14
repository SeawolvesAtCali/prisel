import { Context, Socket } from './objects';

export type Handler = (context: Context, socket: Socket) => (data: any) => void;

const clientHandlerRegister: Array<[string, Handler]> = [];

export default clientHandlerRegister;

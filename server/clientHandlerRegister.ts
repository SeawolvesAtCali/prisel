import { Context } from './objects';

export type Handler = (context: Context, socket: SocketIO.Socket) => (data: any) => void;

const clientHandlerRegister: Array<[string, Handler]> = [];

export default clientHandlerRegister;

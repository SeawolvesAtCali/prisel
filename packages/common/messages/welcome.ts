import { createEvent } from '../typedEvent';
import MessageType from '../messageTypes';
import { Packet } from '../packet';

export const welcome = createEvent<Packet>(MessageType.WELCOME);

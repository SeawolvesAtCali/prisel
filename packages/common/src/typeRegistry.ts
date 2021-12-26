// A collection of IMessageType to enable turning proto into JSON.
// Only IMessageType that will be used in any needs to be added.

import { IMessageType } from '@protobuf-ts/runtime';

export const typeRegistry: IMessageType<any>[] = [];

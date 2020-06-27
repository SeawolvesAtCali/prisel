import { start } from './start';
import { TypedCommand } from './TypedCommand';
export * from './TypedCommand';
const preloadedCommands = new Map<string, TypedCommand>();

preloadedCommands.set('start', start);

export default preloadedCommands;

import { StateMachineState } from './StateMachineState';

export class Moving extends StateMachineState {
    public onEnter() {}
    public get [Symbol.toStringTag](): string {
        return 'Moving';
    }
}

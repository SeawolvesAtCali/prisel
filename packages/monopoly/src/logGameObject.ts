import GameObject from './GameObject';

// target is the constructor of a static member, or prototype for an instance method
export function log(target: GameObject, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    descriptor.value = function(...rest: any[]) {
        // tslint:disable-next-line:no-console
        console.log(`--${propertyKey}--`);
        // tslint:disable-next-line:no-console
        console.log(target.flat.apply(this));
        const result = originalMethod.apply(this, rest);
        // tslint:disable-next-line:no-console
        console.log(target.flat.apply(this));
        return result;
    };

    return descriptor;
}

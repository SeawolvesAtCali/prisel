import { Token } from './cancellationToken';
import { Request } from './request';
import { Response } from './response';

type ResolveFunc = (value: Response | PromiseLike<Response>) => void;

export interface RequestManager {
    newId(): string;
    addRequest(request: Request, token?: Token): Promise<Response>;
    onResponse(response: Response): void;
    isWaitingFor(requestId: string): boolean;
}

export function newRequestManager(): RequestManager {
    const requestIdMap = new Map<string, ResolveFunc>();
    let requestId = 1;
    function addRequest(request: Request, token?: Token) {
        const id = request.requestId;
        const promise = new Promise<Response>((resolve, reject) => {
            requestIdMap.set(id, resolve);
            if (token) {
                token.promise.then((reason) => {
                    console.log('token cancelled');
                    if (requestIdMap.has(id)) {
                        requestIdMap.delete(id);
                        reject(new Error(reason));
                    }
                });
            }
        });
        return promise;
    }

    function onResponse(response: Response) {
        const id = `${response.requestId}`;
        if (requestIdMap.has(id)) {
            Promise.resolve().then(() => {
                const resolve = requestIdMap.get(id);
                requestIdMap.delete(id);
                resolve?.(response);
            });
        }
    }

    return {
        addRequest,
        onResponse,
        newId() {
            requestId = requestId + 1;
            return `${requestId}`;
        },
        isWaitingFor(id: string) {
            return requestIdMap.has(id);
        },
    };
}

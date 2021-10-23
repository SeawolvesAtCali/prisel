import { Token } from './cancellationToken';
import { Request } from './request';
import { Response } from './response';

type ResolveFunc = (value: Response) => unknown;

export interface RequestManager {
    newId(): string;
    addRequest(request: Request, callback: (response: Response) => unknown): void;
    addRequest(request: Request, token?: Token): Promise<Response>;
    cancelRequest(request: Request): void;
    onResponse(response: Response): void;
    isWaitingFor(requestId: string): boolean;
}

export function newRequestManager(): RequestManager {
    const requestIdMap = new Map<string, ResolveFunc>();
    let requestId = 1;
    function addRequest(request: Request, tokenOrCallback?: Token | ResolveFunc): any {
        const id = request.requestId;
        if (!tokenOrCallback || tokenOrCallback instanceof Token) {
            return new Promise<Response>((resolve, reject) => {
                requestIdMap.set(id, resolve);
                if (tokenOrCallback) {
                    tokenOrCallback.promise.then((reason) => {
                        console.log('token cancelled');
                        if (requestIdMap.has(id)) {
                            requestIdMap.delete(id);
                            reject(new Error(reason));
                        }
                    });
                }
            });
        }
        requestIdMap.set(id, tokenOrCallback);
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

    function cancelRequest(request: Request) {
        requestIdMap.delete(request.requestId);
    }

    return {
        addRequest,
        cancelRequest,
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

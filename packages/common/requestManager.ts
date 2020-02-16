import { Request, Response } from './packet';

type ResolveFunc = (value?: Response<any> | PromiseLike<Response<any>>) => void;

export interface RequestManager {
    newId(): string;
    addRequest(request: Request, timeout: number): Promise<Response>;
    onResponse(response: Response): void;
    isWaitingFor(requestId: string): boolean;
}

export function newRequestManager(): RequestManager {
    const requestIdMap = new Map<string, ResolveFunc>();
    let requestId = 1;
    function addRequest(request: Request, timeout: number) {
        const id = request.request_id;
        const promise = new Promise<Response>((resolve, reject) => {
            requestIdMap.set(id, resolve);
            if (timeout > 0) {
                setTimeout(() => {
                    if (requestIdMap.has(id)) {
                        requestIdMap.delete(id);
                        reject(new Error('timeout'));
                    }
                }, timeout);
            }
        });
        return promise;
    }

    function onResponse(response: Response) {
        const id = response.request_id;
        if (requestIdMap.has(id)) {
            const resolve = requestIdMap.get(id);
            requestIdMap.delete(id);
            Promise.resolve().then(() => {
                resolve(response);
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

import jwt from 'jsonwebtoken';

export function getSecret() {
    return Date.now().toString();
}

export function sign(payload: object, secret: string) {
    return new Promise<string>((resolve, reject) => {
        jwt.sign(payload, secret, {}, (err, encoded) => {
            if (err) {
                reject(err);
            } else {
                resolve(encoded);
            }
        });
    });
}

export function verify(token: string, secret: string) {
    return new Promise((resolve, reject) => {
        jwt.verify(token, secret, {}, (err, decoded) => {
            if (err) {
                reject(err);
            } else {
                resolve(decoded);
            }
        });
    });
}

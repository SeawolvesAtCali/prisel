import crypto from 'crypto';

export default function genId() {
    return crypto.randomBytes(8).toString('hex');
}

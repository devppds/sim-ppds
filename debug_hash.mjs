import crypto from 'crypto';

const password = 'admin123';
const hash = crypto.createHash('sha256').update(password).digest('hex');
console.log('Password:', password);
console.log('SHA-256 Hash:', hash);

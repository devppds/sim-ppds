const crypto = require('crypto');
function hash(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}
console.log('123456 ->', hash('123456'));
console.log('admin123 ->', hash('admin123'));

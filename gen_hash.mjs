import bcrypt from 'bcryptjs';
const hash = await bcrypt.hash('Samsung123', 10);
console.log(hash);

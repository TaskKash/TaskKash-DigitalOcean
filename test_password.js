const bcrypt = require('bcryptjs');
const hash = '$2b$10$5N/6uv5iIHVxTywHWnJUVee33oy858hESbr2yknCtzG1L88HhgRuy';
const passwords = ['Samsung123!', 'samsung123', 'Samsung123', 'password', 'test123'];

async function test() {
  for (const pwd of passwords) {
    const match = await bcrypt.compare(pwd, hash);
    console.log(`Password "${pwd}": ${match ? 'MATCH' : 'no match'}`);
  }
}
test();

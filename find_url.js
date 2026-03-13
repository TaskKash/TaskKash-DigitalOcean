const fs = require('fs');

const files = fs.readdirSync('dist/public/assets').filter(f => f.startsWith('index-') && f.endsWith('.js'));
const txt = fs.readFileSync('dist/public/assets/' + files[0], 'utf8');

const matches = txt.match(/.{0,50}new URL\(.{0,50}/g);
console.log('Matches:', matches);

const idx = txt.indexOf('OAUTH_PORTAL_URL or VITE_APP_ID');
console.log('Index:', idx);
if(idx !== -1) {
    console.log(txt.substring(idx - 150, idx + 200));
}

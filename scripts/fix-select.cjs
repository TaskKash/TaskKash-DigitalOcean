const fs = require('fs');
const file = 'c:/Users/ahmed/Downloads/TK_2026/WebSite/TaskKash-DigitalOcean/client/src/pages/advertiser/MultiTaskCampaignBuilder.tsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/<SelectItem value=currency>EGP<\/SelectItem>/g, '<SelectItem value="EGP">EGP</SelectItem>');
fs.writeFileSync(file, content);

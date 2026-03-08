import fs from "fs";

function getDim(file) {
    try {
        const buffer = fs.readFileSync(file);
        if (buffer.toString("hex", 0, 8) !== "89504e470d0a1a0a") {
            console.log(file, "is not a PNG");
            return;
        }
        const width = buffer.readUInt32BE(16);
        const height = buffer.readUInt32BE(20);
        console.log(file, `${width}x${height}`);
    } catch (e) {
        console.log(file, "error reading");
    }
}

getDim("client/public/logos/taskkash.png");
getDim("client/public/logo.png");
getDim("client/public/TaskKash_Logo.png");

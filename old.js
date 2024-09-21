const fs = require('fs');

const m3uFile = fs.readFileSync('./music.m3u', {encoding: 'utf-8'});
const urls = m3uFile.match(/^https.*$/gm);


async function downloadParts() {
    let data = [];

    for (let url of urls) {
        await fetch(url)
            .then(res => res.arrayBuffer())
            .then(res => {
                data.push(Buffer.from(res));
            });
    }

    return data;
}

downloadParts().then((data) => {
    fs.writeFileSync('./mp3/music.mp3', Buffer.concat(data));
});

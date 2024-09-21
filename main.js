const fs = require('fs');

const arguments = process.argv.slice(2);
const api = 'https://api-v2.soundcloud.com/';
const clientId = 'yLfooVZK5emWPvRLZQlSuGTO8pof6z4t';

if (!arguments.length) {
    console.error('pass the share link after script name');
    process.exit();
}

async function resolveMusicData(url) {
    const response = await fetch(api + 'resolve?url=' + url + '&format=json&client_id=' + clientId);

    if (!response.ok) {
        console.error('something went wrong, please check your internet connection or the share url.');
        process.exit();
    }

    const data = await response.json();

    return {
        title: data.title,
        cover: data.artwork_url,
        duration: data.duration,
        genre: data.genre,
        artist: data.publisher_metadata.artist,
        url: data.uri,
        track: data.media.transcodings.find(item => item.format.protocol === 'progressive').url
    };
}

async function downloadTrack(url) {
    const track = await resolveMusicData(url);

    const trackUrl = await fetch(track.track + '?client_id=' + clientId)
        .then(res => res.json())
        .then(res => res.url);

    await fetch(trackUrl)
        .then(res => res.arrayBuffer())
        .then(res => {
            fs.writeFileSync(`${track.artist} - ${track.title}.mp3`, Buffer.from(res))
        });

    return `${track.artist} - ${track.title}.mp3`;
}


downloadTrack(arguments[0]).then(musicFile=>{
    console.log('your music is ready ->',musicFile);
});




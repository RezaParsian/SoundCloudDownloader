const fs = require('fs');
const axios = require('axios');

const arguments = process.argv.slice(2);
const api = 'https://api-v2.soundcloud.com/';
const clientId = 'yLfooVZK5emWPvRLZQlSuGTO8pof6z4t';

if (!arguments.length) {
  console.error('pass the share link after script name');
  process.exit();
}

async function resolveMusicData(url) {
  try {
    const response = await axios.get(api + 'resolve', {
      params: {
        url: url,
        format: 'json',
        client_id: clientId
      }
    });

    const data = response.data;

    return {
      title: data.title,
      cover: data.artwork_url,
      duration: data.duration,
      genre: data.genre,
      artist: data.publisher_metadata.artist,
      url: data.uri,
      track: data.media.transcodings.find(item => item.format.protocol === 'progressive').url
    };
  } catch (error) {
    console.error('Error fetching music data:', error);
    process.exit();
  }
}

function normalizeText(str) {
  return str.replace(/[.<>:"\/\\|?*]+/g, '')
      .replace('-', ' ')
      .replace('mp3', '')
      .trim();
}

async function downloadTrack(url) {
  try {
    const track = await resolveMusicData(url);

    const trackResponse = await axios.get(track.track, {
      params: {
        client_id: clientId
      }
    });

    const trackUrl = trackResponse.data.url;

    const trackData = await axios.get(trackUrl, {
      responseType: 'arraybuffer'
    });

    const sanitizedArtist = normalizeText(track.artist);
    const sanitizedTitle = normalizeText(track.title.replace(sanitizedArtist, ''));

    const fileName = `${sanitizedArtist} - ${sanitizedTitle}.mp3`;

    fs.writeFileSync(fileName, Buffer.from(trackData.data));

    return fileName;
  } catch (error) {
    console.error('Error downloading the track:', error);
    process.exit();
  }
}

downloadTrack(arguments[0]).then(musicFile => {
  console.log('your music is ready ->', musicFile);
});

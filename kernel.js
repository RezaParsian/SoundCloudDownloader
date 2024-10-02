const fs = require('fs');
const axios = require('axios');

const api = 'https://api-v2.soundcloud.com/';
const clientId = 'yLfooVZK5emWPvRLZQlSuGTO8pof6z4t';

async function resolveDataFromUrl(url){
  const response = await axios.get(api + 'resolve', {
    params: {
      url: url,
      format: 'json',
      client_id: clientId
    }
  });

  return response.data;
}
async function resolveMusicDataFromUrl(url) {
  let data = undefined;

  try {

    data = response.data;

    return {
      title: data.title,
      cover: data.artwork_url,
      duration: data.duration,
      genre: data.genre,
      artist: data?.publisher_metadata?.artist,
      url: data.uri,
      track: data.media.transcodings.find(item => item.format.protocol === 'progressive').url
    };
  } catch (error) {
    console.error('Error fetching music data:', error, data);
    process.exit();
  }
}

function resolveMusicDataFromJson(data) {
  try {
    return {
      title: data.title,
      cover: data.artwork_url,
      duration: data.duration,
      genre: data.genre,
      artist: data?.publisher_metadata?.artist,
      url: data.uri,
      track: data.media.transcodings.find(item => item.format.protocol === 'progressive').url
    };
  }catch (e){
    return undefined;
  }
}

function normalizeText(str) {
  return str?.replace(/[.<>:"\/\\|?*]+/g, '')
      ?.replace('-', ' ')
      ?.replace('mp3', '')
      ?.trim();
}

async function downloadTrack(url, downloadPath = undefined, method = 'url') {
  if (downloadPath)
    fs.mkdirSync(downloadPath, {recursive: true});

  try {
    let track = undefined;

    if (method === 'url')
      track = await resolveMusicDataFromUrl(url);
    else {
      track = resolveMusicDataFromJson(url);

      if (!track)
        return ;
    }

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

    let fileName = `${sanitizedArtist ? sanitizedArtist + ' - ' : ''}${sanitizedTitle}.mp3`;

    if (downloadPath)
      fileName = downloadPath + '/' + fileName;

    fs.writeFileSync(fileName, Buffer.from(trackData.data));

    return fileName;
  } catch (error) {
    console.error('Error downloading the track:', error);
    process.exit();
  }
}

function handelInputs(){
  const arguments = process.argv.slice(2);

  if (!arguments.length) {
    console.error('pass the share link after script name');
    process.exit();
  }
}

module.exports = {
  downloadTrack,
  handelInputs
};

const fs = require('fs');
const axios = require('axios');
const ffmpeg = require('fluent-ffmpeg');

const api = 'https://api-v2.soundcloud.com/';
const clientId = '57GDonO1e5SInnyt8DyMGWwbrg0AOq1H';

//todo: az in file zir mishe client_id ro estekhraj kard!
//https://a-v2.sndcdn.com/assets/0-333b8d87.js

async function downloadImage(url, outputPath) {
  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream',
  });

  return new Promise((resolve, reject) => {
    const stream = fs.createWriteStream(outputPath);
    response.data.pipe(stream);
    stream.on('finish', resolve);
    stream.on('error', reject);
  });
}

async function resolveDataFromUrl(url) {
  const response = await axios.get(api + 'resolve', {
    params: {
      url,
      format: 'json',
      client_id: clientId
    }
  });

  return response.data;
}
async function resolveMusicDataFromUrl(url) {
  let data = await resolveDataFromUrl(url);
  try {
    return {
      title: data.title,
      cover: data.artwork_url.replace('-large', '-t500x500'),
      duration: data.duration,
      genre: data.genre,
      artist: data?.publisher_metadata?.artist,
      album_title: data?.publisher_metadata?.album_title,
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
      cover: data.artwork_url.replace('-large', '-t500x500'),
      duration: data.duration,
      genre: data.genre,
      artist: data?.publisher_metadata?.artist,
      album_title: data?.publisher_metadata?.album_title,
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

function  cleanDownloadFile(file){
  fs.unlinkSync(`/tmp/${file}.jpg`);
}

async function downloadTrack(url, downloadPath = undefined, method = 'url') {
  if (!downloadPath)
    downloadPath = 'download'

  if (downloadPath)
    fs.mkdirSync(downloadPath, {recursive: true});

  try {
    let track = undefined;

    if (method === 'url')
      track = await resolveMusicDataFromUrl(url);
    else
      track = resolveMusicDataFromJson(url);

      if (!track)
        return ;

    const trackResponse = await axios.get(track.track, {
      params: {
        client_id: clientId
      }
    });

    const trackUrl = trackResponse.data.url;

    const trackData = await axios.get(trackUrl, {
      responseType: 'arraybuffer'
    });

    const sanitizedArtist = normalizeText(track?.artist);
    const sanitizedTitle = normalizeText(track?.title?.replace(sanitizedArtist, ''));
    const sanitizedAlbum = normalizeText(track?.album_title?.replace(sanitizedArtist, ''));

    let fileName = `${sanitizedArtist ? sanitizedArtist + ' - ' : ''}${sanitizedTitle}.mp3`;
    let filenameWithOutPath = `${sanitizedArtist ? sanitizedArtist + ' - ' : ''}${sanitizedTitle}`.replaceAll(' ','_');

    if (downloadPath)
      fileName = downloadPath + '/' + fileName;

    fs.writeFileSync(`/tmp/${filenameWithOutPath}.mp3`, Buffer.from(trackData.data));

    const tempArtworkPath = `/tmp/${filenameWithOutPath}.jpg`;
    await downloadImage(track.cover, tempArtworkPath);

    ffmpeg(`/tmp/${filenameWithOutPath}.mp3`)
        .input(tempArtworkPath)
        .outputOptions('-metadata', `artist=${sanitizedArtist || ''}`)
        .outputOptions('-metadata', `title=${sanitizedTitle || ''}`)
        .outputOptions('-metadata', `album=${sanitizedAlbum || ''}`)
        .outputOptions('-metadata', `genre=${track.genre}`)
        .outputOptions('-metadata', `duration=${track.duration}`)
        .outputOptions(['-c:a copy', '-c:v mjpeg', '-map 0', '-map 1', '-id3v2_version 3',])
        .save(`/tmp/${filenameWithOutPath}_.mp3`)
        .on('end', () => {
          fs.renameSync(`/tmp/${filenameWithOutPath}_.mp3`, fileName);
          cleanDownloadFile(filenameWithOutPath);
        })
        .on('error', (err) => {
          console.error('Error: ', err);
          cleanDownloadFile(filenameWithOutPath);
        });

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

  return arguments;
}

module.exports = {
  downloadTrack,
  handelInputs
};

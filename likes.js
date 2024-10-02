const {downloadTrack ,handelInputs}= require('./kernel');
const axios = require("axios");
const arguments = handelInputs();

let url = 'https://api-v2.soundcloud.com/users/574187352/likes';
let musics = [];

(async function () {
  do {
    await axios.get(url, {
      params: {
        client_id: 'Fs1xmKNbd3b0EiU1o1MHY4KfC41SVpjS'
      }
    }).then(respons => {
        let newMusic = respons.data.collection.map(music => {
          try {
           return  music?.track || music?.playlist;
          }catch (e) {
            console.log(music)
            process.exit();
          }
        });

      url = respons.data.next_href;
      musics = [...musics, ...newMusic];
    });

  } while (url);

  for (let music of musics) {
    await downloadTrack(music, 'playlist', 'data').then(console.log);
    await new Promise(resolve => setTimeout(resolve, 2500));
  }
})()
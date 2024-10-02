const {downloadTrack, handelInputs} = require('./kernel');

const arguments = handelInputs();

downloadTrack(arguments[0], arguments[1]).then(musicFile => {
  console.log('your music is ready ->', musicFile);
});

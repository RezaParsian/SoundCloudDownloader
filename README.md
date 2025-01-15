# SoundCloud Music Downloader

A Node.js script that downloads music tracks from SoundCloud using the SoundCloud API.

## Features

- Resolve track metadata (title, artist, cover, etc.) from a SoundCloud share link.
- Download tracks in .mp3 format.
- Automatically saves the track with a filename based on the artist and title.

## Requirements

- Node.js (v12 or higher)
- A SoundCloud API client_id (currently hardcoded but can be replaced with your own)
- ffmpeg

## Usage

1. Install the package:

```bash 
npm i @rezaparsian/soundclouddownloader
```

2. Import the package:

```js
const {downloadTrack} = require('soundclouddownloader');
```

3. Download a single sound:

```js
downloadTrack('<soundcloud-track-share-link>');
```
## Dependencies

- Axios: Used to make API requests to SoundCloud.
- fluent-ffmpeg: Used to add sound info.

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENCE) file for details.
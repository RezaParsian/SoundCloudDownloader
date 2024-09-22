# SoundCloud Music Downloader

A Node.js script that downloads music tracks from SoundCloud using the SoundCloud API.

## Features

- Resolve track metadata (title, artist, cover, etc.) from a SoundCloud share link.
- Download tracks in .mp3 format.
- Automatically saves the track with a filename based on the artist and title.

## Requirements

- Node.js (v12 or higher)
- A SoundCloud API client_id (currently hardcoded but can be replaced with your own)

## Installation

1. Clone this repository:

```bash 
git clone https://github.com/yourusername/soundcloud-music-downloader.git
```

2. Navigate to the project directory:

```bash
cd SoundCloudDownloader
```

3. Install the dependencies:

```bash
npm install
```

4. (Optional) Replace the SoundCloud client_id in the script if necessary:

Open the file and update the `clientId` value:

```javascript
const clientId = 'your-own-client-id';
```

## Usage

1. Run the script by providing a SoundCloud track share link as an argument:

```bash
node main.js <soundcloud-track-share-link>
```

Example:

```bash
node main.js https://soundcloud.com/artist/track
```

2. The track will be downloaded and saved as an .mp3 file in the current directory.

## Example Output

```bash
Your music is ready -> Artist - Track.mp3
```

## Error Handling

- If the share URL is invalid or there are network issues, the script will output an error and exit.
- Ensure that the SoundCloud API client_id has not hit the rate limit if you encounter issues.

## Dependencies

- Axios: Used to make API requests to SoundCloud.

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENCE) file for details.
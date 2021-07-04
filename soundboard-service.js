const EventEmitter = require("events");
const fs = require("fs");
const path = require("path");
const WaveFile = require("wavefile").WaveFile;
// Get the current working directory
const soundsPath = "sounds";
const sounds = {
  "sad-trombone.wav": {
    keywords: ["trombone", "sad", "fail"],
  },
  "mario-coin.wav": {
    keywords: ["coin", "mario"],
  },
  "applause.wav": {
    keywords: ["applause", "clap", "clapping", "celebrate", "yay"],
  },
  "airhorn.wav": {
    keywords: ["airhorn", "boom", "horn"],
  },
};

const keywords = Object.values(sounds).reduce((acc, props) => {
  acc.push(...props.keywords);
  return acc;
}, [])
  .sort();

class SoundboardService extends EventEmitter {
  constructor() {
    super();
  }

  getKeywords() {
    return keywords;
  }

  // Takes soundName and emits the MULAW / 8000 version w/out Wav Headers
  request(query) {
    const soundName = query.toLowerCase();
    const sound = Object.entries(sounds).find((entry) => {
      const [key, value] = entry;
      return value.keywords.includes(soundName);
    });
    if (sound === undefined) {
      return null;
    }
    const fileName = sound[0];
    const filePath = path.join(".", "public", soundsPath, fileName);
    const file = fs.readFileSync(filePath);
    const wav = new WaveFile();
    wav.fromBuffer(file);
    // Not needed since the files are already encoded in the right format
    // wav.toSampleRate(8000);
    // wav.toMuLaw();
    const audio = Buffer.from(wav.data.samples).toString("base64");
    this.emit("audio", audio);
    // Add support for RickRoll?
    const result = {
      query: soundName,
      url: `https://${process.env.SERVER_HOSTNAME}/${soundsPath}/${fileName}`,
    };
    return result;
  }
}

module.exports = SoundboardService;

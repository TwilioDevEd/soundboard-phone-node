const EventEmitter = require("events");
const Speech = require("@google-cloud/speech");
const speech = new Speech.SpeechClient();

class KeywordService extends EventEmitter {
  constructor(keywords) {
    super();
    this.stream = null;
    this.refreshStream = true;
    this.keywords = keywords;
    this.request = {
      config: {
        encoding: "MULAW",
        sampleRateHertz: 8000,
        languageCode: "en-US",
        speechContexts: [
          {
            phrases: this.keywords,
            boost: 20,
          },
        ],
      },
      interimResults: false,
    };
    console.log("KeywordService starting listening for", this.keywords);
    // And make sure we refresh stream every 60 seconds
    this.refreshTimeout = setTimeout(() => {
      console.log("Marking stream for refresh");
      this.refreshStream = true;
    }, 60000);
  }

  send(payload) {
    this.getStream().write(payload);
  }

  close() {
    if (this.stream) {
      console.log("Closing KeywordService stream");
      this.stream.destroy();
      clearTimeout(this.refreshTimeout);
    }
  }

  getStream() {
    if (this.refreshStream) {
      if (this.stream) {
        this.stream.destroy();
      }
      console.log("Creating new recognize stream");
      this.stream = speech
        .streamingRecognize(this.request)
        .on("error", console.error)
        .on("data", (data) => {
          const result = data.results[0];
          if (result === undefined || result.alternatives[0] === undefined) {
            return;
          }
          const transcript = result.alternatives[0].transcript.trim();
          const words = transcript.toLowerCase().split(" ");
          const match = this.keywords.find((keyword) =>
            words.includes(keyword)
          );
          if (match) {
            console.log(`Found "${match}" in "${transcript}"`);
            this.emit("keywordDetected", match);
          }
        });
      this.refreshStream = false;
    }
    return this.stream;
  }
}

module.exports = KeywordService;

require("dotenv").config();
const express = require("express");
const expressWebSocket = require("express-ws");
const websocketStream = require("websocket-stream/stream");
const Twilio = require("twilio");
const SoundboardService = require("./soundboard-service");
const KeywordService = require("./keyword-service");

const soundboard = new SoundboardService();

const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

// extend express app with app.ws()
expressWebSocket(app, null, {
  perMessageDeflate: false,
});

// On incoming call, dial the conference
app.post("/twiml", (req, res) => {
  const twiml = new Twilio.twiml.VoiceResponse();
  twiml.dial().conference(
    {
      statusCallback: `https://${process.env.SERVER_HOSTNAME}/status-handler`,
      statusCallbackEvent: ["start", "leave", "join"],
    },
    "Soundboard"
  );
  res.type("xml");
  res.send(twiml.toString());
});

// TODO: Handle last participant and close the call we made
app.post("/status-handler", (req, res) => {
  const client = new Twilio();
  const status = req.body.StatusCallbackEvent;
  console.log(`Status: ${status}`);
  if (status === "conference-start") {
    // Add SOUNDBOARD_NUMBER as a participant
    // Because it is wired up to connect to a stream on incoming handler
    // We'll get the stream
    console.log("Adding Soundboard as a participant...");
    client
      .conferences(req.body.ConferenceSid)
      .participants.create({
        label: "soundboard-call",
        to: process.env.SOUNDBOARD_NUMBER,
        from: process.env.CONFERENCE_NUMBER,
      })
      .then((participant) => {
        console.log("Added");
      });
  }

  if (status === "participant-leave") {
    // TODO: Do a check of how many participants are left, and if 1, close the call
    client
      .conferences(req.body.ConferenceSid)
      .participants.list()
      .then((participants) => {
        if (participants.length === 1) {
          console.log("Only soundboard remaining, ending conference...");
          client
            .conferences(req.body.ConferenceSid)
            .update({ status: "completed" })
            .then((conference) => {
              console.log(`Conference status: ${conference.status}`);
            });
        }
      });
  }
});

// Wire the SOUNDBOARD_NUMBER voiceUrl
app.post("/soundboard-call-twiml", (req, res) => {
  const twiml = new Twilio.twiml.VoiceResponse();
  twiml.say("Your sound board is connected.");
  twiml.connect().stream({
    url: `wss://${process.env.SERVER_HOSTNAME}/audio`,
  });
  res.type("xml");
  res.send(twiml.toString());
});

// Wire the SOUNDBOARD_NUMBER smsUrl
app.post("/soundboard-text-twiml", (req, res) => {
  const twiml = new Twilio.twiml.MessagingResponse();
  const soundName = req.body.Body;
  const result = soundboard.request(soundName);
  if (result !== null) {
    twiml.message(
      `🎧 Your request for "${soundName}" was sent. Attempting to play ${result.url}.`
    );
  } else {
    twiml.message(
      `🤷‍♂️ Sorry, we couldn't play your request "${soundName}". Try again?`
    );
  }
  res.type("xml");
  res.send(twiml.toString());
});

app.ws("/audio", (ws, req) => {
  console.log("Websocket connected");
  // This will get populated from the start message
  let callSid;
  let streamSid;
  // MediaStream coming from Twilio
  const mediaStream = websocketStream(ws, {
    binary: false,
  });
  const keywordService = new KeywordService(soundboard.getKeywords());
  mediaStream.on("data", (data) => {
    const msg = JSON.parse(data);
    if (msg.event === "start") {
      callSid = msg.start.callSid;
      streamSid = msg.start.streamSid;
      console.log(`Call ${callSid} is happening`);
    }
    if (msg.event !== "media") {
      // We're only concerned with media messages
      return;
    }
    keywordService.send(msg.media.payload);
  });
  // Inner named function so we can unregister
  function playAudio(audio) {
    const mediaMessage = {
      streamSid,
      event: "media",
      media: {
        payload: audio,
      },
    };
    const mediaJSON = JSON.stringify(mediaMessage);
    console.log(`Sending audio (${audio.length} characters)`);
    mediaStream.write(mediaJSON);
    // TODO: Send a mark message and don't allow other sounds
  }
  soundboard.on("audio", playAudio);
  keywordService.on("keywordDetected", (keyword) => {
    soundboard.request(keyword);
  });
  mediaStream.on("close", () => {
    console.log("MediaStream closed");
    keywordService.close();
    // Stop listening for events
    soundboard.removeListener("audio", playAudio);
  });
});

const listener = app.listen(PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
  console.log(`Server hostname from .env: ${process.env.SERVER_HOSTNAME}`);
});

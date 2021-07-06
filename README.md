[![Learn to code with TwilioQuest](https://img.shields.io/static/v1?label=TwilioQuest&message=Learn%20to%20code%21&color=F22F46&labelColor=1f243c&style=flat-square&logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAMAAAD04JH5AAAASFBMVEUAAAAZGRkcHBwjIyMoKCgAAABgYGBoaGiAgICMjIyzs7PJycnMzMzNzc3UoBfd3d3m5ubqrhfrMEDu7u739/f4vSb/3AD///9tbdyEAAAABXRSTlMAAAAAAMJrBrEAAAKoSURBVHgB7ZrRcuI6EESdyxXGYoNFvMD//+l2bSszRgyUYpFAsXOeiJGmj4NkuWx1Qeh+Ekl9DgEXOBwOx+Px5xyQhDykfgq4wG63MxxaR4ddIkg6Ul3g84vCIcjPBA5gmUMeXESrlukuoK33+33uID8TWeLAdOWsKpJYzwVMB7bOzYSGOciyUlXSn0/ABXTosJ1M1SbypZ4O4MbZuIDMU02PMbauhhHMHXbmebmALIiEbbbbbUrpF1gwE9kFfRNAJaP+FQEXCCTGyJ4ngDrjOFo3jEL5JdqjF/pueR4cCeCGgAtwmuRS6gDwaRiGvu+DMFwSBLTE3+jF8JyuV1okPZ+AC4hDFhCHyHQjdjPHUKFDlHSJkHQXMB3KpSwXNGJPcwwTdZiXlRN0gSp0zpWxNtM0beYE0nRH6QIbO7rawwXaBYz0j78gxjokDuv12gVeUuBD0MDi0OQCLvDaAho4juP1Q/jkAncXqIcCfd+7gAu4QLMACCLxpRsSuQh0igu0C9Svhi7weAGZg50L3IE3cai4IfkNZAC8dfdhsUD3CgKBVC9JE5ABAFzg4QL/taYPAAWrHdYcgfLaIgAXWJ7OV38n1LEF8tt2TH29E+QAoDoO5Ve/LtCQDmKM9kPbvCEBApK+IXzbcSJ0cIGF6e8gpcRhUDogWZ8JnaWjPXc/fNnBBUKRngiHgTUSivSzDRDgHZQOLvBQgf8rRt+VdBUUhwkU6VpJ+xcOwQUqZr+mR0kvBUgv6cB4+37hQAkXqE8PwGisGhJtN4xAHMzrsgvI7rccXqSvKh6jltGlrOHA3Xk1At3LC4QiPdX9/0ndHpGVvTjR4bZA1ypAKgVcwE5vx74ulwIugDt8e/X7JgfkucBMIAr26ndnB4UCLnDOqvteQsHlgX9N4A+c4cW3DXSPbwAAAABJRU5ErkJggg==)](https://twilio.com/quest?utm_source=gh-badge&utm_medium=referral&utm_campaign=soundboard-phone)

# Soundboard Phone

Adds a soundboard to your phone calls. This project uses [Twilio MediaStreams](https://twilio.com/media-streams) to play audio on your phone call based on a text message or a spoken detected keyword (using the [Google Cloud Speech API](https://cloud.google.com/speech-to-text)).

This project also optionally includes a Twilio conference line which will orchestrate adding a Soundboard to your conference call.

## Setup

Sign up for [Twilio](https://www.twilio.com/try-twilio)

Install the [CLI](https://www.twilio.com/docs/twilio-cli/quickstart)

Buy a Twilio phone number to handle the incoming Soundboard call

```bash
twilio phone-numbers:buy:local --country-code=US
```

Optionally: Buy a Twilio phone number to handle the conference call

```bash
twilio phone-numbers:buy:local --country-code=US
```

Install packages

```bash
npm install
```

Set up your `.env` file

```bash
npx configure-env
```

Source your new `.env` file

```bash
source .env
```

Wire up your number to handle incoming calls and text messages

```bash
twilio phone-numbers:update $SOUNDBOARD_NUMBER --voice-url=https://$SERVER_HOSTNAME/soundboard-call-twiml --sms-url=https://$SERVER_HOSTNAME/soundboard-text-twiml
```

Optionally: Wire up your incoming conference call number

```bash
twilio phone-numbers:update $CONFERENCE_NUMBER --voice-url=https://$SERVER_HOSTNAME/twiml
```

Setup a Google Cloud project and enable the [Google Cloud Speech API](https://cloud.google.com/speech-to-text).

Download your credentials and save them in a file called `google_creds.json` (or `$GOOGLE_APPLICATION_CREDENTIALS` if you changed the value)

## Learn more

* [More Twilio Media Streams examples](https://github.com/twilio/media-streams)
* [`<Stream>` Documenation](https://www.twilio.com/docs/voice/twiml/stream)
* [Google Speech API](https://cloud.google.com/speech-to-text/)

## Meta

* No warranty expressed or implied. Software is as is. Diggity.
* [MIT License](http://www.opensource.org/licenses/mit-license.html)
* Lovingly crafted by Twilio Developer Education.

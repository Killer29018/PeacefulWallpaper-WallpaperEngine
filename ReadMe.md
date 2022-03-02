To use create a file named in js called Tokens.js

In this file add 
```
var weatherKey = <open weather map api id>;
var SpotifyClientID = <Spotify client id>;
var SpotifyClientSecret = <Spotify Client Secret>;
var SpotifyCode = <Spotify Access Code>
var quoteOfDay = <true | false>;
```

To access the spotify access code start running the wallpaper locally
While running open the developer console and type outputCodeURL() which will
print the access url with the given spotifyClientID paste this into the url and it will redirect you to
localhost/?code=<code>
Cope the code and paste into Tokens.js
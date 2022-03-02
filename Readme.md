# Initial Setup
Locate your wallpaper engine local files\
Then go to projects\myprojects and paste the files into a folder in this directory

From here follow the steps to setup the API keys

# Setup api keys
To use create a file named in js called Tokens.js\
In this file add
```
var weatherKey = "<open weather map api id>";
var SpotifyClientID = "<Spotify client id>";
var SpotifyClientSecret = "<Spotify Client Secret>";
var SpotifyCode = "<Spotify Access Code>"
var quoteOfDay = <true | false>;
```

### Open Weather API
Go to [OpenWeathermap.org](https://openweathermap.org/)\
Create an account and go to API\
From API Subscribe to Current Weather Data and click "Get API Key" under free\
Then Click on your profile and "My API Keys" and create a name for the api and then generate\
Copy this Key into weatherKey

It may take a while for the API Key to be created fully

### Spotify Client and Secret ID
Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/) and log in to your spotify account\
From here create an app and enter an app name and description\
Copy the client ID and Client Secret into Tokens.js

From here click on "Edit Settings"\
Scroll down to Redirect URIs\
Paste in `http://localhost` and click add and then save

### Spotify Access code
To access the spotify access code start running the wallpaper locally by opening the index.html directly in your browser\
While running open the developer console and type outputCodeURL() which will\
print the access url with the given spotifyClientID paste this into the url and it will redirect you to `localhost/?code=<code>`\
Copy everything after code= and paste into Tokens.js

If you get an error about Invalid redirect URI make sure you wrote the Redirect URI in the spotify developer dashboard correctly\
If you do not see your spotify songs being shown you may need to refresh your access code by following the above steps again

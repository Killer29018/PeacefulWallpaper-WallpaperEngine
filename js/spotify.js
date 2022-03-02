const SPOTIFY_AUTHORISE_URL = "https://accounts.spotify.com/authorize";
const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";
const SPOTIFY_REDIRECT_URL = "http://localhost";

const SPOTIFY_CURRENTLY_PLAYING = "https://api.spotify.com/v1/me/player/currently-playing";

var accessToken = "";
var refreshToken = "";

var songPlaying = false;
var hidden = false;
var song = "";
var currentSong = "";
var currentSongArtist = "";
var currentSongIconSrc = "";

var spotifyEnabled = true;


function outputCodeURL()
{
    let url = SPOTIFY_AUTHORISE_URL;
    url += "?client_id=" + SpotifyClientID;
    url += "&response_type=code";
    url += "&redirect_uri=" + encodeURI(SPOTIFY_REDIRECT_URL);
    url += "&show_dialog=true";
    url += "&scope=user-read-currently-playing";
    
    url.replace(" ", "%20");

    console.log(url);
}

function loadTokens()
{
    accessToken = localStorage.getItem("accessToken");
    refreshToken = localStorage.getItem("refreshToken");
}

function fetchAccessToken()
{
    let body = "grant_type=authorization_code";
    body += "&code=" + SpotifyCode;
    body += "&redirect_uri=" + encodeURI(SPOTIFY_REDIRECT_URL);
    body += "&client_id=" + SpotifyClientID;
    body += "&client_secret=" + SpotifyClientSecret;
    callAuthorisationAPI(body);
}

function callAuthorisationAPI(body)
{
    let xhr = new XMLHttpRequest();
    xhr.open("POST", SPOTIFY_TOKEN_URL, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.setRequestHeader('Authorization', 'Basic ' + btoa(SpotifyClientID + ":" + SpotifyClientSecret));
    xhr.send(body);
    xhr.onload = handleAuthorizationResponse;
}

async function handleAuthorizationResponse() {
    if (this.status == 200)
    {
        var data = JSON.parse(this.responseText);
        var data = JSON.parse(this.responseText);
        if (data.access_token != undefined) 
        {
            accessToken = data.access_token;
            localStorage.setItem("accessToken", accessToken);
        }
        if (data.refresh_token != undefined)
        {
            refreshToken = data.refresh_token;
            localStorage.setItem("refreshToken", refreshToken);
        }
        start();
    }
    else if (this.status == 401)
    {
        refreshAccessToken();
    }
    else
    {
        console.log(this.responseText);
        console.log(this.status);
        // alert(this.responseText);
    }
}

function callAPI(method, url, body, callback)
{
    let xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
    xhr.send(body);
    xhr.onload = callback;
}

async function currentlyPlaying() 
{
    callAPI("GET", SPOTIFY_CURRENTLY_PLAYING + "?market=ES", null, handleCurrentlyPlayingResponse);
}

function handleCurrentlyPlayingResponse()
{
    if (this.status == 200)
    {
        var data = JSON.parse(this.responseText);

        if (data["item"] != null)
        {
            if (!spotifyEnabled)
                return;

            var playing = data["is_playing"];
            var artistName = data["item"]["artists"][0]["name"];
            var songName = data["item"]["name"];
            var songIconSrc = data["item"]["album"]["images"][0]["url"];

            if (currentSong != songName && playing)
            {
                currentSong = songName
                currentSongArtist = artistName;
                currentSongIconSrc = songIconSrc;
                songPlaying = playing;
                

                if (document.getElementById("SpotifyData").classList.length == 0)
                    updateSongData();
                else
                    document.getElementById("SpotifyData").setAttribute("class", "inactive");
            }
            else if (!playing && songPlaying)
            {
                songPlaying = playing;
                document.getElementById("SpotifyData").setAttribute("class", "inactive");
            }
            else if (document.getElementById("SpotifyData").classList.contains("inactive") && playing)
            {
                songPlaying = playing;
                updateSongData();
            }
        }
    }
    else if (this.status == 204)
    {
        // console.log(this.responseText);
    }
    else if (this.status == 401)
    {
        refreshAccessToken();
    }
    else
    {
        // console.log(this.responseText);
        // alert(this.responseText);
    }
}

function updateSongData()
{
    if (document.getElementById("SpotifyData").classList.contains("active") || !spotifyEnabled)
        return;
    
    // console.log("Playing: " + songPlaying);
    // console.log("Artist name: " + currentSongArtist);
    // console.log("Song Name: " + currentSong);
    // console.log("Song Icon Src: " + currentSongIconSrc);

    document.getElementById("Spotify_Song_Icon").setAttribute("src", currentSongIconSrc);
    document.getElementById("Spotify_Artist_Name").innerHTML = currentSongArtist;
    document.getElementById("Spotify_Song_Name").innerHTML = currentSong;

    if (songPlaying)
    {
        document.getElementById("SpotifyData").setAttribute("class", "active");
    }
}

function refreshAccessToken() 
{
    refreshToken = localStorage.getItem("refreshToken");
    let body = "grant_type=refresh_token";
    body += "&refresh_token=" + refreshToken;
    body += "&clientID=" + SpotifyClientID;
    callAuthorisationAPI(body);
}
var days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const BASE_WEATHER_URL = "https://api.openweathermap.org/data/2.5/weather?q=reading&units=metric&appid=";

var weatherUrl = BASE_WEATHER_URL + weatherKey;

var images = document.getElementsByClassName("background");

var topImage = 1;
var current = 1;

var hour = 0;
var minute = 0;
var seconds = 0;
var imageMinute = 0;

var currentMinute = 0;

var apiMain;
var apiWeather;
var apiWind;

var today;

var dataEnabled = true;
var clockEnabled = true;
var dateEnabled = true;

var textColour;

var index = 0;

var initialized = false;

let minuteOffset = 0;
let hourOffset = 0;

let offsetedHour = 0;
let offsetedMinute = 0;

var pauseBackground = false;
var weatherData = true;

function getQuoteOfDay() {
    if (!quoteOfDay)
        return;

    const options = ["inspire", "students"];
    var url = "https://quotes.rest/qod?category=";
    var random = Math.floor(Math.random() * options.length);
    url += options[random];

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4) {
            if (this.status != 200)
            {
                document.getElementById("QuoteOfTheDay").setAttribute("class", "inactive");
                return;
            }

            var response = xhttp.responseText;
            var json = JSON.parse(response);
            console.log(response);

            document.getElementById("QuoteOfTheDay").setAttribute("class", "active");

            var quote = json["contents"]["quotes"][0]["quote"];
            var author = json["contents"]["quotes"][0]["author"];
            var length = json["contents"]["quotes"][0]["length"];

            const limit = 60;

            if (length > limit)
            {
                var interations = Math.floor(length / limit);
                console.log(interations);

                for (var i = 1; i <= interations; i++)
                {
                    var pos = quote.lastIndexOf(" ", i * limit);
                    quote = quote.slice(0, pos) + "<BR>" + quote.slice(pos + 1);
                }
            }

            document.getElementById("QuoteOfTheDay_Quote").innerHTML = quote;
            document.getElementById("QuoteOfTheDay_Author").innerHTML = author;

            console.log(json);
            // console.log(quote);
            // console.log(author);

    }};

    xhttp.open("GET", url);
    xhttp.setRequestHeader("accept", "application/json");
    xhttp.send();
}

function start()
{
    getQuoteOfDay();
    document.getElementById("Data").classList.add("pauseAnimation");
    window.addEventListener("load", startAnimation);
    document.getElementById("SpotifyData").addEventListener("animationend", updateSongData);

    setInterval(startTime, 1000); // 1 second
    setInterval(updateWeather, 1000 * 60 * 10); // 10 minutes
    setInterval(currentlyPlaying, 1000 * 5); // 5 seconds
    
    startTime();
    startImageTransition();
    
    updateWeather();

    updateBackground();

    
    accessToken = localStorage.getItem("accessToken");
    if (accessToken == undefined)
        fetchAccessToken();
    else
        loadTokens();
    

    currentlyPlaying();
}

function startAnimation()
{
    document.getElementById("Data").classList.remove("pauseAnimation");
}

function updateTime()
{
    today = new Date();
    hour = today.getHours() % 24;
    minute = today.getMinutes();
    seconds = today.getSeconds();
}

function startTime()
{
    if (!dataEnabled)
    {
        return;
    }

    updateTime();

    let date = today.getDate();
    let day = days[today.getDay()];
    let month = months[today.getMonth() - 1];

    let formatMinute = formatTime(minute);
    let formatSecond = formatTime(seconds);

    if (clockEnabled)
    {
        let text = "";
        if (dateEnabled)
        {
            text = day + ", " + date + " " + month + " ";
        }
        text += hour + ":" + formatMinute + ":" + formatSecond;

        document.getElementById("Clock").innerHTML = text;
    }

    if (!initialized)
        return;

    imageMinute = Math.floor(minute / 15) * 15;
    if (imageMinute !== currentMinute)
    {
        currentMinute = imageMinute;
        updateBackground();
    }
}

function updateIndex()
{
    let hourAdd = Math.floor((imageMinute + minuteOffset) / 60);
    let currentHour = (hour + hourOffset + hourAdd) % 24;

    if (currentHour < 0)
        currentHour = 24 + currentHour;

    let currentMinute = Math.floor(((imageMinute + minuteOffset) % 60) / 15) * 15;

    if (currentMinute < 0)
        currentMinute = 60 + currentMinute;

    offsetedHour = currentHour;
    offsetedMinute = currentMinute;

    index = ((currentHour * 4) + Math.floor(currentMinute / 15)) % images.length;

    updateImageTime();
}

async function updateWeather()
{
    if (!weatherData)
        return;

    if (weatherKey.length != 32)
    {
        document.getElementById("WeatherData").style.display = "none";
        return;
    }
    else
    {
        document.getElementById("WeatherData").style.display = "block";
    }

    weatherUrl = BASE_WEATHER_URL + weatherKey;

    var data;
    await fetch(weatherUrl)
    .then(res => res.json())
    .then((out) => {
        data = out;
    })
    .catch(err=>{throw err});

    apiMain = data["main"];
    apiWeather = data["weather"][0];
    apiWind = data["wind"]

    document.getElementById("Weather_Description").innerHTML = apiWeather["description"];
    let iconVar = apiWeather["icon"];

    let iconLink = "https://openweathermap.org/img/wn/" + iconVar + "@4x.png";

    document.getElementById("Weather_Icon").setAttribute("src", iconLink);

    let temperature = Math.round(apiMain["feels_like"]);
    document.getElementById("Temperature").innerHTML = temperature + "°C";

    let humidity = apiMain["humidity"];
    document.getElementById("Humidity").innerHTML = humidity + "%";

    let windSpeed = apiWind["speed"];
    document.getElementById("Wind_Speed").innerHTML = windSpeed + "m/s";
    let windDeg = apiWind["deg"];
    document.getElementById("Wind_Dir").innerHTML = windDeg + "°";
}

function updateImageTime() {
    document.getElementById("ImageTime").innerHTML = offsetedHour + ":" + formatTime(offsetedMinute);
}

function startImageTransition() 
{
    updateIndex();
    current = index;

    for (let i = 0; i < images.length; i++) 
    {
        images[i].style.opacity = 0;
        images[i].style.visibility = "hidden";
        images[i].style.zIndex = topImage;
    }

    images[current].style.opacity = 1;
    images[current].style.visibility = "visible";
    // images[current].style.zIndex = topImage;

    initialized = true;
}

async function updateBackground()
{
    if (!initialized)
        return;

    updateIndex();
    var nextImage = index;

    if (index == current || pauseBackground)
    {
        images[current].style.zindex = topImage;
        images[current].style.opacity = 1;
        images[current].style.visibility = "visible";
        return;
    }

    images[current].style.opacity = 1;

    images[nextImage].style.opacity = 1;
    images[nextImage].style.visibility = "visible";

    images[current].style.zIndex = topImage + 1;
    images[nextImage].style.zIndex = topImage;

    await transition(current);

    images[current].style.zIndex = topImage;
    images[nextImage].style.zIndex = topImage + 1;

    images[current].style.opacity = 0;
    images[current].style.visibility = "hidden";

    current = nextImage;

    images[current].style.opacity = 1;
    images[current].style.zIndex = topImage;
    images[current].style.visibility = "visible";
}

async function updateBackgroundInstant()
{
    if (!initialized)
        return;

    updateIndex();
    var nextImage = index;

    if (index == current)
    {
        images[current].style.zindex = topImage;
        images[current].style.opacity = 1;
        images[current].style.visibility = "visible";
        return;
    }

    images[nextImage].style.opacity = 1;
    images[nextImage].style.visibility = "visible";
    images[nextImage].style.zIndex = topImage;

    images[current].style.opacity = 0;
    images[current].style.visibility = "hidden";
    images[current].style.zIndex = topImage;

    current = nextImage;
}

async function transition(index) {
    return new Promise(function(resolve, reject) {
        var del = 0.01;

        var id = setInterval(changeOpacity, 10);

        function changeOpacity() {
            images[index].style.opacity -= del;
            // console.log(images[index].style.opacity);
            if (images[index].style.opacity <= 0)
            {
                clearInterval(id);
                resolve();
            }
        }
    })
    // let del = 0.01;

    // images[index].style.opacity = 1;
    // console.log(images[index].style.opacity);
    // let id = setInterval(changeOpacity, 10);

    // let opacity = 1;

    // function changeOpacity() {
    //     console.log(images[index].style.opacity);
    //     opacity -= del;
    //     console.log(index + ":" + images[index].style.opacity);

    //     if (images[index].style.opacity <= 0.0) {
    //         clearInterval(id);
            
    //         return;
    //     }
    // }
}

function formatTime(i)
{
    if (i < 10) { i = "0" + i; }
    return i;
}

window.wallpaperPropertyListener = {
    applyUserProperties: function(properties) {

        if (properties.houroffset)
        {
            hourOffset = properties.houroffset.value;
            updateBackgroundInstant();
        }

        if (properties.minuteoffset)
        {
            minuteOffset = properties.minuteoffset.value * 15;
            updateBackgroundInstant();
        }

        if (properties.showimagetime)
        {
            if (properties.showimagetime.value)
                document.getElementById("ImageTime").style.display = "block";
            else
                document.getElementById("ImageTime").style.display = "none";
        }

        if (properties.pausebackground)
        {
            pauseBackground = properties.pausebackground.value;

            if (!pauseBackground)
                updateBackgroundInstant();
        }

        if (properties.enablespotify)
        {
            spotifyEnabled = properties.enablespotify.value;

            if (spotifyEnabled)
            {
                currentlyPlaying();
            }
            else
                document.getElementById("SpotifyData").setAttribute("class", "inactive");
        }

        if (properties.spotifycode)
        {
            code = properites.spotifycode.value;
            fetchAccessToken();
        }

        if (properties.spotifyxoffset)
        {
            let value = properties.spotifyxoffset.value;

            document.getElementById("SpotifyData").style.paddingLeft = value + "px";
        }

        if (properties.spotifyyoffset)
        {
            let value = properties.spotifyyoffset.value;

            document.getElementById("SpotifyData").style.paddingTop = value + "px";
        }

        if (properties.data) {
            dataEnabled = properties.data.value;

            if (dataEnabled)
                document.getElementById("Data").style.display = "inline";
            else
                document.getElementById("Data").style.display = "none";
        }

        if (properties.clock)
        {
            clockEnabled = properties.clock.value;

            if (clockEnabled)
                document.getElementById("Clock").style.display = "block";
            else
                document.getElementById("Clock").style.display = "none";
        }

        if (properties.weatherdata)
        {
            weatherData = properties.weatherdata.value;

            if (weatherData)
            {
                document.getElementById("WeatherData").style.display = "block";
                updateWeather();
            }
            else
                document.getElementById("WeatherData").style.display = "none";
        }

        if (properties.weatherapikey)
        {
            weatherKey = properties.weatherapikey.value;
            updateWeather();
        }

        if (properties.date)
        {
            dateEnabled = properties.date.value;
        }

        if (properties.textcolour)
        {
            let customColour = properties.textcolour.value.split(' ');
            customColour = customColour.map(function(c) {
                return Math.ceil(c * 255);
            });
            textColour = 'rgb(' + customColour + ')';

            document.getElementById("Data").style.color = 'rgb(' + customColour + ')';
            document.getElementById("SpotifyData").style.color = 'rgb(' + customColor + ')';
        }



        if (properties.xoffset)
        {
            let value = properties.xoffset.value;

            document.getElementById("Data").style.paddingRight = value + "px";
        }

        if (properties.yoffset)
        {
            let value = properties.yoffset.value;

            document.getElementById("Data").style.paddingTop = value + "px";
        }

        if (properties.climate)
        {
            let enabled = properties.climate.value;
            if (enabled)
                document.getElementById("Climate").style.display = "block";
            else
                document.getElementById("Climate").style.display = "none";
        }

        if (properties.climatetitle)
        {
            let enabled = properties.climatetitle.value;
            if (enabled)
                document.getElementById("Climate_Title").style.display = "block";
            else
                document.getElementById("Climate_Title").style.display = "none";
        }

        if (properties.temperature)
        {
            let enabled = properties.temperature.value;
            if (enabled)
                document.getElementById("Temperature").style.display = "inline";
            else
                document.getElementById("Temperature").style.display = "none";
        }

        if (properties.humidity)
        {
            let enabled = properties.humidity.value;
            if (enabled)
                document.getElementById("Humidity").style.display = "inline";
            else
                document.getElementById("Humidity").style.display = "none";
        }


        if (properties.wind)
        {
            let enabled = properties.wind.value;
            if (enabled)
                document.getElementById("Wind").style.display = "block";
            else
                document.getElementById("Wind").style.display = "none";
        }

        if (properties.windtitle)
        {
            let enabled = properties.windtitle.value;
            if (enabled)
                document.getElementById("Wind_Title").style.display = "block";
            else
                document.getElementById("Wind_Title").style.display = "none";
        }

        if (properties.windspeed)
        {
            let enabled = properties.windspeed.value;
            if (enabled)
                document.getElementById("Wind_Speed").style.display = "inline";
            else
                document.getElementById("Wind_Speed").style.display = "none";
        }

        if (properties.winddirection)
        {
            let enabled = properties.winddirection.value;
            if (enabled)
                document.getElementById("Wind_Dir").style.display = "inline";
            else
                document.getElementById("Wind_Dir").style.display = "none";
        }

        if (properties.weather)
        {
            let enabled = properties.weather.value;
            if (enabled)
                document.getElementById("Weather").style.display = "block";
            else
                document.getElementById("Weather").style.display = "none";
        }

        if (properties.weathericon)
        {
            let enabled = properties.weathericon.value;
            if (enabled)
                document.getElementById("Weather_Icon").style.visibility = "visible";
            else
                document.getElementById("Weather_Icon").style.visibility = "hidden";
        }

        if (properties.weatherdescription)
        {
            let enabled = properties.weatherdescription.value;
            if (enabled)
                document.getElementById("Weather_Description").style.display = "inline";
            else
                document.getElementById("Weather_Description").style.display = "none";
        }

        if (properties.enablequote)
        {
            let enabled = properties.enablequote.value;
            if (enabled)
                document.getElementById("QuoteOfTheDay").style.display = "block";
            else
                document.getElementById("QuoteOfTheDay").style.display = "none";
        }
    }
}
// ====== WEATHERAPI.COM KEY (Shayan's own key, signed up with Google) ======
var API_KEY = "2f14e2cef74c4eedb69230948262511";

var unit = "metric"; // metric = Celsius, imperial = Fahrenheit
var pressureUnit = "hPa"; // hPa or inHg (pressure toggle, independent of temp units)
var currentCity = "Lahore";
var lastPressureMb = null; // last shown pressure, so the toggle re-renders without a refetch
var lastPressureIn = null;

// get elements from the page
var cityInput = document.getElementById("cityInput");
var searchBtn = document.getElementById("searchBtn");
var locationBtn = document.getElementById("locationBtn");
var celsiusBtn = document.getElementById("celsiusBtn");
var fahrenheitBtn = document.getElementById("fahrenheitBtn");
var pressureHpaBtn = document.getElementById("pressureHpaBtn");
var pressureInHgBtn = document.getElementById("pressureInHgBtn");
var message = document.getElementById("message");
var weatherCard = document.getElementById("weatherCard");
var hourlySection = document.getElementById("hourlySection");
var dailySection = document.getElementById("dailySection");

// ----- helper functions -----
function tempSymbol() {
  return unit === "metric" ? "°C" : "°F";
}

// pick Celsius or Fahrenheit value from the API data
function pickTemp(celsius, fahrenheit) {
  var value = unit === "metric" ? celsius : fahrenheit;
  return Math.round(value) + tempSymbol();
}

// the API gives icon links starting with // so we add https:
function iconUrl(icon) {
  return "https:" + icon;
}

// turn "2026-11-26 14:00" into "2:00 PM"
function formatHour(timeString) {
  var hours = parseInt(timeString.split(" ")[1].split(":")[0]);
  var ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  if (hours === 0) hours = 12;
  return hours + ":00 " + ampm;
}

// show the stored pressure in the selected unit
function renderPressure() {
  if (lastPressureMb === null) return; // nothing loaded yet
  document.getElementById("pressure").textContent =
    pressureUnit === "hPa"
      ? lastPressureMb + " hPa"
      : lastPressureIn.toFixed(2) + " inHg";
}

function showMessage(text) {
  message.textContent = text;
  message.classList.remove("hidden");
}

function hideAll() {
  weatherCard.classList.add("hidden");
  hourlySection.classList.add("hidden");
  dailySection.classList.add("hidden");
}

// ----- show an error message from the API -----
function showError(error) {
  hideAll();
  if (error.code === 1006) {
    showMessage("City not found. Please try a different name.");
  } else if (error.code === 2006 || error.code === 2007 || error.code === 2008) {
    showMessage("There is a problem with your API key. Check it in script.js.");
  } else {
    showMessage(error.message);
  }
}

// ----- get weather (city name OR "lat,lon") -----
function getWeather(place) {
  if (!API_KEY) {
    hideAll();
    showMessage("Please add your API key in script.js first.");
    return;
  }

  currentCity = place;
  showMessage("Loading weather...");

  var q = encodeURIComponent(place);

  // 1st API: current weather
  var currentUrl = "https://api.weatherapi.com/v1/current.json?key=" + API_KEY + "&q=" + q + "&aqi=no";
  // 2nd API: forecast (also has hourly data and sunrise/sunset)
  // Business trial gives 7 days. After the trial, the Free plan gives 3 days,
  // so if the 7-day request fails we try again with 3 days (see below).
  var forecastUrl = "https://api.weatherapi.com/v1/forecast.json?key=" + API_KEY + "&q=" + q + "&days=7&aqi=no&alerts=no";
  var forecast3Url = "https://api.weatherapi.com/v1/forecast.json?key=" + API_KEY + "&q=" + q + "&days=3&aqi=no&alerts=no";

  Promise.all([fetch(currentUrl), fetch(forecastUrl)])
    .then(function (responses) {
      return Promise.all([responses[0].json(), responses[1].json()]);
    })
    .then(function (results) {
      var current = results[0];
      var forecast = results[1];

      if (current.error) {
        showError(current.error);
        return;
      }
      if (forecast.error) {
        // fall back to the Free plan's 3-day forecast
        return fetch(forecast3Url)
          .then(function (r) { return r.json(); })
          .then(function (forecast3) {
            if (forecast3.error) {
              showError(forecast3.error);
              return;
            }
            showCurrentWeather(current, forecast3);
            showHourly(forecast3);
            showDaily(forecast3);
          });
      }

      showCurrentWeather(current, forecast);
      showHourly(forecast);
      showDaily(forecast);
    })
    .catch(function (error) {
      console.log(error);
      hideAll();
      showMessage("Something went wrong. Check your internet connection.");
    });
}

// ----- show the main card -----
function showCurrentWeather(data, forecast) {
  var cur = data.current;
  var astro = forecast.forecast.forecastday[0].astro;

  document.getElementById("cityName").textContent = data.location.name + ", " + data.location.country;
  document.getElementById("description").textContent = cur.condition.text;
  document.getElementById("icon").src = iconUrl(cur.condition.icon);
  document.getElementById("temp").textContent = pickTemp(cur.temp_c, cur.temp_f);
  document.getElementById("feelsLike").textContent = "Feels like " + pickTemp(cur.feelslike_c, cur.feelslike_f);
  document.getElementById("humidity").textContent = cur.humidity + "%";

  if (unit === "metric") {
    document.getElementById("wind").textContent = cur.wind_kph + " km/h";
    document.getElementById("visibility").textContent = cur.vis_km + " km";
  } else {
    document.getElementById("wind").textContent = cur.wind_mph + " mph";
    document.getElementById("visibility").textContent = cur.vis_miles + " mi";
  }

  lastPressureMb = cur.pressure_mb;
  lastPressureIn = cur.pressure_in;
  renderPressure();
  // Dew point follows the selected temperature unit (°C / °F).
  document.getElementById("dewPoint").textContent = pickTemp(cur.dewpoint_c, cur.dewpoint_f);
  document.getElementById("sunrise").textContent = astro.sunrise;
  document.getElementById("sunset").textContent = astro.sunset;

  message.classList.add("hidden");
  weatherCard.classList.remove("hidden");
}

// ----- hourly forecast (next 8 hours) -----
function showHourly(data) {
  var hourlyDiv = document.getElementById("hourly");
  hourlyDiv.innerHTML = "";

  // put today's and tomorrow's hours in one list
  var allHours = [];
  var days = data.forecast.forecastday;
  for (var d = 0; d < days.length; d++) {
    for (var h = 0; h < days[d].hour.length; h++) {
      allHours.push(days[d].hour[h]);
    }
  }

  // only show hours that haven't passed yet
  var nowEpoch = data.location.localtime_epoch;
  var count = 0;

  for (var i = 0; i < allHours.length; i++) {
    var item = allHours[i];
    if (item.time_epoch >= nowEpoch - 3600 && count < 8) {
      count++;
      hourlyDiv.innerHTML +=
        '<div class="mini-card">' +
          "<p>" + formatHour(item.time) + "</p>" +
          '<img src="' + iconUrl(item.condition.icon) + '">' +
          "<p><b>" + pickTemp(item.temp_c, item.temp_f) + "</b></p>" +
        "</div>";
    }
  }
  hourlySection.classList.remove("hidden");
}

// ----- daily forecast -----
function showDaily(data) {
  var dailyDiv = document.getElementById("daily");
  dailyDiv.innerHTML = "";
  var names = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  var days = data.forecast.forecastday;

  for (var i = 0; i < days.length; i++) {
    var day = days[i];
    // add "T12:00:00" so the day doesn't shift because of timezones
    var date = new Date(day.date + "T12:00:00");

    dailyDiv.innerHTML +=
      '<div class="mini-card">' +
        "<p>" + names[date.getDay()] + "</p>" +
        '<img src="' + iconUrl(day.day.condition.icon) + '">' +
        "<p><b>" + pickTemp(day.day.maxtemp_c, day.day.maxtemp_f) + "</b></p>" +
        "<p>" + pickTemp(day.day.mintemp_c, day.day.mintemp_f) + "</p>" +
      "</div>";
  }
  dailySection.classList.remove("hidden");
}

// ====== BUTTON EVENTS ======
searchBtn.addEventListener("click", function () {
  var city = cityInput.value.trim();
  if (city === "") {
    showMessage("Please type a city name.");
    return;
  }
  getWeather(city);
});

// pressing Enter also searches
cityInput.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    searchBtn.click();
  }
});

locationBtn.addEventListener("click", function () {
  if (!navigator.geolocation) {
    showMessage("Your browser does not support location.");
    return;
  }
  showMessage("Getting your location...");
  navigator.geolocation.getCurrentPosition(
    function (position) {
      // WeatherAPI accepts "lat,lon" as the place
      getWeather(position.coords.latitude + "," + position.coords.longitude);
    },
    function () {
      showMessage("Location blocked. Please allow location or search a city.");
    }
  );
});

// quick city buttons
var cityButtons = document.getElementsByClassName("city-btn");
for (var i = 0; i < cityButtons.length; i++) {
  cityButtons[i].addEventListener("click", function () {
    getWeather(this.textContent);
  });
}

// unit buttons
celsiusBtn.addEventListener("click", function () {
  unit = "metric";
  celsiusBtn.classList.add("active");
  fahrenheitBtn.classList.remove("active");
  getWeather(currentCity);
});

fahrenheitBtn.addEventListener("click", function () {
  unit = "imperial";
  fahrenheitBtn.classList.add("active");
  celsiusBtn.classList.remove("active");
  getWeather(currentCity);
});

// pressure unit buttons (hPa / inHg) — re-render the stored value, no refetch
pressureHpaBtn.addEventListener("click", function () {
  pressureUnit = "hPa";
  pressureHpaBtn.classList.add("active");
  pressureInHgBtn.classList.remove("active");
  renderPressure();
});

pressureInHgBtn.addEventListener("click", function () {
  pressureUnit = "inHg";
  pressureInHgBtn.classList.add("active");
  pressureHpaBtn.classList.remove("active");
  renderPressure();
});

// load default city when page opens
getWeather("Lahore");

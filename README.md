# Weather App — Nimbus Weather

A real-time weather web application that fetches and displays live weather data for any city, including temperature, humidity, wind, visibility, pressure, sunrise and sunset.

## Live Demo
https://apiweatherlive.netlify.app/

## Screenshot
![weather-app screenshot](https://image.thum.io/get/width/1200/https://apiweatherlive.netlify.app/)

## Tech Stack
- HTML5
- CSS3
- JavaScript (ES6+)
- OpenWeather REST API
- Google Fonts

## Features
- Live weather search by city, with a loading indicator while data is fetched; press Enter to search, and the search input is focused on page load
- Current conditions, humidity, wind, visibility and pressure
- One-line weather summary under the description (condition, feels-like temperature and humidity), updated with every render
- Copy weather summary button on the weather card: copies a one-line summary (city, condition, feels-like temperature and humidity) to the clipboard, with brief "Copied" feedback
- Sunrise / sunset times
- Responsive, glassmorphism UI
- Recent searches: the last 5 searched cities, saved locally and shown as clickable chips that re-run the search
- Extreme weather alert banner: shown on the weather card only for extreme conditions (heat 40°+, thunderstorms, heavy snow)
- Click a day in the 5-day forecast strip to see that day's high, low and condition in a detail line under the strip
- Temperature trend arrows on each forecast day (↑ rising, ↓ falling, → unchanged vs the previous day's high)
- Wind speed unit toggle: click the wind stat to switch between km/h and mph, saved in localStorage
- Geolocation weather lookup: "Use my location" fetches weather for your current coordinates (in demo mode it falls back gracefully to the demo data)
- Last updated time shown on the weather card, refreshed on each successful search
- Last viewed city: the last successfully loaded city is saved locally and reloaded automatically when the page opens (Lahore on first visit)

## Run Locally
Open `index.html` in a browser, or serve with any static server (e.g. VS Code Live Server).

## Note on API Key
This demo uses a free OpenWeather API key embedded in the front-end code for demonstration purposes only. For production use, keys should be kept server-side and rotated regularly.

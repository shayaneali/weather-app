const API_KEY = 'YOUR_API_KEY_HERE'; // Replace with your OpenWeatherMap API key
  const BASE = 'https://api.openweathermap.org/data/2.5';

  let currentUnit = 'C';
  let weatherData = null;
  let forecastData = null;

  // Weather condition → emoji + bg theme
  const CONDITIONS = {
    '01d': { icon: '☀️', bg: 'clear-day' },
    '01n': { icon: '🌙', bg: 'clear-night' },
    '02d': { icon: '⛅', bg: 'partly-cloudy' },
    '02n': { icon: '☁️', bg: 'partly-cloudy-night' },
    '03d': { icon: '☁️', bg: 'cloudy' },
    '03n': { icon: '☁️', bg: 'cloudy' },
    '04d': { icon: '☁️', bg: 'cloudy' },
    '04n': { icon: '☁️', bg: 'cloudy' },
    '09d': { icon: '🌧️', bg: 'rain' },
    '09n': { icon: '🌧️', bg: 'rain' },
    '10d': { icon: '🌦️', bg: 'rain' },
    '10n': { icon: '🌧️', bg: 'rain' },
    '11d': { icon: '⛈️', bg: 'storm' },
    '11n': { icon: '⛈️', bg: 'storm' },
    '13d': { icon: '❄️', bg: 'snow' },
    '13n': { icon: '❄️', bg: 'snow' },
    '50d': { icon: '🌫️', bg: 'fog' },
    '50n': { icon: '🌫️', bg: 'fog' },
  };

  const BG_GRADIENTS = {
    'clear-day': 'linear-gradient(160deg, #1a6496 0%, #2980b9 40%, #6dd5fa 100%)',
    'clear-night': 'linear-gradient(160deg, #0d1121 0%, #141e30 50%, #243b6e 100%)',
    'partly-cloudy': 'linear-gradient(160deg, #2c7bb6 0%, #4a9fd5 50%, #87ceeb 100%)',
    'partly-cloudy-night': 'linear-gradient(160deg, #141e30 0%, #243b6e 50%, #3a5a9b 100%)',
    'cloudy': 'linear-gradient(160deg, #4a5568 0%, #718096 50%, #9aabbb 100%)',
    'rain': 'linear-gradient(160deg, #1a202c 0%, #2d4a6b 50%, #3a6b8a 100%)',
    'storm': 'linear-gradient(160deg, #0a0e1a 0%, #1a1f3c 50%, #2b2f56 100%)',
    'snow': 'linear-gradient(160deg, #a8c2d8 0%, #c8dce9 50%, #e8f2f8 100%)',
    'fog': 'linear-gradient(160deg, #5a6578 0%, #8a9bab 50%, #b8c8d5 100%)',
  };

  // Generate ambient particles
  function initParticles() {
    const container = document.getElementById('particles');
    container.innerHTML = '';
    for (let i = 0; i < 12; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      const size = Math.random() * 60 + 20;
      p.style.cssText = `
        width: ${size}px; height: ${size}px;
        left: ${Math.random() * 100}%;
        animation-duration: ${Math.random() * 20 + 15}s;
        animation-delay: ${Math.random() * -20}s;
        opacity: ${Math.random() * 0.06 + 0.02};
      `;
      container.appendChild(p);
    }
  }

  function addRain() {
    const container = document.getElementById('particles');
    for (let i = 0; i < 60; i++) {
      const drop = document.createElement('div');
      drop.className = 'rain-drop';
      const h = Math.random() * 60 + 30;
      drop.style.cssText = `
        left: ${Math.random() * 100}%;
        height: ${h}px;
        top: -${h}px;
        animation-duration: ${Math.random() * 0.5 + 0.6}s;
        animation-delay: ${Math.random() * -2}s;
        opacity: ${Math.random() * 0.4 + 0.3};
      `;
      container.appendChild(drop);
    }
  }

  function addSnow() {
    const container = document.getElementById('particles');
    for (let i = 0; i < 40; i++) {
      const flake = document.createElement('div');
      flake.className = 'snow-flake';
      flake.textContent = ['❄', '❅', '❆'][Math.floor(Math.random() * 3)];
      flake.style.cssText = `
        left: ${Math.random() * 100}%;
        font-size: ${Math.random() * 12 + 8}px;
        animation-duration: ${Math.random() * 4 + 3}s;
        animation-delay: ${Math.random() * -5}s;
        top: -20px;
      `;
      container.appendChild(flake);
    }
  }

  function addStars() {
    const container = document.getElementById('particles');
    for (let i = 0; i < 60; i++) {
      const star = document.createElement('div');
      star.className = 'star';
      const size = Math.random() * 2.5 + 1;
      star.style.cssText = `
        width: ${size}px; height: ${size}px;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 60}%;
        animation-duration: ${Math.random() * 3 + 2}s;
        animation-delay: ${Math.random() * -4}s;
      `;
      container.appendChild(star);
    }
  }

  function triggerLightning() {
    const el = document.getElementById('lightning');
    el.classList.add('flash');
    setTimeout(() => el.classList.remove('flash'), 200);
    const next = Math.random() * 8000 + 4000;
    setTimeout(triggerLightning, next);
  }

  let lightningTimer = null;

  function applyBackground(bg) {
    document.body.style.background = BG_GRADIENTS[bg] || BG_GRADIENTS['clear-day'];
    const container = document.getElementById('particles');
    container.innerHTML = '';
    clearTimeout(lightningTimer);

    initParticles();
    if (bg === 'rain') addRain();
    if (bg === 'snow') addSnow();
    if (bg.includes('night')) addStars();
    if (bg === 'storm') {
      addRain();
      addStars();
      triggerLightning();
    }
  }

  function degToDir(deg) {
    const dirs = ['N','NE','E','SE','S','SW','W','NW'];
    return dirs[Math.round(deg / 45) % 8];
  }

  function convertTemp(kelvin, unit) {
    if (unit === 'C') return Math.round(kelvin - 273.15);
    return Math.round((kelvin - 273.15) * 9/5 + 32);
  }

  function formatTime(unix, offset) {
    const d = new Date((unix + offset) * 1000);
    return d.toUTCString().slice(17, 22);
  }

  function formatDay(unix, offset) {
    const d = new Date((unix + offset) * 1000);
    const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    return days[d.getUTCDay()];
  }

  function setUnit(u) {
    currentUnit = u;
    document.getElementById('btnC').classList.toggle('active', u === 'C');
    document.getElementById('btnF').classList.toggle('active', u === 'F');
    if (weatherData) renderWeather();
    if (forecastData) renderForecast();
  }

  function renderWeather() {
    const d = weatherData;
    const t = convertTemp(d.main.temp, currentUnit);
    const fl = convertTemp(d.main.feels_like, currentUnit);
    const icon = d.weather[0].icon;
    const cond = CONDITIONS[icon] || { icon: '🌡️', bg: 'clear-day' };

    document.getElementById('cityName').textContent = d.name;
    document.getElementById('countryName').textContent = d.sys.country;
    document.getElementById('localTime').textContent = formatTime(Math.floor(Date.now()/1000), d.timezone);
    document.getElementById('tempVal').textContent = t;
    document.getElementById('unitLabel').textContent = '°' + currentUnit;
    document.getElementById('feelsVal').textContent = fl + '°' + currentUnit;
    document.getElementById('weatherIcon').textContent = cond.icon;
    document.getElementById('weatherDesc').textContent = d.weather[0].description;

    // Stats
    const h = d.main.humidity;
    document.getElementById('humidity').textContent = h + '%';
    document.getElementById('humidityDesc').textContent = h < 30 ? 'Very dry' : h < 60 ? 'Comfortable' : h < 80 ? 'Humid' : 'Very humid';

    const ws = (d.wind.speed * 3.6).toFixed(1);
    document.getElementById('wind').textContent = ws + ' km/h';
    document.getElementById('windDir').textContent = degToDir(d.wind.deg || 0) + ' direction';

    const vis = (d.visibility / 1000).toFixed(1);
    document.getElementById('visibility').textContent = vis + ' km';
    document.getElementById('visDesc').textContent = d.visibility >= 10000 ? 'Clear' : d.visibility >= 5000 ? 'Moderate' : 'Poor';

    document.getElementById('pressure').textContent = d.main.pressure + ' hPa';
    document.getElementById('pressDesc').textContent = d.main.pressure > 1013 ? 'High pressure' : 'Low pressure';

    document.getElementById('sunrise').textContent = formatTime(d.sys.sunrise, d.timezone);
    document.getElementById('sunset').textContent = formatTime(d.sys.sunset, d.timezone);

    document.getElementById('weatherCard').style.display = 'block';
    applyBackground(cond.bg);
  }

  function renderForecast() {
    const d = forecastData;
    const offset = weatherData?.timezone || 0;
    const strip = document.getElementById('forecastStrip');
    strip.innerHTML = '';

    const daily = {};
    d.list.forEach(item => {
      const day = formatDay(item.dt, offset);
      if (!daily[day]) daily[day] = { highs: [], lows: [], icons: [] };
      daily[day].highs.push(item.main.temp_max);
      daily[day].lows.push(item.main.temp_min);
      daily[day].icons.push(item.weather[0].icon);
    });

    const days = Object.keys(daily).slice(0, 5);
    const today = formatDay(Math.floor(Date.now()/1000), offset);

    days.forEach((day, i) => {
      const info = daily[day];
      const hi = convertTemp(Math.max(...info.highs), currentUnit);
      const lo = convertTemp(Math.min(...info.lows), currentUnit);
      const iconCode = info.icons[Math.floor(info.icons.length / 2)];
      const icon = (CONDITIONS[iconCode] || { icon: '🌡️' }).icon;

      const el = document.createElement('div');
      el.className = 'forecast-item' + (day === today ? ' today' : '');
      el.innerHTML = `
        <div class="f-day">${day === today ? 'Today' : day}</div>
        <div class="f-icon">${icon}</div>
        <div class="f-hi">${hi}°</div>
        <div class="f-lo">${lo}°</div>
      `;
      strip.appendChild(el);
    });

    document.getElementById('forecastCard').style.display = 'block';
  }

  function setLoading(on) {
    document.getElementById('loadingMsg').style.display = on ? 'block' : 'none';
    const btn = document.getElementById('searchBtn');
    if (btn) { btn.disabled = on; btn.textContent = on ? 'Loading…' : 'Search'; }
  }

  async function fetchWeather(city) {
    if (!city) return;
    const err = document.getElementById('errorMsg');
    err.style.display = 'none';
    setLoading(true);

    if (API_KEY === 'YOUR_API_KEY_HERE') {
      showDemo(city);
      setLoading(false);
      return;
    }

    try {
      const [wRes, fRes] = await Promise.all([
        fetch(`${BASE}/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}`),
        fetch(`${BASE}/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}`)
      ]);

      if (!wRes.ok) throw new Error('City not found');

      weatherData = await wRes.json();
      forecastData = await fRes.json();
      renderWeather();
      renderForecast();
    } catch (e) {
      err.style.display = 'block';
      err.textContent = 'City not found. Please try again.';
    } finally {
      setLoading(false);
    }
  }

  function searchWeather() {
    const val = document.getElementById('searchInput').value.trim();
    if (val) fetchWeather(val);
  }

  document.getElementById('searchInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') searchWeather();
  });

  // Demo mode with mock data
  const DEMO_CITIES = {
    lahore: { name: 'Lahore', country: 'PK', tempC: 32, feelsC: 36, humidity: 58, wind: 14, pressure: 1005, vis: 8000, sunrise: '06:15', sunset: '18:42', desc: 'haze', icon: '50d', timezone: 18000 },
    london: { name: 'London', country: 'GB', tempC: 12, feelsC: 9, humidity: 75, wind: 22, pressure: 1012, vis: 10000, sunrise: '06:02', sunset: '19:54', desc: 'overcast clouds', icon: '04d', timezone: 3600 },
    'new york': { name: 'New York', country: 'US', tempC: 18, feelsC: 17, humidity: 62, wind: 18, pressure: 1018, vis: 10000, sunrise: '06:30', sunset: '19:45', desc: 'partly cloudy', icon: '02d', timezone: -14400 },
    tokyo: { name: 'Tokyo', country: 'JP', tempC: 22, feelsC: 24, humidity: 70, wind: 10, pressure: 1015, vis: 10000, sunrise: '05:15', sunset: '18:15', desc: 'light rain', icon: '10d', timezone: 32400 },
    dubai: { name: 'Dubai', country: 'AE', tempC: 38, feelsC: 42, humidity: 45, wind: 16, pressure: 1002, vis: 10000, sunrise: '06:00', sunset: '18:35', desc: 'clear sky', icon: '01d', timezone: 14400 },
    sydney: { name: 'Sydney', country: 'AU', tempC: 20, feelsC: 19, humidity: 55, wind: 25, pressure: 1022, vis: 10000, sunrise: '07:00', sunset: '17:30', desc: 'sunny', icon: '01d', timezone: 36000 },
  };

  function showDemo(city) {
    const key = city.toLowerCase();
    const d = DEMO_CITIES[key] || {
      name: city, country: '??', tempC: 22, feelsC: 21, humidity: 60, wind: 15,
      pressure: 1013, vis: 10000, sunrise: '06:00', sunset: '18:00',
      desc: 'clear sky', icon: '01d', timezone: 0
    };

    const cond = CONDITIONS[d.icon] || { icon: '🌡️', bg: 'clear-day' };
    const t = currentUnit === 'C' ? d.tempC : Math.round(d.tempC * 9/5 + 32);
    const fl = currentUnit === 'C' ? d.feelsC : Math.round(d.feelsC * 9/5 + 32);

    document.getElementById('cityName').textContent = d.name;
    document.getElementById('countryName').textContent = d.country;
    document.getElementById('localTime').textContent = d.sunrise.replace('0', '') + ' AM (local)';
    document.getElementById('tempVal').textContent = t;
    document.getElementById('unitLabel').textContent = '°' + currentUnit;
    document.getElementById('feelsVal').textContent = fl + '°' + currentUnit;
    document.getElementById('weatherIcon').textContent = cond.icon;
    document.getElementById('weatherDesc').textContent = d.desc;

    document.getElementById('humidity').textContent = d.humidity + '%';
    document.getElementById('humidityDesc').textContent = d.humidity < 60 ? 'Comfortable' : 'Humid';
    document.getElementById('wind').textContent = d.wind + ' km/h';
    document.getElementById('windDir').textContent = 'variable';
    document.getElementById('visibility').textContent = (d.vis/1000).toFixed(0) + ' km';
    document.getElementById('visDesc').textContent = d.vis >= 10000 ? 'Clear' : 'Moderate';
    document.getElementById('pressure').textContent = d.pressure + ' hPa';
    document.getElementById('pressDesc').textContent = d.pressure >= 1013 ? 'High pressure' : 'Low pressure';
    document.getElementById('sunrise').textContent = d.sunrise;
    document.getElementById('sunset').textContent = d.sunset;

    document.getElementById('weatherCard').style.display = 'block';

    // Demo forecast
    const days = ['Mon','Tue','Wed','Thu','Fri'];
    const strip = document.getElementById('forecastStrip');
    strip.innerHTML = '';
    const icons = ['01d','02d','10d','04d','01d'];
    days.forEach((day, i) => {
      const hi = d.tempC + Math.round(Math.random() * 6 - 3);
      const lo = hi - Math.round(Math.random() * 8 + 4);
      const hiD = currentUnit === 'C' ? hi : Math.round(hi * 9/5 + 32);
      const loD = currentUnit === 'C' ? lo : Math.round(lo * 9/5 + 32);
      const ic = CONDITIONS[icons[i]] || { icon: '🌡️' };
      const el = document.createElement('div');
      el.className = 'forecast-item' + (i === 0 ? ' today' : '');
      el.innerHTML = `<div class="f-day">${i===0?'Today':day}</div><div class="f-icon">${ic.icon}</div><div class="f-hi">${hiD}°</div><div class="f-lo">${loD}°</div>`;
      strip.appendChild(el);
    });
    document.getElementById('forecastCard').style.display = 'block';
    applyBackground(cond.bg);
  }

  // Init
  initParticles();
  fetchWeather('Lahore');
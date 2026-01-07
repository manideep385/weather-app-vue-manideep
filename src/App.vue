<script setup>
import { ref, onMounted, computed, provide } from 'vue'
import { getWeatherByCity, getWeatherByCoords, getForecastByCity } from './services/weatherService';
import WeatherMap from './components/WeatherMap.vue';
import { watch } from 'vue';
import Forecast from './components/Forecast.vue';
const weather = ref(null);
const loading = ref(true);
const error = ref(null)
const city = ref("Bangalore");
const forecast = ref(null);
const theme = ref("dark")
const coords = ref({
  lat: null,
  lon: null
})

const weatherIconUrl = computed(() => {
  let iconUrl = ''
  if (weather) {
    let icon = weather.value.weather[0].icon
    iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`
  }
  return iconUrl;
})

const searchWeather = async () => {
  error.value = null
  loading.value = true

  try {
    const result = await getWeatherByCity(city.value)
    weather.value = result
    forecast.value = await getForecastByCity(city.value)

    coords.value = {
      lat: result.coord.lat,
      lon: result.coord.lon
    }
  } catch (e) {
    error.value = "City not found. Please try again."
  } finally {
    loading.value = false
  }
}

const getWeatherByLocation = async () => {
  loading.value = true
  error.value = null

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords

      coords.value = {
        lat: latitude,
        lon: longitude
      }

      const result = await getWeatherByCoords(latitude, longitude)
      weather.value = result
      city.value = result.name
      forecast.value = await getForecastByCity(result.name)

      loading.value = false
    },
    () => {
      loading.value = false
      searchWeather()
    }
  )
}

let debounceTimer = null
const debouncedSearch = () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    if (city.value.trim()) {
      searchWeather()
    }
  }, 600);
}
onMounted(() => {
  getWeatherByLocation()
})
const toggleTheme = () => {
  theme.value = theme.value === "dark" ? "light" : "dark"
}
provide("theme", theme)
provide("toggleTheme", toggleTheme)

watch(theme, (newTheme) => {
  document.body.setAttribute("data-theme", newTheme)
  localStorage.setItem("theme", newTheme)
}, { immediate: true })

const savedTheme = localStorage.getItem("theme")
if (savedTheme) {
  theme.value = savedTheme
}

const weatherHighlights = computed(() => {
  if (!weather.value) return null

  return [
    { label: "Min Temp", value: `${weather.value.main.temp_min} °C`, icon: "🌡️" },
    { label: "Max Temp", value: `${weather.value.main.temp_max} °C`, icon: "🔥" },
    { label: "Humidity", value: `${weather.value.main.humidity}%`, icon: "💧" },
    { label: "Wind", value: `${weather.value.wind.speed} m/s`, icon: "🌬️" },
    { label: "Clouds", value: `${weather.value.clouds.all}%`, icon: "☁️" },
  ]
})

const hourlyForecast = computed(() => {
  if (!forecast.value) return []

  return forecast.value.list.slice(0, 8).map(item => ({
    time: item.dt_txt,
    temp: item.main.temp,
    icon: item.weather[0].icon,
    description: item.weather[0].description,
  }))
})
</script>

<template>
  <button class="theme-toggle" @click="toggleTheme">
    {{ theme === "dark" ? "☀️ Light" : "🌙 Dark" }}
  </button>

  <div class="search-div">
    <input v-model="city" @keyup.enter="searchWeather" @input="debouncedSearch" class="input-box" />
    <button :disabled="loading" @click="searchWeather"> {{ loading ? "Loading..." : "Search" }}</button>
  </div>
  <Transition name="fade">
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <div>Fetching weather...</div>
    </div>
  </Transition>
  <Transition name="fade">
    <div v-if="error" class="error">
      {{ error }}
    </div>
  </Transition>
  <Transition name="fade-slide" mode="out-in">
    <div v-if="weather && !error && !loading" key="weather">

      <div class="current-weather">
        <div class="img-div">
          <img v-if="weatherIconUrl" :src="weatherIconUrl" alt="" weather icon />
        </div>

        <div class="weather-info">
          <h1>{{ city }}</h1>
          <p>{{ weather.main.temp }} °C</p>
          <p>{{ weather.weather[0].description }}</p>
        </div>
      </div>
     <TransitionGroup name="stagger" tag="div" v-if="weatherHighlights" class="highlights">
        <div v-for="item in weatherHighlights" :key="item.label" class="highlight-card">
          <div class="highlight-icon">{{ item.icon }}</div>
          <div class="highlight-label">{{ item.label }}</div>
          <div class="highlight-value">{{ item.value }}</div>
        </div>
      </TransitionGroup>
      <div v-if="hourlyForecast.length" class="hourly-section">
        <h3 class="section-title">Hourly Forecast</h3>

        <div class="hourly-list">
          <div v-for="(hour, index) in hourlyForecast" :key="index" class="hourly-card">
            <div class="hour-time">
              {{ new Date(hour.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }}
            </div>

            <img class="hour-icon" :src="`https://openweathermap.org/img/wn/${hour.icon}@2x.png`" alt="weather icon" />

            <div class="hour-temp">
              {{ hour.temp }} °C
            </div>
          </div>
        </div>
      </div>

    </div>
  </Transition>
  <!-- <div v-else>No data avilable</div> -->

  <Forecast v-if="forecast && !error" :forecast="forecast" />
  <WeatherMap v-if="coords.lat && coords.lon && !error" :lat="coords.lat" :lon="coords.lon" />

</template>

<style>
.current-weather {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  margin-bottom: 30px;
  margin-right: 100px;
}

@media (max-width: 768px) {
  .current-weather {
    flex-direction: column;
    margin-right: 0;
    gap: 16px;
  }
}

.weather-info h1 {
  margin: 0;
  font-size: 28px;
}

@media (max-width: 768px) {
  .weather-info h1 {
    font-size: 24px;
  }
}

.weather-info .temp {
  font-size: 36px;
  font-weight: bold;
}

.weather-info .desc {
  font-size: 16px;
  opacity: 0.8;
  text-transform: capitalize;
}

button {
  border-radius: 8px;
  border: 1px solid var(--btn-border);
  padding: 0.6em 1.2em;
  font-size: 1em;
  font-weight: 500;
  font-family: inherit;
  background-color: var(--btn-bg);
  color: var(--btn-text);
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s;
}

.input-box {
  padding: 0.75rem;
  border-radius: 10px;
  width: 90%;
  max-width: 350px;
}

.search-div {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  gap: 1rem;
  flex-wrap: wrap;
  margin-top: 10px;
}

@media (max-width: 480px) {
  .search-div {
    flex-direction: column;
    width: 100%;
  }

  .input-box {
    max-width: 100%;
  }

  .search-div button {
    width: 100%;
    max-width: 300px;
  }
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  margin: 40px 0;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 4px solid rgba(255, 255, 255, 0.2);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.theme-toggle {
  position: absolute;
  top: 16px;
  right: 16px;
  padding: 6px 10px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
}

@media (max-width: 480px) {
  .theme-toggle {
    top: 10px;
    right: 10px;
    padding: 4px 8px;
    font-size: 0.85em;
  }
}

.highlights {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 16px;
  margin: 30px auto;
  max-width: 900px;
  padding: 0 10px;
}

@media (max-width: 768px) {
  .highlights {
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 12px;
  }
}

@media (max-width: 480px) {
  .highlights {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
}

.highlight-card {
  background: var(--card-bg);
  padding: 18px 16px;
  border-radius: 16px;
  text-align: center;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.15);
}


.highlight-icon {
  font-size: 28px;
  margin-bottom: 10px;
}

.highlight-label {
  font-size: 13px;
  opacity: 0.65;
  letter-spacing: 0.4px;
}

.highlight-value {
  font-size: 20px;
  font-weight: 600;
  margin-top: 6px;
}

.highlight-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.25);
}

.highlights {
  margin: 40px auto;
}

.img-div {
  background-color: var(--btn-border);
  border-radius: 20px;
}

.hourly-section {
  margin: 40px auto;
  max-width: 900px;
  padding: 0 10px;
}

@media (max-width: 768px) {
  .hourly-section {
    margin: 30px auto;
  }
}

.section-title {
  margin-bottom: 12px;
  font-size: 18px;
}

.hourly-list {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 8px;
}

.hourly-card {
  min-width: 90px;
  background: var(--card-bg);
  border-radius: 16px;
  padding: 14px 10px;
  text-align: center;
  flex-shrink: 0;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

@media (max-width: 480px) {
  .hourly-card {
    min-width: 80px;
    padding: 10px 8px;
  }
}

.hourly-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
}


.hour-time {
  font-size: 12px;
  opacity: 0.65;
  margin-bottom: 4px;
}

.hour-temp {
  font-size: 16px;
  font-weight: 600;
  margin-top: 4px;
}


.hour-icon {
  width: 48px;
  height: 48px;
}

.hourly-list {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 8px;
  scroll-behavior: smooth;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.35s ease;
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(12px);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}

.stagger-enter-active {
  transition: opacity 0.35s ease, transform 0.35s ease;
}

.stagger-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

.stagger-enter-to {
  opacity: 1;
  transform: translateY(0);
}
.stagger-enter-active {
  transition: opacity 0.4s ease, transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}


</style>

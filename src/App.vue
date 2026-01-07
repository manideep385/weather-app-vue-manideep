<script setup>
import { ref, onMounted, computed,provide } from 'vue'
import { getWeatherByCity, getWeatherByCoords, getForecastByCity } from './services/weatherService';
import { watch } from 'vue';
import Forecast from './components/Forecast.vue';
const weather = ref(null);
const loading = ref(true);
const error = ref(null)
const city = ref("Bangalore");
const forecast = ref(null);
const theme = ref("dark")

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
  weather.value = null
  loading.value = true
  try {
    weather.value = await getWeatherByCity(city.value)
    forecast.value = await getForecastByCity(city.value)
  } catch (e) {
    console.log(error)
    error.value = "City not found. Please try again."
  } finally {
    loading.value = false
  }
}

const getWeatherByLocation = async () => {
  loading.value = true;
  error.value = null
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords
      weather.value = await getWeatherByCoords(latitude, longitude)
      forecast.value = await getForecastByCity(city.value)
      loading.value = false
    },
    (geoError) => {
      error.value = "Location access denied.showing city weather"
      loading.value = false
      searchWeather()
    }
  )
}

let  debounceTimer = null
const  debouncedSearch =()=>{
  clearTimeout(debounceTimer)
  debounceTimer=setTimeout(() => {
    if(city.value.trim()){
      searchWeather()
    }
  }, 600);
}
onMounted(() => {
  getWeatherByLocation()
})
const toggleTheme = ()=>{
  theme.value= theme.value === "dark" ? "light" :"dark"
}
provide("theme",theme)
provide("toggleTheme",toggleTheme)

watch(theme,(newTheme)=>{
document.body.setAttribute("data-theme",newTheme)
localStorage.setItem("theme",newTheme)
},{immediate:true})

const savedTheme = localStorage.getItem("theme")
if(savedTheme){
  theme.value = savedTheme
}
</script>

<template>
  <button class="theme-toggle" @click="toggleTheme">
  {{ theme === "dark" ? "☀️ Light" : "🌙 Dark" }}
</button>

   <div class="search-div">
  <input v-model="city" @keyup.enter="searchWeather" @input="debouncedSearch" class="input-box"/>
  <button :disabled="loading" @click="searchWeather">  {{ loading ? "Loading..." : "Search" }}</button>
  </div>
  <div v-if="loading" class="loading">
  <div class="spinner"></div>
  <div>Fetching weather...</div>
</div>
  <div v-else-if="error">{{ error }}</div>
  <div class="current-weather" v-else-if="weather">
    <img v-if="weatherIconUrl" :src="weatherIconUrl" alt="" weather icon />
    <div class="weather-info">
      <h1>{{ city }}</h1>
      <p>{{ weather.main.temp }} °C</p>
      <p>{{ weather.weather[0].description }}</p>
    </div>
  </div>
  <div v-else>No data avilable</div>
  <Forecast v-if="forecast && !error" :forecast="forecast" />
</template>

<style >
.current-weather {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  margin-bottom: 30px;
  margin-right:100px;
}

.weather-info h1{
  margin : 0;
  font-size: 28px;
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
.input-box{
 padding: 0.75rem;
 border-radius: 10px;
}
.search-div{
 display: flex;
 align-items: center;
 justify-content: center;
 padding: 10px;
 gap: 1rem;
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


</style>

<script setup>
import { computed } from 'vue';
const props = defineProps({
    forecast: Object
})
const groupedForecast = computed(() => {
    const groups = {}
    if (!props.forecast || !props.forecast.list) {
        return groups
    }
    props.forecast.list.forEach((item) => {
        const date = item.dt_txt.split(" ")[0]
        if (!groups[date]) {
            groups[date] = []
        }
        groups[date].push(item)
    })
    return groups
})
const dailyForecast = computed(() => {
    const result = []

    const groups = groupedForecast.value

    for (const date in groups) {
        const dayItems = groups[date]

        if (!dayItems || dayItems.length === 0) continue

        const firstItem = dayItems[0]

        result.push({
            date,
            temp: firstItem.main.temp,
            description: firstItem.weather[0].description,
            icon: firstItem.weather[0].icon,
        })
    }

    return result
})
const formatDate = (dateStr)=>{
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US",{
        weekday:"short",
        month:"short",
        day:"numeric"
    })
}
</script>

<template>
    <div>
        <h3>5-Day Forecast</h3>
        <div class="forecast-align">
            <div class="forecast-card" v-for="day in dailyForecast" :key="day.date">
                <div>{{ formatDate(day.date) }}</div>
                <div class="img-div">
                <img :src="`https://openweathermap.org/img/wn/${day.icon}@2x.png`" alt="weather icon" />
                </div>
                <div>{{ Math.round(day.temp) }} °C</div>
                <div>{{ day.description }}</div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.forecast-align {
    display: flex;
    gap: 10px;
    justify-content: center;
    flex-wrap: wrap;
    padding: 0 10px;
}
.forecast-card {
  background: var(--card-bg);
  padding: 10px;
  border-radius: 8px;
  text-align: center;
  min-width: 120px;
  flex: 1 1 120px;
  max-width: 150px;
}
.img-div{
  background-color: var(--btn-border);
  border-radius: 20px;
}

@media (max-width: 768px) {
  .forecast-align {
    gap: 8px;
  }
  
  .forecast-card {
    min-width: 100px;
    flex: 1 1 100px;
    max-width: 130px;
    padding: 8px;
  }
}

@media (max-width: 480px) {
  .forecast-align {
    overflow-x: auto;
    flex-wrap: nowrap;
    justify-content: flex-start;
    padding-bottom: 8px;
  }
  
  .forecast-card {
    min-width: 90px;
    flex: 0 0 90px;
  }
}
</style>
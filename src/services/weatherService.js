import axios from "axios";
export const baseURL = "https://api.openweathermap.org/data/2.5"
const api = axios.create({
    baseURL: baseURL
})
export const getWeatherByCity = async(city) => {
    const response = await api.get("https://api.openweathermap.org/data/2.5/weather", {
        params: {
            q: city,
            appid: import.meta.env.VITE_WEATHER_API_KEY,
            units: "metric"
        }
    })
    return response.data
}

export const getWeatherByCoords = async(lat, lon) => {
    const response = await api.get("/weather", {
        params: {
            lat,
            lon,
            appid: import.meta.env.VITE_WEATHER_API_KEY,
            units: "metric"
        }
    })
    return response.data
}

export const getForecastByCity = async (city) =>{
    const response = await api.get("/forecast",{
       params:{ 
        q:city,
        units:"metric",
        appid:import.meta.env.VITE_WEATHER_API_KEY
       }
    })
    return response.data
}
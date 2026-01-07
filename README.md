# Vue Weather Application

This is a weather application built using **Vue 3 (Composition API)** and **Vite**.

The app allows users to:
- View current weather conditions
- Search weather by city
- Automatically detect current location
- View hourly and 5-day forecasts
- See weather location on an interactive map
- Switch between dark and light themes
- Use the app seamlessly on mobile, tablet, and desktop

This README is intended to help developers understand the project structure,
setup, and internal logic.

## 🛠️ Tech Stack

This project uses the following technologies:

### Frontend
- **Vue 3**  
  Used with the Composition API for better logic reuse, clearer state management,
  and improved scalability compared to the Options API.

- **Vite**  
  Provides fast development startup, instant hot module replacement, and
  optimized production builds.

### Styling
- **CSS (custom, no framework)**  
  Custom CSS is used to maintain full control over responsiveness, theming
  (dark/light mode), and layout without adding extra dependencies.

### APIs & Data
- **OpenWeather API**  
  Used to fetch:
  - Current weather
  - Hourly forecast
  - 5-day forecast
  - Weather by geographic coordinates

### Maps
- **Leaflet.js**  
  Used to display an interactive map showing the weather location.
  OpenStreetMap tiles are used as the map source.

### Other
- **Browser Geolocation API**  
  Used to detect the user’s current location (with permission) and show
  weather data automatically on first load.


## ⚙️ Project Setup

Follow the steps below to run the project locally.

### 1. Clone the repository

```bash
git clone <repository-url>
cd vue-weather

## 📁 Project Structure

The project follows a simple and modular structure:

```text
src/
├── components/
│   ├── Forecast.vue        # 5-day weather forecast component
│   └── WeatherMap.vue      # Leaflet map component
│
├── services/
│   └── weatherService.js   # API calls to OpenWeather
│
├── App.vue                 # Main application component
├── main.js                 # App entry point
│
└── assets/                 # Static assets (icons, images if added later)


## 🔄 Application Flow

This section explains how data flows through the application.

### Initial Load (On App Mount)

1. When the app loads, it attempts to get the user's current location
   using the browser's Geolocation API.
2. If location access is granted:
   - Latitude and longitude are sent to the weather API.
   - Current weather and forecast data are fetched using coordinates.
3. If location access is denied:
   - The app falls back to a default city search.
   - Weather data is fetched using the city name.

### Searching by City

1. The user enters a city name in the search input.
2. A debounced search is triggered to avoid excessive API calls.
3. The following data is fetched:
   - Current weather for the city
   - Hourly forecast
   - 5-day forecast
4. The UI updates automatically based on the response.

### Data Rendering

- **Current Weather**  
  Displays city name, temperature, weather description, and icon.

- **Highlights Section**  
  Displays additional weather details such as:
  - Min / Max temperature
  - Wind speed
  - Humidity
  - Cloud coverage

- **Hourly Forecast**  
  Displays upcoming weather in 3-hour intervals using horizontal scroll.

- **Forecast Component**  
  Displays grouped daily forecast data.

- **Map Component**  
  Updates the map center and marker whenever the weather location changes.

## ⚡ State Management & Reactivity

The application uses Vue 3’s **Composition API** with `ref` and `computed`
for state management.

### Key Reactive States

- `weather`  
  Holds current weather data.

- `forecast`  
  Holds forecast data used for daily and hourly views.

- `city`  
  Stores the current city input.

- `loading`  
  Controls loading indicators and disabled states.

- `error`  
  Stores error messages when API requests fail.

- `theme`  
  Stores the current theme (`dark` or `light`) and is shared using
  Vue’s `provide` / `inject`.

### Computed Properties

- Weather icon URL
- Weather highlights data
- Hourly forecast data (derived from forecast API response)

This approach keeps logic predictable and easy to debug.

## 🌙☀️ Theming (Dark / Light Mode)

The app supports dark and light themes using CSS variables.

### How it works

- Theme state is stored in a reactive `theme` variable.
- Theme is shared across components using `provide` / `inject`.
- The selected theme is applied to the `<body>` using a `data-theme` attribute.
- The theme preference is persisted in `localStorage`.

### Benefits

- No external CSS framework required
- Easy to extend with more themes
- Consistent styling across components

## 🌐 API Layer

All API calls are centralized in `services/weatherService.js`.

### Available API Methods

- `getWeatherByCity(city)`
- `getWeatherByCoords(lat, lon)`
- `getForecastByCity(city)`

### Why this approach?

- Keeps API logic separate from UI
- Easier to maintain and refactor
- Simplifies error handling and testing

## 🚨 Error Handling & Loading States

- All API calls are wrapped in `try/catch`.
- User-friendly error messages are shown when:
  - City is not found
  - Network request fails
- Loading indicators are displayed while fetching data.
- Search and actions are disabled during loading to prevent duplicate requests.

## 📱 Responsiveness

The application is fully responsive and optimized for:

- Mobile devices
- Tablets
- Desktop screens

### Techniques Used

- Mobile-first CSS
- Flexbox and CSS Grid
- Media queries for layout adjustments
- Scrollable hourly forecast for smaller screens
- Responsive map height based on screen size

## 🗺️ Map Integration

The app uses **Leaflet.js** to display an interactive map.

### Features

- Map centers on the current weather location
- Marker updates automatically on city search
- Responsive map sizing
- OpenStreetMap tiles are used as the data source

## ⚠️ Known Limitations

- API rate limits depend on the OpenWeather free tier.
- Weather data accuracy depends on the API provider.
- Map requires an active internet connection.

## 🚀 Future Improvements

- Weather alerts and rain probability indicators
- Animated transitions between states
- Map tile theming based on dark/light mode
- TypeScript migration
- Unit switching (°C / °F)

## 📝 Development Notes

- This project prioritizes clarity and maintainability.
- Logic is intentionally kept simple and explicit.
- No heavy UI frameworks are used to keep bundle size minimal.

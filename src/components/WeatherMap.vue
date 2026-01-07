<script setup>
import { onMounted, watch, nextTick } from "vue"
import L from "leaflet"

const props = defineProps({
  lat: Number,
  lon: Number,
})

let map
let marker

onMounted(async () => {
  await nextTick()

map = L.map("map").setView([props.lat, props.lon], 12)


  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
  }).addTo(map)

  map.invalidateSize()
})
watch(
  () => ({ lat: props.lat, lon: props.lon }),
  ({ lat, lon }) => {
    if (lat == null || lon == null || !map) return

    const coords = [lat, lon]
    map.setView(coords, 12)

    if (marker) {
      marker.setLatLng(coords)
    } else {
      marker = L.marker(coords).addTo(map)
    }

    map.invalidateSize()
  },
  { immediate: true }
)


</script>



<template>
  <div id="map" class="map-container"></div>
</template>

<style scoped>
.map-container {
  height: 300px;
  width: 100%;
  margin: 20px 0;
  border-radius: 8px;
}

@media (max-width: 768px) {
  .map-container {
    height: 250px;
    margin: 15px 0;
  }
}

@media (max-width: 480px) {
  .map-container {
    height: 200px;
    margin: 10px 0;
    border-radius: 6px;
  }
}
</style>
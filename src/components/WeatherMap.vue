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

function animateMarker(marker, from, to, duration = 500) {
    const startTime = performance.now()

    function animate(time) {
        const progress = Math.min((time - startTime) / duration, 1)

        const lat = from.lat + (to.lat - from.lat) * progress
        const lon = from.lng + (to.lng - from.lng) * progress

        marker.setLatLng([lat, lon])

        if (progress < 1) {
            requestAnimationFrame(animate)
        }
    }

    requestAnimationFrame(animate)
}


watch(
  () => [props.lat, props.lon],
  ([lat, lon]) => {
    if (!lat || !lon || !map) return

    const coords = [lat, lon]

    map.flyTo(coords, 12, {
      animate: true,
      duration: 0.6,
    })

    if (!marker) {
      marker = L.marker(coords).addTo(map)
    } else {
      const from = marker.getLatLng()
      const to = { lat, lng: lon }
      animateMarker(marker, from, to, 600)
    }
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
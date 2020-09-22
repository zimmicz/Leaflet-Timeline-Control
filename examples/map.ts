import L from 'leaflet';
import '../src/index';
import '../node_modules/leaflet/dist/leaflet.css';

const BASE_LAYER = L.tileLayer( 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
});

const map = L.map('map', {
    center: [50, 19],
    zoom: 15,
});

const timelineControl = L.control.timeline({
    autoplay: false,
    position: 'bottomleft',
    onNextStep: (cur) => console.log(cur),
    interval: 1000,
    button: {
        pausedText: 'Play',
        playingText: 'Pause',
    },
    timeline: {
        dateFormat: 'yyyy-MM-dd',
        renderSlot: () => document.createElement('h5'),
        renderActiveSlot: () => document.createElement('h1'),
        range: [new Date('2020-09-01'), new Date('2020-09-10')],
        step: {
            day: 1,
        },
    },
});

map.addLayer(BASE_LAYER);
map.addControl(timelineControl);

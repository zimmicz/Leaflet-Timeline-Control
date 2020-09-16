import L from 'leaflet';
import TimelineControl from '../src/index';
import '../node_modules/leaflet/dist/leaflet.css';

const BASE_LAYER = L.tileLayer( 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
});

const map = L.map('map', {
    center: [50, 19],
    zoom: 15,
});

const timelineControl = new TimelineControl({
    autoplay: false,
    position: 'bottomleft',
    onNextStep: (cur) => console.log(cur),
    interval: 1000,
    button: {
        pausedText: 'Přehrát',
        playingText: 'Zastavit',
    },
    timeline: {
        dateFormat: 'yyyy-MM-dd',
        range: [new Date('2020-09-01'), new Date('2020-09-10'), new Date('2020-09-20')],
        step: {
            day: 1,
        },
    },
});

map.addLayer(BASE_LAYER);
map.addControl(timelineControl);

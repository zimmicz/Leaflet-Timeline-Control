# Leaflet Timeline Control

Examples
--
[CodeSandbox](https://codesandbox.io/s/leaflet-timeline-control-ibyby)

Installation
--

```
npm install "leaflet.timeline.control"
```

Import
--
```
import 'leaflet.timeline.control';
```
Control will be available as `L.control.timeline`.

Configuration
--

Here's the overview of the available control options (all of the standard `L.Control` options are accepted as well):

|Option   | Type  | Default  |
|---|---|---|
|  autoplay | boolean  | false  |
| button | { pausedText: string, playingText: string, render: () => HTMLElement } |    undefined |
|timeline   | { dateFormat: string, renderSlot: () => HTMLElement, renderActiveSlot: () => HTMLElement, range: Date[], step: Luxon.DurationObjectUnits }   | undefined  |
| interval | number | undefined
| onNextStep | (current: Date) => void | undefined

Plugin is written in TypeScript, here's the interface used to configure the control.

```
export type Tuple<T> = [T, T];
export type ArrayOfThreeOrMore<T> = [T, T, T, ...T[]];
export type HTMLElementOrNull = HTMLElement | void;

type Range = {
  range: Tuple<Date>;
  step: DurationObjectUnits;
} | {
  range: ArrayOfThreeOrMore<Date>;
};

interface TimelineOptions extends L.ControlOptions {
    autoplay?: boolean;
    button?: {
      pausedText?: string;
      playingText?: string;
      render?: () => HTMLElementOrNull;
    };
    timeline: {
      dateFormat: string;
      renderSlot?: () => HTMLElement;
      renderActiveSlot?: () => HTMLElement;
    } & Range;
    interval: number;
    onNextStep: (current: Date) => void;
}
```

Usage
--

```
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
```
![CI](https://github.com/zimmicz/Leaflet-Timeline-Control/workflows/CI/badge.svg?branch=master)

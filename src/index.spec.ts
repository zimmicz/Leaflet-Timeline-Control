import * as L from 'leaflet';
import '.';

jest.useFakeTimers();

let map: L.Map;
let timeline: L.Control.Timeline;
let options: L.Control.TimelineOptions;

describe('Timeline', () => {
  beforeAll(() => {
    map = L.map(document.createElement('div'));
  });

  beforeEach(() => {
    options = {
      autoplay: false,
      interval: 1000,
      onNextStep: jest.fn(),
      timeline: {
        dateFormat: 'yyyy.LL.dd',
        range: [new Date('2020-01-01'), new Date('2020-01-05')],
        step: {
          day: 1,
        },
      },
    };
  });

  afterEach(() => {
    map.removeControl(timeline);
  });

  it('is added to the map', () => {
    timeline = L.control.timeline(options);
    map.addControl(timeline);

    const slots = map.getContainer().querySelectorAll('[data-date]');
    expect(slots).toHaveLength(5);
    expect(slots.item(0).innerHTML).toEqual('2020.01.01');
    expect(slots.item(2).innerHTML).toEqual('2020.01.03');
    expect(slots.item(4).innerHTML).toEqual('2020.01.05');
  });

  it('renders custom slot', () => {
    const localOptions = {...options};
    localOptions.timeline.renderSlot = () => document.createElement('h1');

    timeline = L.control.timeline(options);
    map.addControl(timeline);

    const slots = map.getContainer().querySelectorAll('[data-date]');
    expect(slots.item(0).nodeName).toEqual('H1');
    expect(slots.item(2).nodeName).toEqual('H1');
    expect(slots.item(4).nodeName).toEqual('H1');
  });

  it('renders custom active slot', () => {
    const localOptions = {...options};
    localOptions.timeline.renderActiveSlot = () => document.createElement('h1');
    localOptions.timeline.renderSlot = () => document.createElement('h2');

    timeline = L.control.timeline(options);
    map.addControl(timeline);

    const slots = map.getContainer().querySelectorAll('[data-date]');
    expect([...slots].filter(slot => slot.nodeName === 'H1')).toHaveLength(1);
    expect([...slots].filter(slot => slot.nodeName === 'H2')).toHaveLength(4);
  });

  it('renders range without step definition', () => {
    const localOptions = {...options};

    if ('step' in localOptions.timeline) {
      delete localOptions.timeline.step;
    }

    localOptions.timeline.range = [new Date('2020-01-01'), new Date('2020-01-05'), new Date('2020-01-10')];
    timeline = L.control.timeline(localOptions);
    map.addControl(timeline);

    const slots = map.getContainer().querySelectorAll('[data-date]');
    expect(slots).toHaveLength(3);
    expect(slots.item(0).innerHTML).toEqual('2020.01.01');
    expect(slots.item(1).innerHTML).toEqual('2020.01.05');
    expect(slots.item(2).innerHTML).toEqual('2020.01.10');
  });

  it('calls onNextStep callback', () => {
    timeline = L.control.timeline(options);
    map.addControl(timeline);

    const slots = map.getContainer().querySelectorAll('[data-date]');
    slots.item(0).dispatchEvent(new Event('click'));
    slots.item(2).dispatchEvent(new Event('click'));

    expect(options.onNextStep).toHaveBeenCalledTimes(2);
    expect((<jest.Mock>options.onNextStep).mock.calls[0][0]).toEqual(options.timeline.range[0]);
    expect((<jest.Mock>options.onNextStep).mock.calls[1][0]).toEqual(new Date('2020-01-03'));
  });

  it('plays timeline', () => {
    const localOptions = {
      ...options,
      autoplay: true,
      button: {
        pausedText: 'Play',
        playingText: 'Pause',
      },
    };
    timeline = L.control.timeline(localOptions);
    map.addControl(timeline);

    const button = map.getContainer().querySelector('.leaflet-timeline-control__button');

    jest.advanceTimersByTime(5000);
    expect(localOptions.onNextStep).toHaveBeenCalledTimes(5);
    button.dispatchEvent(new Event('click'));
    jest.advanceTimersByTime(5000);
    expect(localOptions.onNextStep).toHaveBeenCalledTimes(5);
  });
});

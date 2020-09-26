import * as L from 'leaflet';
import { DateTime, Duration, Interval } from 'luxon';
import { TupleRange } from './types.d';
import './style.css';

const CSS_ACTIVE_SLOT_CLASS = 'leaflet-timeline-control__slot--active';
const CSS_BUTTON_CLASS = 'leaflet-timeline-control__button';
const CSS_CONTROL_CLASS = 'leaflet-timeline-control';
const CSS_SLOT_CLASS = 'leaflet-timeline-control__slot';
const CSS_TIMELINE_CLASS = 'leaflet-timeline-control__timeline';

class TimelineControl extends L.Control {

  button: HTMLElement;
  container: HTMLElement;
  currentStep: DateTime;
  map: L.Map;
  options: L.Control.TimelineOptions;
  steps: DateTime[];
  timer: NodeJS.Timeout;

  constructor(options: L.Control.TimelineOptions) {
    super(options);

    this.steps = this.createSteps();
    this.currentStep = this.steps[0];
  }

  onAdd(map: L.Map): HTMLElement {
    this.map = map;
    const { autoplay } = this.options;

    if (autoplay) {
      this.createTimer();
    }

    this.container = this.renderDefault(map);
    this.button = this.renderButton();
    this.renderSlots();

    return this.container;
  }

  onRemove(): void {
    this.destroyTimer();
  }

  private renderDefault(map: L.Map): HTMLElement {
    return L.DomUtil.create('div', CSS_CONTROL_CLASS, map.getContainer());
  }

  private renderButton(): HTMLElement | null {
    const { button } = this.options;

    if (!button) {
      return;
    }

    const { pausedText, playingText, render } = button;
    const buttonElement: HTMLElement = render ? <HTMLElement>render() : L.DomUtil.create('button', CSS_BUTTON_CLASS);

    this.container.appendChild(buttonElement);
    buttonElement.innerHTML = this.timer ? playingText: pausedText;
    buttonElement.addEventListener('click', () => {
      this.timer ? this.destroyTimer() : this.createTimer();
      buttonElement.innerHTML = this.timer ? playingText: pausedText;
    });

    return buttonElement;
  }

  private handleSlotClick (slot: HTMLElement, step: DateTime) {
    const { onNextStep } = this.options;
    const slots = document.querySelectorAll('[data-date]');
    slots.forEach(item => item.classList.remove(CSS_ACTIVE_SLOT_CLASS));
    slot.classList.add(CSS_ACTIVE_SLOT_CLASS);
    this.currentStep = step;
    onNextStep(this.currentStep.toJSDate());
    this.renderSlots();
    this.destroyTimer();
  }

  private renderSlots(): void {
    const { dateFormat } = this.options.timeline;
    const timeline = this.container.querySelector(`.${CSS_TIMELINE_CLASS}`) || L.DomUtil.create('div', CSS_TIMELINE_CLASS);
    this.container.appendChild(timeline);
    timeline.innerHTML = '';

    this.steps.forEach((step: DateTime, i) => {
      const slot = this.renderSlot(step);
      timeline.appendChild(slot);
      slot.dataset.date = `${i}`;
      slot.innerHTML = step.toFormat(dateFormat);
    });
  }

  /*
   * @param step: DateTime
   *
   * Creates slot element:
   * - if renderActiveSlot callback is defined, use this to render active slot
   * - if renderActiveSlot callback is not defined, but renderSlot callback is, use that to render active slot
   * - if renderSlot is defined, use this to render slot
   * - if none of the two is provided, default to <div>
   */
  private renderSlot(step: DateTime): HTMLElement {
    const { renderActiveSlot, renderSlot } = this.options.timeline;
    let slot: HTMLElement;

    if (step === this.currentStep) {
      const fn = renderActiveSlot || renderSlot;
      slot = fn ? fn() : L.DomUtil.create('div', `${CSS_SLOT_CLASS} ${CSS_ACTIVE_SLOT_CLASS}`);
    } else {
      slot = renderSlot ? renderSlot() : L.DomUtil.create('div', CSS_SLOT_CLASS);
    }

    slot.addEventListener('click', () => this.handleSlotClick(slot, step));

    return slot;
  }

  private createTimer(): void {
    const { interval, onNextStep } = this.options;

    this.timer = setInterval(() => {
      const currentIndex = this.steps.findIndex(step => step === this.currentStep);
      const nextIndex = currentIndex < this.steps.length - 1 ? currentIndex + 1 : 0;
      this.currentStep = this.steps[nextIndex];
      this.renderSlots();
      onNextStep(this.currentStep.toJSDate());
    }, interval);
  }

  private destroyTimer(): void {
    clearTimeout(this.timer);
    this.timer = null;

    if (this.button) {
      const { pausedText } = this.options.button;
      this.button.innerHTML = pausedText;
    }
  }

  private createSteps(): DateTime[] {
    const { range } = this.options.timeline;

    if (range.length > 2) {
      return range.map(date => DateTime.fromJSDate(date));
    }

    const { step } = <TupleRange>this.options.timeline;

    const [start, end] = range;
    const interval = Interval.fromDateTimes(start, end);
    const equalIntervals = interval.splitBy(Duration.fromObject(step));

    const steps = equalIntervals
      .reduce((accum, value) => {
        accum.add(value.start);
        accum.add(value.end);
        return accum;
      }, new Set<DateTime>());

    return Array.from(steps);
  }
}

L.Control.Timeline = TimelineControl;

L.control.timeline = (opts: L.Control.TimelineOptions) => new L.Control.Timeline(opts);

export default L.control.timeline;

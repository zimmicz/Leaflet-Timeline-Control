import * as L from 'leaflet';
import { DateTime, Duration, DurationObjectUnits, Interval } from 'luxon';
import './style.css';

const CSS_ACTIVE_SLOT_CLASS = 'leaflet-timeline-control__slot--active';
const CSS_BUTTON_CLASS = 'leaflet-timeline-control__button';
const CSS_CONTROL_CLASS = 'leaflet-timeline-control';
const CSS_SLOT_CLASS = 'leaflet-timeline-control__slot';
const CSS_TIMELINE_CLASS = 'leaflet-timeline-control__timeline';

type Tuple<T> = [T, T];
type ArrayOfThreeOrMore<T> = [T, T, T, ...T[]];
type HTMLElementOrNull = HTMLElement | void;

interface TimelineOptions extends L.ControlOptions {
    autoplay?: boolean;
    button?: {
        pausedText?: string;
        playingText?: string;
        render?: () => HTMLElementOrNull;
    };
    timeline: {
        dateFormat: string;
        range: Tuple<Date> | ArrayOfThreeOrMore<Date>;
        renderSlot?: () => HTMLElement;
        renderActiveSlot?: () => HTMLElement;
        step?: DurationObjectUnits;
    };
    interval: number;
    onNextStep: (current: Date) => void;
};

class TimelineControl extends L.Control {

    button: HTMLElementOrNull;
    container: HTMLElement;
    currentStep: DateTime;
    map: L.Map;
    options: TimelineOptions;
    steps: DateTime[];
    timer: number;

    constructor(options: TimelineOptions) {
        options.button = options.button || {};
        options.button.pausedText = 'PLAY';
        options.button.playingText = 'PAUSE';

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

        return this.container;
    }

    onRemove(): void {
        this.destroyTimer();
    }

    private renderDefault(map: L.Map): HTMLElement {
        const container = L.DomUtil.create('div', CSS_CONTROL_CLASS, map.getContainer());
        this.button = this.renderButton(container);
        this.renderSlots(container);

        return container;
    }

    private renderButton(container: HTMLElement): HTMLElementOrNull {
        const { button } = this.options;

        if (!button) {
            return;
        }

        const { pausedText, playingText, render } = button;
        let buttonElement: HTMLElementOrNull;

        if (render) {
            buttonElement = render();
        } else {
            buttonElement = L.DomUtil.create('button', CSS_BUTTON_CLASS);
        }

        if (!buttonElement) {
            return;
        }

        container.appendChild(buttonElement);
        buttonElement.innerHTML = this.timer ? playingText: pausedText;
        buttonElement.addEventListener('click', () => {
            this.timer ? this.destroyTimer() : this.createTimer();
            (<HTMLElement>buttonElement).innerHTML = this.timer ? playingText: pausedText;
        });

        return buttonElement;
    }

    private renderSlots(container: HTMLElement): void {
        const { dateFormat } = this.options.timeline;
        const timeline = container.querySelector(`.${CSS_TIMELINE_CLASS}`) || L.DomUtil.create('div', CSS_TIMELINE_CLASS);
        container.appendChild(timeline);
        timeline.innerHTML = '';

        const handleSlotClick = (slot: HTMLElement) => {
            const slots = document.querySelectorAll('[data-date]');
            slots.forEach(item => item.classList.remove(CSS_ACTIVE_SLOT_CLASS));
            slot.classList.add(CSS_ACTIVE_SLOT_CLASS);
            this.currentStep = this.steps.find((step: DateTime) => step.toFormat(dateFormat) === slot.dataset.date);
            this.destroyTimer();
        };

        this.steps.forEach((step: DateTime) => {
            const slot = this.renderSlot(step);
            timeline.appendChild(slot);
            slot.dataset.date = step.toFormat(dateFormat);
            slot.innerHTML = step.toFormat(dateFormat);
            slot.addEventListener('click', () => handleSlotClick(slot));
        });
    }

    private renderSlot(step: DateTime): HTMLElement {
        const { renderActiveSlot, renderSlot } = this.options.timeline;
        let slot: HTMLElement;

        if (step === this.currentStep) {
            slot = renderActiveSlot ? renderActiveSlot() : L.DomUtil.create('div', `${CSS_SLOT_CLASS} ${CSS_ACTIVE_SLOT_CLASS}`);
        } else {
            slot = renderSlot ? renderSlot() : L.DomUtil.create('div', CSS_SLOT_CLASS);
        }

        return slot;
    }

    private createTimer(): void {
        const { interval, onNextStep } = this.options;

        this.timer = setInterval(() => {
            const currentIndex = this.steps.findIndex(step => step === this.currentStep);
            const nextIndex = currentIndex < this.steps.length - 1 ? currentIndex + 1 : 0;
            this.currentStep = this.steps[nextIndex];
            this.renderSlots(this.map.getContainer().querySelector(`.${CSS_CONTROL_CLASS}`));
            onNextStep(this.currentStep.toJSDate());
        }, interval);
    }

    private destroyTimer(): void {
        const { pausedText } = (<TimelineOptions>this.options).button;
        clearTimeout(this.timer);
        this.timer = null;

        if (this.button) {
            this.button.innerHTML = pausedText;
        }
    }

    private createSteps(): DateTime[] {
        const { range, step } = (<TimelineOptions>this.options).timeline;

        if (range.length > 2) {
            return range.map(date => DateTime.fromJSDate(date));
        }

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

export default TimelineControl;

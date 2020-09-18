import { DurationObjectUnits } from 'luxon';

export type Tuple<T> = [T, T];
export type ArrayOfThreeOrMore<T> = [T, T, T, ...T[]];
export type HTMLElementOrNull = HTMLElement | void;

type Range = {
    range: Tuple<Date>;
    step: DurationObjectUnits;
} | {
    range: ArrayOfThreeOrMore<Date>;
};

declare module 'leaflet' {
    namespace Control {
        class Timeline extends Control { }
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
    }

    namespace control {
        /**
         * Creates a Leaflet.Timeline control
         */
        function timeline(options: Control.TimelineOptions): Control.Timeline;
    }
}

import { useCallback, useEffect, useRef, useState } from 'react';

/** Base delay between steps at 1x speed (ms). */
const BASE_DELAY = 1100;

/**
 * Step playback controller. `count` is the number of recorded steps.
 * All timers are cleaned up on unmount and whenever playback stops.
 */
export function usePlayback(count: number) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const timer = useRef<number | undefined>(undefined);

  const stopTimer = () => {
    if (timer.current !== undefined) window.clearTimeout(timer.current);
    timer.current = undefined;
  };

  useEffect(() => {
    stopTimer();
    if (!playing) return;
    if (index >= count - 1) {
      setPlaying(false);
      return;
    }
    timer.current = window.setTimeout(() => setIndex((i) => Math.min(i + 1, count - 1)), BASE_DELAY / speed);
    return stopTimer;
  }, [playing, index, count, speed]);

  const reset = useCallback((startIndex = 0, autoplay = false) => {
    setIndex(startIndex);
    setPlaying(autoplay);
  }, []);
  const play = useCallback(() => {
    setIndex((i) => (i >= count - 1 ? 0 : i));
    setPlaying(true);
  }, [count]);
  const pause = useCallback(() => setPlaying(false), []);
  const next = useCallback(() => {
    setPlaying(false);
    setIndex((i) => Math.min(i + 1, count - 1));
  }, [count]);
  const prev = useCallback(() => {
    setPlaying(false);
    setIndex((i) => Math.max(i - 1, 0));
  }, []);
  const goTo = useCallback(
    (i: number) => {
      setPlaying(false);
      setIndex(Math.max(0, Math.min(i, count - 1)));
    },
    [count],
  );
  const restart = useCallback(() => {
    setIndex(0);
    setPlaying(true);
  }, []);

  return { index: Math.min(index, Math.max(count - 1, 0)), playing, speed, setSpeed, play, pause, next, prev, goTo, restart, reset };
}

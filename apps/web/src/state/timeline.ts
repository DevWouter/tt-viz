import { Observable, BehaviorSubject, combineLatest, map } from "rxjs";

interface TimelineState {
  /**
   * 1 = Play at 1 second per frame forward
   * 0 = Pause
   * -2 = Rewind at 2 seconds per second.
   */
  speed: number;

  /**
   * The current time in seconds. Can never go lower than 0 zero.
   * 0.001 = 1ms
   * 1.000 = 1 second
   * 22.45 = 22 seconds and 450 ms.
   */
  seconds: number;
}

interface ITimeline {
  get state$(): Observable<TimelineState>;
  play();
  pause();
  setTime(seconds: number);
}

class TimelineImpl implements ITimeline {

  private readonly _speed: BehaviorSubject<number>;
  private readonly _seconds: BehaviorSubject<number>;

  get state$(): Observable<TimelineState> {
    return combineLatest([
      this._speed,
      this._seconds,
    ]).pipe(map(([
      speed,
      seconds
    ]) => ({
      speed,
      seconds
    })));
  }

  constructor() {
    this._speed = new BehaviorSubject(0);
    this._seconds = new BehaviorSubject(0);
    var _lastFrame = performance.now();

    setInterval(() => {
      const currentFrame = performance.now();
      const realMs =  currentFrame - _lastFrame;
      const simMs = this._speed.getValue() * realMs;
      this._seconds.next(this._seconds.getValue() + simMs);

      _lastFrame = currentFrame;
    });
  }

  play() {
    this._speed.next(1);
  }

  pause() {
    this._speed.next(0);
  }

  setTime(seconds: number) {
    this._seconds.next(seconds);
  }
}

export const Timeline: ITimeline = new TimelineImpl();
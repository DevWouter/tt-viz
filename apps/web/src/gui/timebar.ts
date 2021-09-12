import { Line, Container } from "@babylonjs/gui";

interface GuiTimebarMarker {
  line: Line;
  time: number;
  isVisible: boolean;
  isLarge: boolean;
}

export class GuiTimebar {
  /**
   * The current time, always positive.
   */
  private _currentTime = 0;

  /**
   * The amount of milliseconds it will try to display.
   */
  private _duration = 10_000; // The amount of time shown

  private _markers: GuiTimebarMarker[] = [];

  constructor(
    private readonly panel: Container,
  ) {
  }

  update(deltaSeconds: number) {
    const startTime = this._currentTime - (this._duration / 2);

    this.allocateMarkers(Math.ceil(this._duration / 100));

    const startCurrentBarTime = Math.ceil(startTime / 100) * 100;
    console.log({ startTime, startCurrentBarTime });

    for (var i = 0; i < this._markers.length; ++i) {
      const currentBarTime = startCurrentBarTime + (i * 100);
      const isBeforeZero = currentBarTime < 0;
      this._markers[i].time = currentBarTime;
      this._markers[i].isVisible = !isBeforeZero;
      this._markers[i].isLarge = (currentBarTime % 1000) == 0
    }

    const panel_width = this.getPanelWidth();
    const panel_height = this.getPanelHeight();

    const offsetPer1ms = (panel_width / this._duration);

    // Update the GUI element.
    for (var i = 0; i < this._markers.length; ++i) {
      const marker = this._markers[i];
      const markerXPos = marker.time - startTime;

      marker.line.x1 = Math.floor(markerXPos * offsetPer1ms);
      marker.line.x2 = marker.line.x1;

      marker.line.isVisible = marker.isVisible;
      marker.line.y1 = marker.isLarge ? 0 : panel_height * 0.5;
      marker.line.y2 = panel_height;
    }
  }

  setTime(time: number) {
    this._currentTime = Math.max(0, time);
  }

  setDuration(duration: number) {
    this._duration = duration;
  }

  private allocateMarkers(amount: number): void {
    while (this._markers.length < amount) {
      var line = new Line(undefined);
      line.color = "red";
      line.lineWidth = 2;
      this.panel.addControl(line);

      this._markers.push({
        isLarge: false,
        isVisible: false,
        line: line,
        time: 0
      });
    }
  }

  getPanelWidth(): number {
    return this.panel.widthInPixels;
  }
  getPanelHeight(): number {
    return this.panel.heightInPixels;
  }
}
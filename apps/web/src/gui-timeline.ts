import {
  AdvancedDynamicTexture,
  Button,
  StackPanel,
  TextBlock,
  Control,
  Container,
  Line,
} from "@babylonjs/gui";
import { distinctUntilChanged, map, take, timestamp } from "rxjs";
import { Timeline } from "./state/timeline";

export class GuiTimeline {

  private _currentTime: number | "live" = "live";
  private _timeResolution: number = 100; // Every second is 100px.

  constructor(
    private readonly gui: AdvancedDynamicTexture,
  ) {
    const btn_toStart = Button.CreateSimpleButton("btn_toStart", "⏮");
    const btn_play = Button.CreateSimpleButton("btn_play", "▶");
    const btn_pause = Button.CreateSimpleButton("btn_play", "⏸");
    const btn_zoomOut = Button.CreateSimpleButton("btn_zoomOut", "-");
    const txt_zoom = new TextBlock("txt_zoom", "🔎");
    const btn_zoomIn = Button.CreateSimpleButton("btn_zoomIn", "+");

    var buttonControls: Control[] = [
      btn_toStart,
      btn_play,
      btn_pause,
      btn_zoomOut,
      txt_zoom,
      btn_zoomIn,
    ];

    const stack_buttons = new StackPanel("stack_buttons");
    stack_buttons.height = "30px";
    stack_buttons.isVertical = false;

    buttonControls.forEach(ctrl => {
      ctrl.paddingLeft = "1px";
      ctrl.paddingRight = "1px";
      ctrl.width = "30px";
      ctrl.height = "30px";
      if (ctrl.typeName == "Button") {
        (ctrl as Button).background = "white";
      }
      stack_buttons.addControl(ctrl);
    });

    const container_timebar = new Container("container_timebar");
    container_timebar.background = "black";
    container_timebar.width = "100%";
    container_timebar.height = "100px";

    const stack_v = new StackPanel("stack_v");
    stack_v.verticalAlignment = StackPanel.VERTICAL_ALIGNMENT_BOTTOM;
    stack_v.addControl(stack_buttons);
    stack_v.addControl(container_timebar);

    Timeline.state$.pipe(
      map(x => x.seconds),
      take(5),
      // distinctUntilChanged(),
    ).subscribe(() => {
      container_timebar.clearControls();
      for (var px = 0; px < container_timebar.widthInPixels; px += this._timeResolution) {
        const line = new Line(`line_` + px);
        line.x1 = px;
        line.x2 = px;
        line.y1 = 2;
        line.y2 = container_timebar.heightInPixels - 4;
        line.color = "red";
        container_timebar.addControl(line);

        const timeSeconds = new TextBlock("text_" + px, `${(px / 1000)}`);
        timeSeconds.left = px;
        timeSeconds.widthInPixels = this._timeResolution;
        timeSeconds.heightInPixels = container_timebar.heightInPixels / 2;
        timeSeconds.color = "red";
        timeSeconds.textHorizontalAlignment = TextBlock.HORIZONTAL_ALIGNMENT_LEFT;
        timeSeconds.horizontalAlignment = TextBlock.HORIZONTAL_ALIGNMENT_LEFT;
        container_timebar.addControl(timeSeconds);
      }
    });

    gui.addControl(stack_v);
  }
}
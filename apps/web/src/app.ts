import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";

import { AdvancedDynamicTexture, Button } from "@babylonjs/gui";
import { Timeline } from "./state/timeline";

import {
  Scene,
  Engine,
  ArcRotateCamera,
  Vector3,
  SceneLoader,
  HemisphericLight,
  Mesh,
  ShadowGenerator,
  SpotLight
} from "@babylonjs/core";
import { GuiTimeline } from "./gui-timeline";

class App {
  constructor() {
    // create the canvas html element and attach it to the webpage
    var canvas = document.createElement("canvas");
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.id = "gameCanvas";
    document.body.appendChild(canvas);

    // initialize babylon scene and engine
    var engine = new Engine(canvas, true);
    var scene = new Scene(engine);

    var camera: ArcRotateCamera = new ArcRotateCamera("Camera", 0.5, 0.5, 4.5, Vector3.Zero(), scene);

    camera.attachControl(canvas, true);
    var light2 = new SpotLight("spotlight", new Vector3(0, 10, 0), Vector3.Down(), Math.PI / 3, 0.0001, scene);
    var light1: HemisphericLight = new HemisphericLight("light1", new Vector3(1, 1, 0), scene);

    var gui = AdvancedDynamicTexture.CreateFullscreenUI("GUI", true, scene);
    var guiTimeline = new GuiTimeline(gui);

    var shadowGenerator = new ShadowGenerator(1024, light2);
    shadowGenerator.filter = ShadowGenerator.FILTER_PCSS;
    shadowGenerator.filteringQuality = ShadowGenerator.QUALITY_HIGH;

    SceneLoader.ImportMesh("", "/models/", "table-tennis-table.glb", scene,
      (meshes, _ps, _sk, _ag, tn) => {
        tn.find(x => x.name.toLowerCase() == "sun")?.dispose();
        tn.find(x => x.name.toLowerCase() == "camera")?.dispose();
        meshes.forEach(m => shadowGenerator.addShadowCaster(m));
      },
      () => { },
      (sc, msg, er) => console.log("Error loading", { sc, msg, er }),
    );

    const ground = Mesh.CreateGround("ground", 20, 20, 1, scene);
    ground.receiveShadows = true;


    // hide/show the Inspector
    window.addEventListener("keydown", (ev) => {
      // Shift+Alt+I
      if (ev.shiftKey && !ev.ctrlKey && ev.altKey && ev.key === "I") {
        if (scene.debugLayer.isVisible()) {
          scene.debugLayer.hide();
        } else {
          scene.debugLayer.show();
        }
      }
    });

    // Resize the render screen when the window resizes.
    window.addEventListener("resize", function () {
      engine.resize();
      Timeline.setTime(0);
    });

    // run the main render loop
    engine.runRenderLoop(() => {
      scene.render();
    });
  }
}
new App();

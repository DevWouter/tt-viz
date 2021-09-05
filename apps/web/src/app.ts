import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";

import { Scene, Engine, ArcRotateCamera, Vector3, SceneLoader, HemisphericLight, Mesh, MeshBuilder } from "@babylonjs/core";

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

    var camera: ArcRotateCamera = new ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2, 2, Vector3.Zero(), scene);

    camera.attachControl(canvas, true);
    var light1: HemisphericLight = new HemisphericLight("light1", new Vector3(1, 1, 0), scene);

    SceneLoader.ImportMesh("", "/models/", "table-tennis-table.glb", scene,
      () => { console.log("Success loading"); },
      (ev) => { console.log("Loading...", ev); },
      (sc, msg, er) => console.log("Error loading", { sc, msg, er }),
    );


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
    });

    // run the main render loop
    engine.runRenderLoop(() => {
      scene.render();
    });
  }
}
new App();

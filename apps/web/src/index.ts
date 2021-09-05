import { Scene, Engine, ArcRotateCamera, Vector3, SceneLoader } from "babylonjs";

const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
const engine = new Engine(
  canvas,
  true,
  {
    preserveDrawingBuffer: true,
    stencil: true,
    disableWebGL2Support: false
  }
);

const scene = new Scene(engine);

const camera = new ArcRotateCamera("camera", 1, 1, 1, new Vector3(0, 0, 0), scene, true);

scene.addCamera(camera);
SceneLoader.ImportMesh("", "/assets/", "table-tennis-table.glb", scene,
  () => { console.log("Success loading"); },
  (ev) => { console.log("Loading..."); },
  (sc, msg, er) => console.log("Error loading", { sc, msg, er }),
);

window.addEventListener("resize", function () {
  engine.resize();
});

engine.runRenderLoop(() => {
  scene.render();
});


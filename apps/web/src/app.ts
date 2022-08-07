import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";

import { AdvancedDynamicTexture, Button } from "@babylonjs/gui";

import {
  Scene,
  Engine,
  ArcRotateCamera,
  Vector3,
  SceneLoader,
  HemisphericLight,
  Mesh,
  ShadowGenerator,
  SpotLight,
  PointerEventTypes,
  StandardMaterial,
  Color3,
  AbstractMesh,
  PointerDragBehavior,
  Path3D,
  Curve3
} from "@babylonjs/core";

interface IBallPlacement {
  /**
   * The mesh representing the placed ball.
   * - Contains position
   */
  mesh: AbstractMesh;

  /**
   * The path the ball followed before it arrives here
   */
  approachTrajectory: IBallTrajectory;

  /**
   * The path the ball followed after
   */
  exitTrajectory: IBallTrajectory;
}

interface IBallTrajectory {
  /**
   * The ball from which the path is drawn
   */
  startBall: IBallPlacement;
  /**
   * The ball placement where the path ends
   */
  endBall: IBallPlacement;

  /**
   * The 3D path that the ball follows
   */
  path: Path3D;

  /**
   * The mesh that represnets the path.
   */
  pathMesh: AbstractMesh;
}


class App {
  constructor() {

    var ballTracker: AbstractMesh[] = [];
    var ballLines: AbstractMesh[] = [];

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
    // camera.pinchPrecision = 0.01;
    // camera.pinchDeltaPercentage = 0.01;
    camera.inertia = 0.01;
    var light2 = new SpotLight("spotlight", new Vector3(0, 10, 0), Vector3.Down(), Math.PI / 3, 0.0001, scene);
    var light1: HemisphericLight = new HemisphericLight("light1", new Vector3(1, 1, 0), scene);

    var gui = AdvancedDynamicTexture.CreateFullscreenUI("GUI", true, scene);
    var clearButton = Button.CreateSimpleButton("btn_clear", "Clear");
    clearButton.width = "100px";
    clearButton.height = "20px";
    clearButton.left = 0;
    clearButton.top = 0;
    clearButton.onPointerClickObservable.add(() => {
      ballTracker.forEach(x => scene.removeMesh(x));
      ballLines.forEach(x => scene.removeMesh(x));
      ballTracker = [];
      ballLines = [];
    });
    gui.addControl(clearButton);


    var shadowGenerator = new ShadowGenerator(1024, light2);
    shadowGenerator.filter = ShadowGenerator.FILTER_PCSS;
    shadowGenerator.filteringQuality = ShadowGenerator.QUALITY_HIGH;

    var hitableMeshNames: string[] = [
      "Side A_primitive0", // Table (without lines)
      "Side A_primitive1", // Table (lines-only)
      "Side A_primitive2", // Sides
      "Side B_primitive0", // Table (without lines)
      "Side B_primitive1", // Table (lines-only)
      "Side B_primitive2", // Sides
      "Net",
      "Post A",
      "Post B",
      "ground"
    ];


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
    var material = new StandardMaterial("mat_ground", scene);
    material.diffuseColor = new Color3(0.49, 0.25, 0);
    ground.material = material;



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

    // Balls that were placed before.

    scene.onPointerObservable.add((evData, evState) => {
      if (evData.type == PointerEventTypes.POINTERTAP && evData.pickInfo?.hit) {
        if (hitableMeshNames.includes(evData.pickInfo.pickedMesh!.name)) {
          var mesh = Mesh.CreateSphere(`ball_${ballTracker.length + 1}`, 32, 0.04, scene);
          mesh.position = evData.pickInfo.pickedPoint!;

          // Offset the ball
          var offset = evData.pickInfo.getNormal(true, true)!.normalizeToNew();
          offset = offset.scale(0.02); // Calculate the offset
          console.log(offset);

          mesh.position = mesh.position.add(offset)
          mesh.addBehavior(new PointerDragBehavior({ dragPlaneNormal: Vector3.Up() }))
          ballTracker.push(mesh);

          if (ballTracker.length >= 2) {
            var startPos = ballTracker[ballTracker.length - 2].position;
            var endPos = ballTracker[ballTracker.length - 1].position;
            var path = new Path3D([startPos, endPos]);
            var m = Mesh.CreateLines("", path.getPoints(), scene);
            ballLines.push(m);
          }
        }
      }

    });

    var _lastFrame = performance.now();
    var deltaTimeMs = 0;
    // run the main render loop
    engine.runRenderLoop(() => {

      const currentFrame = performance.now();
      deltaTimeMs = currentFrame - _lastFrame;
      _lastFrame = currentFrame;

      scene.render();
    });
  }
}
new App();

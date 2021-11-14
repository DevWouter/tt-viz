import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";

import {
  Scene,
  Engine,
  Vector3,
  SceneLoader,
  Mesh,
  ShadowGenerator,
  PointerEventTypes,
  StandardMaterial,
  Color3,
  PointerDragBehavior,
  UniversalCamera,
  MeshBuilder,
  Matrix,
  CascadedShadowGenerator,
  DirectionalLight,
  PBRMaterial,
  AbstractMesh,
  ShadowLight,
} from "@babylonjs/core";
import { Graph, PathNode } from "./Graph";

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

interface CameraView {
  rotation: number; // The rotation
  height: number;
  distance: number;
}

const cameraTarget = new Vector3(0, 0.76, 0);
const CAM_ROT_STEP = 12.5;


interface InputTrigger {
  shiftKey?: boolean;
  ctrlKey?: boolean;
  altKey?: boolean;
  key: string; // Single character uppercase
  action(): void;
}

class App {
  _scene: Scene;
  _engine: Engine;
  _graph: Graph = { nodes: [], edges: [] };
  private _camera!: UniversalCamera;
  private _cameraView: CameraView = {
    rotation: 0,
    distance: 3,
    height: 6,
  };
  private _ballMaterial!: PBRMaterial;

  private _shadowLights: ShadowLight[] = [];
  private _shadowGenerators: ShadowGenerator[] = [];

  constructor() {
    // create the canvas html element and attach it to the webpage
    var canvas = document.createElement("canvas");
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.id = "gameCanvas";
    document.body.appendChild(canvas);

    // initialize babylon scene and engine
    this._engine = new Engine(canvas, true, {
      antialias: true,
      useHighPrecisionFloats: true
    });

    let firstFrame = true;
    this._engine.runRenderLoop(() => {
      if (firstFrame) {
        this._engine.resize();
        firstFrame = false;
      }
      this._scene.render();
    });

    this._scene = new Scene(this._engine);

    // Generate ball material
    this._ballMaterial = new PBRMaterial("ball", this._scene);
    this._ballMaterial.albedoColor = Color3.FromHexString("#FFFEFE");
    this._ballMaterial.emissiveColor = Color3.FromHexString('#2B2B2B');
    this._ballMaterial.metallic = 0;
    this._ballMaterial.roughness = 0.3;


    var inputs: InputTrigger[] = [];
    inputs.push({
      key: "D",
      action: () => {
        this._scene.debugLayer.isVisible() ? this._scene.debugLayer.hide() : this._scene.debugLayer.show();
      },
    });

    inputs.push({
      key: "I",
      action: () => {
        this._cameraView.distance = Math.max(this._cameraView.distance - 0.1, 0.8);
        this.updateCameraPos();
      }
    });

    inputs.push({
      key: "K",
      action: () => {
        this._cameraView.distance = Math.min(this._cameraView.distance + 0.1, 10);
        this.updateCameraPos();
      }
    });

    inputs.push({
      key: "H",
      action: () => {
        this._cameraView.height = Math.max(this._cameraView.height - 0.1, 0.8);
        this.updateCameraPos();
      }
    });

    inputs.push({
      key: "Y",
      action: () => {
        this._cameraView.height = Math.min(this._cameraView.height + 0.1, 10);
        this.updateCameraPos();
      },
    });

    inputs.push({
      key: "J",
      action: () => {
        this._cameraView.rotation = (this._cameraView.rotation + CAM_ROT_STEP) % 360;
        this.updateCameraPos();
      },
    });

    inputs.push({
      key: "L",
      action: () => {
        this._cameraView.rotation = (this._cameraView.rotation + (360 - CAM_ROT_STEP)) % 360;
        this.updateCameraPos();
      },
    });


    window.addEventListener("resize", () => { this._engine.resize(); });
    window.addEventListener("keydown", (ev) => {
      var validInputs = inputs.filter(x =>
        (x.altKey ?? false) == ev.altKey &&
        (x.ctrlKey ?? false) == ev.ctrlKey &&
        (x.shiftKey ?? false) == ev.shiftKey &&
        x.key.toUpperCase() == ev.key.toUpperCase()
      );
      if (validInputs.length === 0) return;
      validInputs[0].action();
    });


    this._scene.onPointerObservable.add((evData) => {
      this._scene.meshes.forEach(x => x.renderOutline = false);
      if (evData.pickInfo) {
        var pickingInfo = this._scene.pickWithRay(evData.pickInfo.ray!, m => m.name.startsWith("[ball-node]"))
        if (pickingInfo?.pickedMesh) {
          pickingInfo.pickedMesh.renderOutline = true;
        }
      }

      if (!evData.pickInfo?.hit) return;
      if (evData.type != PointerEventTypes.POINTERTAP) return;
      if (!hitableMeshNames.includes(evData.pickInfo.pickedMesh!.name)) return;

      var position = evData.pickInfo.pickedPoint!;
      var offset = evData.pickInfo.getNormal(true, true)!.normalizeToNew();
      position.addInPlace(offset.scale(0.02));
      this.addBallPosition(position);
    });

    this.loadScene();
  }

  private updateCameraPos() {
    var pos2d = new Vector3(0, this._cameraView.height, this._cameraView.distance);
    var eular = (this._cameraView.rotation / 360) * (2 * Math.PI);
    var rotMatrix = Matrix.RotationY(eular);
    var newPos = Vector3.TransformCoordinates(pos2d, rotMatrix);

    this._camera.position = newPos;
    this._camera.setTarget(cameraTarget);
  }

  addBallPosition(position: Vector3) {
    const pathNode: PathNode = { position };
    // Add the new node.
    this._graph.nodes.push(pathNode);

    if (this._graph.nodes.length > 1) {
      // Also create the edge
      var from = this._graph.nodes[this._graph.nodes.length - 2];
      var to = this._graph.nodes[this._graph.nodes.length - 1];
      this._graph.edges.push({ from, to })
    }

    // Add the mesh
    var mesh = Mesh.CreateSphere("[ball-node]", 32, 0.04, this._scene);
    mesh.position = position;
    mesh.material = this._ballMaterial;

    var dragBehaviour = new PointerDragBehavior({ dragPlaneNormal: Vector3.Up() });
    dragBehaviour.onDragObservable.add(ev => {
      pathNode.position = ev.dragPlanePoint;
      mesh.position = ev.dragPlanePoint;
      this.updatePaths();
    });
    dragBehaviour.onDragEndObservable.add((ev) => {
      pathNode.position = ev.dragPlanePoint;
      mesh.position = ev.dragPlanePoint;
      this.updatePaths();
    });

    mesh.addBehavior(dragBehaviour);
    this.onMeshAddedToScene(mesh);
    this.updatePaths();
  }

  updatePaths() {
    var existingEdges = this._scene.meshes.filter(x => x.name.startsWith("[ball-edge]"));

    existingEdges.forEach(x => {
      x.dispose();
    });

    this._graph.edges.forEach(edge => {

      var path: Vector3[] = [];

      path.push(edge.from.position);
      for (var i = 0; i < 30; ++i) {
        var distanceMidpoint = Math.abs(i - 16) / 16;
        const pos = Vector3.Lerp(edge.from.position, edge.to.position, (1 / 30) * i);
        pos.y += 0.2 * (1 - distanceMidpoint); // Rise and lower the center.
        path.push(pos);
      }
      path.push(edge.to.position);

      const mesh = MeshBuilder.CreateTube("[ball-edge]", {
        path,
        radiusFunction: (i, distance) => {
          var x = Math.abs(i - 16) / 16
          return 0.01 * (1 - x);
        },
      }, this._scene);

      this.onMeshAddedToScene(mesh);
    });

  }

  loadScene() {
    // Setup camera
    this._camera = new UniversalCamera("Camera", new Vector3(0, 8, 2), this._scene);
    this._camera.minZ = 0.001;
    this._camera.maxZ = 40;
    this._camera.setTarget(cameraTarget);

    this.updateCameraPos();

    // Setup lights and shadows
    var mainLight = new DirectionalLight("Light", Vector3.Down(), this._scene);
    mainLight.intensity = 3;

    const mainShadowGenerator = new CascadedShadowGenerator(1024, mainLight, true);
    mainShadowGenerator.autoCalcDepthBounds = true;
    mainShadowGenerator.autoCalcDepthBoundsRefreshRate = 1;
    mainShadowGenerator.shadowMaxZ = 10; // Really small Z range since table tennis is about small objects.
    mainShadowGenerator.contactHardeningLightSizeUVRatio = 0.006; // Use hard shadows since we only have a single light.
    mainShadowGenerator.lambda = 0.67; // Prefer closer shadowmap 
    mainShadowGenerator.penumbraDarkness = 0.5; // Make shadows of the penumbra harder
    mainShadowGenerator.filter = ShadowGenerator.FILTER_PCSS;
    mainShadowGenerator.filteringQuality = ShadowGenerator.QUALITY_HIGH;
    this._shadowLights.push(mainLight);
    this._shadowGenerators.push(mainShadowGenerator);

    // Surround lights
    const surroundRatio = 0.5;
    const surroundLightsConfig = [
      { name: "lightForward", direction: Vector3.Lerp(Vector3.Down(), Vector3.Forward(), surroundRatio) },
      { name: "lightBackward", direction: Vector3.Lerp(Vector3.Down(), Vector3.Backward(), surroundRatio) },
      { name: "lightLeft", direction: Vector3.Lerp(Vector3.Down(), Vector3.Left(), surroundRatio) },
      { name: "lightRight", direction: Vector3.Lerp(Vector3.Down(), Vector3.Right(), surroundRatio) },
    ];

    surroundLightsConfig.forEach(config => {
      var light = new DirectionalLight(config.name, config.direction, this._scene);
      light.intensity = 0.5;
      this._shadowLights.push(light);

      const generator = new ShadowGenerator(1024, light, false);
      generator.filter = ShadowGenerator.FILTER_PCSS;
      generator.filteringQuality = ShadowGenerator.QUALITY_LOW;
      this._shadowGenerators.push(generator);
    });

    // Load level 
    SceneLoader.ImportMesh("", "/models/", "table-tennis-table.glb", this._scene,
      (meshes, _ps, _sk, _ag, tn) => {
        tn.find(x => x.name.toLowerCase() == "sun")?.dispose();
        tn.find(x => x.name.toLowerCase() == "camera")?.dispose();
        var rootMesh = meshes.find(x => x.name == "__root__");
        if (!rootMesh) throw new Error("No root mesh was found");
        this.onMeshAddedToScene(rootMesh);
        meshes.forEach(m => {
          if (m.isAnInstance) return;
          m.receiveShadows = true;
        });
      },
      () => { },
      (sc, msg, er) => console.log("Error loading", { sc, msg, er }),
    );

    // Add a floor
    const ground = Mesh.CreateGround("ground", 20, 20, 1, this._scene);
    ground.receiveShadows = true;
    var material = new StandardMaterial("mat_ground", this._scene);
    material.diffuseColor = new Color3(0.49, 0.25, 0);
    material.specularColor = new Color3(0.1, 0.1, 0.1);
    ground.material = material;

  }

  onMeshAddedToScene(mesh: AbstractMesh) {
    this._shadowGenerators.forEach(shadowGenerator => {
      shadowGenerator.addShadowCaster(mesh, true);
    });
  }
}
new App();

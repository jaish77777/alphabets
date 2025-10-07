import { createIsland } from "./island.js";
import { LETTERS } from "./data/letters.js";
import { setupMaterials } from "./materials.js";
import { setupInteractivity, setupSceneInteractivity } from "./interactivity.js";

const SOUND_LETTERS = ["A", "B", "C", "D"]; // Letters with sound

export async function createScene(engine, canvas) {
  const scene = new BABYLON.Scene(engine);

  // --- Camera Setup ---
  const cameraTarget = new BABYLON.Vector3(0, 2, 0);
  const camera = new BABYLON.ArcRotateCamera(
    "camera",
    Math.PI / 2,
    Math.PI / 3,
    90,
    cameraTarget,
    scene
  );
  camera.attachControl(canvas, true);
  camera.lowerBetaLimit = 0.5;
  camera.upperBetaLimit = Math.PI / 2.1;
  camera.lowerRadiusLimit = 30;
  camera.upperRadiusLimit = 90;
  camera.panningSensibility = 0;
  camera.wheelDeltaPercentage = 0.01;
  camera.inertia = 0.9;
  camera.lowerAlphaLimit = 0;
  camera.upperAlphaLimit = Math.PI * 2;

  // --- Lighting ---
  const light = new BABYLON.HemisphericLight(
    "light",
    new BABYLON.Vector3(0, 1, 0),
    scene
  );
  light.intensity = 1.3;

  // --- Sky & Fog ---
  scene.clearColor = new BABYLON.Color3(0.6, 0.8, 1.0);
  scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;
  scene.fogColor = scene.clearColor;
  scene.fogDensity = 0.003;

  // --- Materials ---
  const { rockMat, highlightMat, playingMat } = setupMaterials(scene);

  // --- Ocean ---
  const ocean = BABYLON.MeshBuilder.CreateGround(
    "ocean",
    { width: 20000, height: 20000, subdivisions: 1 },
    scene
  );
  const oceanMat = new BABYLON.StandardMaterial("oceanMat", scene);
  oceanMat.diffuseColor = new BABYLON.Color3(0.0, 0.3, 0.6);
  oceanMat.specularColor = new BABYLON.Color3(0, 0, 0);
  ocean.material = oceanMat;
  ocean.position.y = -0.5;

  // --- Scene bookkeeping ---
  scene.groundMeshes = [ocean];
  scene.letterMeshes = {};
  scene.letterIslands = {};
  scene.letterSounds = {};
  scene.currentlyPlayingSound = null;
  scene.highlightMaterial = highlightMat;
  scene.playingMaterial = playingMat;

  // --- Load letters and islands ---
  const loader = new BABYLON.AssetsManager(scene);
  const radius = 45;

  LETTERS.forEach((entry, i) => {
    // Load sound only for first 4 letters
    if (SOUND_LETTERS.includes(entry.letter) && entry.sound) {
      const sound = new BABYLON.Sound(
        `sound_${entry.letter}`,
        entry.sound,
        scene,
        null,
        { autoplay: false }
      );
      scene.letterSounds[entry.letter] = sound;
    }

    const angle = (i / LETTERS.length) * 2 * Math.PI;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const position = new BABYLON.Vector3(x, 0, z);

    const island = createIsland(scene, entry.letter, position, rockMat, null);
    scene.letterIslands[entry.letter] = island;

    entry.items.forEach((item) => {
      const parts = item.model.split("/");
      const fileName = parts.pop();
      const rootUrl = parts.join("/") + "/";
      const task = loader.addMeshTask(
        `${entry.letter}_task`,
        "",
        rootUrl,
        fileName
      );

      task.onSuccess = (t) => {
        const mesh = t.loadedMeshes[0];
        mesh.isPickable = true;
        mesh.originalMaterial = mesh.material || scene.defaultMaterial;

        let scale = 1.5;
        if (entry.letter === "A") scale = 2.5;
        else if (entry.letter === "B") scale = 0.1;
        else if (entry.letter === "C") scale = 0.9;
        else if (entry.letter === "E") scale = 2.9;

        mesh.scaling = new BABYLON.Vector3(scale, scale, scale);
        const yPosition =
          2 + mesh.getBoundingInfo().boundingBox.extendSize.y * scale;
        mesh.position = new BABYLON.Vector3(x, yPosition, z);
        mesh.rotation = new BABYLON.Vector3(0, Math.PI / 4, 0);
        scene.letterMeshes[entry.letter] = mesh;

        setupInteractivity(scene, mesh, entry.letter);
      };

      task.onError = () => console.warn(`Model not found for ${entry.letter}`);
    });
  });

  loader.load();
  setupSceneInteractivity(scene, camera);

  // --- WebXR (VR) ---
  try {
    const xrHelper = await scene.createDefaultXRExperienceAsync({
      floorMeshes: [ocean],
      disableTeleportation: false,
    });
    scene.xrHelper = xrHelper;

    // Hide HTML UI in VR
    xrHelper.baseExperience.onStateChangedObservable.add((state) => {
      const ui = document.getElementById("ui");
      if (!ui) return;
      ui.style.display = state === BABYLON.WebXRState.IN_XR ? "none" : "block";
    });

    // --- Scale letters in VR for visibility ---
    Object.values(scene.letterMeshes).forEach((mesh) => {
      mesh.scaling = mesh.scaling.multiplyByFloats(1.5, 1.5, 1.5);
    });

    console.log("✅ WebXR Ready — VR headset supported");
  } catch (e) {
    console.warn("⚠️ WebXR not supported in this browser:", e);
  }

  return scene;
}
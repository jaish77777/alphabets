import { LETTERS } from "./data/letters.js";

export function setupUI(scene, camera) {
  // --- Create container ---
  const ui = document.createElement("div");
  ui.id = "ui";
  ui.style.position = "absolute";
  ui.style.top = "10px";
  ui.style.left = "10px";
  ui.style.background = "rgba(255,255,255,0.8)";
  ui.style.padding = "10px";
  ui.style.borderRadius = "8px";
  ui.style.maxHeight = "90vh";
  ui.style.overflowY = "auto";
  ui.style.fontFamily = "Arial, sans-serif";
  ui.style.zIndex = "100";

  // --- HTML content ---
  ui.innerHTML = `
    <h2>Alphabet Adventure VR</h2>
    <div style="margin-bottom:8px;">
      <button id="leftBtn">⟲ Rotate Left</button>
      <button id="rightBtn">⟳ Rotate Right</button>
      <button id="zoomInBtn">＋ Zoom In</button>
      <button id="zoomOutBtn">－ Zoom Out</button>
    </div>
    <div id="focusBtns" style="display:flex; flex-wrap:wrap; gap:4px;"></div>
  `;

  document.body.appendChild(ui);

  const rotateSpeed = 0.02;
  const zoomSpeed = 2;

  // --- Camera rotation ---
  document.getElementById("leftBtn").addEventListener("click", () => {
    camera.alpha -= rotateSpeed;
  });
  document.getElementById("rightBtn").addEventListener("click", () => {
    camera.alpha += rotateSpeed;
  });

  // --- Camera zoom ---
  document.getElementById("zoomInBtn").addEventListener("click", () => {
    camera.radius = Math.max(10, camera.radius - zoomSpeed);
  });
  document.getElementById("zoomOutBtn").addEventListener("click", () => {
    camera.radius = Math.min(200, camera.radius + zoomSpeed);
  });

  // --- Focus buttons for letters ---
  const focusDiv = document.getElementById("focusBtns");

  LETTERS.forEach((entry, i) => {
    const btn = document.createElement("button");
    btn.innerText = entry.letter;
    btn.style.minWidth = "30px";
    btn.style.height = "30px";
    btn.style.fontWeight = "bold";
    btn.style.cursor = "pointer";
    btn.style.borderRadius = "4px";
    btn.style.border = "1px solid #333";
    btn.style.background = "#eee";

    focusDiv.appendChild(btn);

    btn.addEventListener("click", () => {
      const mesh =
        scene.letterMeshes[entry.letter] ||
        scene.getMeshByName(`${entry.letter}_rock`);
      if (!mesh) return;

      // --- Animate camera target ---
      BABYLON.Animation.CreateAndStartAnimation(
        "camTargetAnim",
        camera,
        "target",
        60,
        60,
        camera.target.clone(),
        mesh.position.clone(),
        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
      );

      // --- Animate camera radius ---
      BABYLON.Animation.CreateAndStartAnimation(
        "camRadiusAnim",
        camera,
        "radius",
        60,
        60,
        camera.radius,
        15,
        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
      );

      // --- Play sound for first 4 letters (A-D) ---
      if (["A", "B", "C", "D"].includes(entry.letter)) {
        const sound = scene.letterSounds[entry.letter];
        if (sound) {
          if (scene.currentlyPlayingSound) scene.currentlyPlayingSound.stop();
          sound.play();
          scene.currentlyPlayingSound = sound;
        }
      }
    });
  });

  // --- Hide UI in VR ---
  if (scene.xrHelper) {
    scene.xrHelper.baseExperience.onStateChangedObservable.add((state) => {
      ui.style.display =
        state === BABYLON.WebXRState.IN_XR ? "none" : "block";
    });
  }
}
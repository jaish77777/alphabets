// main.js — Entry point for Babylon.js Alphabet Adventure
import { createScene } from "./scene.js";
import { setupUI } from "./ui.js";

window.addEventListener("DOMContentLoaded", async function () {
  // Get canvas
  const canvas = document.getElementById("renderCanvas");

  // Create engine
  const engine = new BABYLON.Engine(canvas, true, {
    preserveDrawingBuffer: true,
    stencil: true,
  });

  // --- Create the scene ---
  const scene = await createScene(engine, canvas);

  // --- UI Setup (orbit / buttons / etc.) ---
  setupUI(scene, scene.activeCamera);

  // --- Render loop ---
  engine.runRenderLoop(() => {
    scene.render();
  });

  // --- Handle browser resize ---
  window.addEventListener("resize", () => {
    engine.resize();
  });
});
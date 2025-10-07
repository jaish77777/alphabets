import { splitRootAndFile } from './util.js';
import { setupInteractivity } from './interactivity.js';
import { createIsland } from './island.js'; // keep using your existing island generator

export function loadLetters(scene, loader, radius, rockMat, grassMat, LETTERS) {
  return new Promise((resolve) => {
    // Preload sounds (same behaviour as before)
    LETTERS.forEach((entry) => {
      if (entry.sound) {
        const sound = new BABYLON.Sound(`sound_${entry.letter}`, entry.sound, scene, null, { autoplay: false, loop: false });
        scene.letterSounds[entry.letter] = sound;
      }
    });

    // Add tasks
    LETTERS.forEach((entry, i) => {
      const angle = (i / LETTERS.length) * 2 * Math.PI;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const position = new BABYLON.Vector3(x, 0, z);

      // Create island for this letter
      const island = createIsland(scene, entry.letter, position, rockMat, grassMat);
      scene.letterIslands[entry.letter] = island;

      entry.items.forEach((item) => {
        const { rootUrl, filename } = splitRootAndFile(item.model);
        const task = loader.addMeshTask(`${entry.letter}_${filename}_task`, '', rootUrl, filename);

        task.onSuccess = (t) => {
          // choose a mesh (prefer Mesh instances)
          const mesh = t.loadedMeshes.find((m) => m instanceof BABYLON.Mesh) || t.loadedMeshes[0];
          if (!mesh) return;

          // Store original material safely
          if (!mesh.material) {
            const child0 = mesh.getChildMeshes && mesh.getChildMeshes()[0];
            mesh.originalMaterial = (child0 && child0.material) || null;
          } else {
            mesh.originalMaterial = mesh.material;
          }

          // Center pivot for better rotation
          const bb = mesh.getBoundingInfo().boundingBox;
          const extendY = bb.extendSize.y || 0;
          mesh.setPivotMatrix(BABYLON.Matrix.Translation(0, -extendY, 0));

          // Per-letter scaling (keeps behaviour)
          let scale = 1.5;
          switch (entry.letter) {
            case 'A': scale = 2.1; break;
            case 'B': scale = 0.1; break;
            case 'C': scale = 1.4; break;
            case 'D': scale = 1.5; break;
            default: scale = 1.5;
          }
          mesh.scaling = new BABYLON.Vector3(scale, scale, scale);

          // Compute position above island
          const islandHeight = 2;
          const meshHeight = bb.extendSize.y * 2 * mesh.scaling.y;
          const yPosition = islandHeight + meshHeight / 2;

          mesh.position = new BABYLON.Vector3(x, yPosition, z);

          // Reset rotation and apply gentle rotation if needed
          mesh.rotation = new BABYLON.Vector3(0, Math.PI / 4, 0);

          mesh.isPickable = true;

          // Save reference & add interactivity
          scene.letterMeshes[entry.letter] = mesh;
          setupInteractivity(scene, mesh, entry.letter);
        };

        task.onError = (err) => {
          console.warn(`Model not found for ${entry.letter}`, err);
        };
      });
    });

    loader.onFinish = () => resolve();
    loader.load();
  });
}
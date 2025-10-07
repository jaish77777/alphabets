import {
  focusOnLetter,
  resetCamera,
  resetHighlights,
  stopCurrentSound,
  playLetterSound,
} from "./util.js";

const SOUND_LETTERS = ["A", "B", "C", "D"]; // Only these letters have sounds

export function setupInteractivity(scene, mesh, letter) {
  mesh.actionManager = new BABYLON.ActionManager(scene);

  mesh.actionManager.registerAction(
    new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOverTrigger, () => {
      if (!mesh.isPlaying) {
        mesh.material = scene.highlightMaterial;
        document.body.style.cursor = "pointer";
      }
    })
  );

  mesh.actionManager.registerAction(
    new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOutTrigger, () => {
      if (!mesh.isPlaying) {
        mesh.material = mesh.originalMaterial;
        document.body.style.cursor = "default";
      }
    })
  );
}

export function setupSceneInteractivity(scene, camera) {
  let lastClickTime = 0;

  // --- Desktop & Mobile ---
  scene.onPointerObservable.add((pointerInfo) => {
    if (
      pointerInfo.type === BABYLON.PointerEventTypes.POINTERPICK &&
      pointerInfo.pickInfo.hit
    ) {
      const mesh = pointerInfo.pickInfo.pickedMesh;
      const letter = Object.keys(scene.letterMeshes).find(
        (k) => scene.letterMeshes[k] === mesh
      );

      if (letter) {
        focusOnLetter(scene, camera, letter);
        if (SOUND_LETTERS.includes(letter)) playLetterSound(scene, letter);
      }

      const now = Date.now();
      if (now - lastClickTime < 300) {
        resetCamera(camera);
        resetHighlights(scene);
        stopCurrentSound(scene);
      }
      lastClickTime = now;
    }
  });

  // --- VR / WebXR Support ---
  scene.onReadyObservable.addOnce(async () => {
    if (!scene.xrHelper && !scene._xr) return;
    const xr = scene.xrHelper ?? scene._xr ?? null;
    if (!xr || !xr.input) return;

    // --- Reticle for gaze ---
    const reticle = BABYLON.MeshBuilder.CreateSphere("reticle", { diameter: 0.05 }, scene);
    const reticleMat = new BABYLON.StandardMaterial("reticleMat", scene);
    reticleMat.emissiveColor = new BABYLON.Color3(1, 1, 1);
    reticle.material = reticleMat;
    reticle.isPickable = false;

    // --- VR Controllers ---
    xr.input.onControllerAddedObservable.add((controller) => {
      controller.onMotionControllerInitObservable.add((motionController) => {
        const triggerComponent = motionController.getComponent("xr-standard-trigger");
        if (triggerComponent) {
          triggerComponent.onButtonStateChangedObservable.add(() => {
            if (triggerComponent.pressed) {
              const pick = scene.pickWithRay(controller.getForwardRay(100));
              if (pick && pick.hit && pick.pickedMesh) {
                const mesh = pick.pickedMesh;
                const letter = Object.keys(scene.letterMeshes).find(
                  (k) => scene.letterMeshes[k] === mesh
                );
                if (letter) {
                  focusOnLetter(scene, camera, letter);
                  if (SOUND_LETTERS.includes(letter)) playLetterSound(scene, letter);
                }
              }
            }
          });
        }
      });

      // Update reticle position
      scene.onBeforeRenderObservable.add(() => {
        const ray = controller.getForwardRay(10);
        reticle.position.copyFrom(ray.origin.add(ray.direction.scale(2)));
      });
    });

    // --- Gaze interaction ---
    let gazeTimer = 0;
    let lastPickedMesh = null;

    scene.onBeforeRenderObservable.add(() => {
      if (xr.baseExperience && xr.baseExperience.camera) {
        const vrCamera = xr.baseExperience.camera;
        const ray = vrCamera.getForwardRay(100);
        const pick = scene.pickWithRay(ray);

        if (pick && pick.hit) {
          reticle.position.copyFrom(ray.origin.add(ray.direction.scale(pick.distance - 0.1)));

          if (pick.pickedMesh !== lastPickedMesh) {
            gazeTimer = performance.now();
            lastPickedMesh = pick.pickedMesh;
          } else if (performance.now() - gazeTimer > 1000) {
            const mesh = pick.pickedMesh;
            const letter = Object.keys(scene.letterMeshes).find(
              (k) => scene.letterMeshes[k] === mesh
            );
            if (letter) {
              focusOnLetter(scene, camera, letter);
              if (SOUND_LETTERS.includes(letter)) playLetterSound(scene, letter);
              gazeTimer = performance.now() + 2000; // prevent repeat
            }
          }
        }
      }
    });
  });
}
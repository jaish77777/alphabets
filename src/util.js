import { LETTERS } from "./data/letters.js";

export function focusOnLetter(scene, camera, letter) {
  const mesh = scene.letterMeshes[letter];
  if (!mesh) return;
  resetHighlights(scene);
  mesh.material = scene.highlightMaterial;
  mesh.isHighlighted = true;

  const target = mesh.getAbsolutePosition().clone();
  target.y += 2;
  BABYLON.Animation.CreateAndStartAnimation(
    "cameraAnim",
    camera,
    "target",
    30,
    30,
    camera.target,
    target,
    BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
  );
  BABYLON.Animation.CreateAndStartAnimation(
    "radiusAnim",
    camera,
    "radius",
    30,
    30,
    camera.radius,
    15,
    BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
  );
}

export function resetCamera(camera) {
  BABYLON.Animation.CreateAndStartAnimation(
    "cameraReset",
    camera,
    "target",
    30,
    30,
    camera.target,
    new BABYLON.Vector3(0, 2, 0),
    BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
  );
  BABYLON.Animation.CreateAndStartAnimation(
    "radiusReset",
    camera,
    "radius",
    30,
    30,
    camera.radius,
    90,
    BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
  );
}

export function resetHighlights(scene) {
  Object.values(scene.letterMeshes).forEach((m) => {
    if (m.isHighlighted && !m.isPlaying) {
      m.material = m.originalMaterial;
      m.isHighlighted = false;
    }
  });
}

export function playLetterSound(scene, letter) {
  const mesh = scene.letterMeshes[letter];
  if (!mesh) return;

  // Stop currently playing sound
  if (scene.currentlyPlayingSound) {
    scene.currentlyPlayingSound.stop();
    scene.currentlyPlayingSound = null;
  }

  // Lazy load the sound (required for desktop autoplay)
  if (!scene.letterSounds[letter]) {
    const entry = LETTERS.find((e) => e.letter === letter);
    if (!entry || !entry.sound) return;

    const sound = new BABYLON.Sound(
      `sound_${letter}`,
      entry.sound,
      scene,
      null,
      { autoplay: false }
    );
    scene.letterSounds[letter] = sound;
  }

  const sound = scene.letterSounds[letter];
  sound.play();
  scene.currentlyPlayingSound = sound;

  mesh.isPlaying = true;
  sound.onEndedObservable.addOnce(() => {
    mesh.isPlaying = false;
    mesh.material = mesh.originalMaterial;
    scene.currentlyPlayingSound = null;
  });
}

export function stopCurrentSound(scene) {
  if (scene.currentlyPlayingSound) {
    scene.currentlyPlayingSound.stop();
    scene.currentlyPlayingSound = null;
  }
}
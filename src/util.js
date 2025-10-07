export function focusOnLetter(scene, camera, letter) {
  const mesh = scene.letterMeshes[letter];
  if (!mesh) return;
  resetHighlights(scene);
  mesh.material = scene.highlightMaterial;
  mesh.isHighlighted = true;

  const target = mesh.getAbsolutePosition().clone();
  target.y += 2;
  BABYLON.Animation.CreateAndStartAnimation("cameraAnim", camera, "target", 30, 30, camera.target, target, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
  BABYLON.Animation.CreateAndStartAnimation("radiusAnim", camera, "radius", 30, 30, camera.radius, 15, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
}

export function resetCamera(camera) {
  BABYLON.Animation.CreateAndStartAnimation("cameraReset", camera, "target", 30, 30, camera.target, new BABYLON.Vector3(0, 2, 0), BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
  BABYLON.Animation.CreateAndStartAnimation("radiusReset", camera, "radius", 30, 30, camera.radius, 90, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
}

export function resetHighlights(scene) {
  Object.values(scene.letterMeshes).forEach(m => {
    if (m.isHighlighted && !m.isPlaying) {
      m.material = m.originalMaterial;
      m.isHighlighted = false;
    }
  });
}

export function playLetterSound(scene, letter) {
  stopCurrentSound(scene);
  const sound = scene.letterSounds[letter];
  const mesh = scene.letterMeshes[letter];
  if (sound && mesh) {
    mesh.material = scene.playingMaterial;
    mesh.isPlaying = true;
    sound.play();
    scene.currentlyPlayingSound = { sound, mesh };
    sound.onended = () => {
      mesh.material = mesh.originalMaterial;
      mesh.isPlaying = false;
      scene.currentlyPlayingSound = null;
    };
  }
}

export function stopCurrentSound(scene) {
  if (scene.currentlyPlayingSound) {
    const { sound, mesh } = scene.currentlyPlayingSound;
    sound.stop();
    mesh.material = mesh.originalMaterial;
    mesh.isPlaying = false;
    scene.currentlyPlayingSound = null;
  }
}

export function setupMaterials(scene) {
  const rockMat = new BABYLON.StandardMaterial("rockMat", scene);
  rockMat.diffuseTexture = new BABYLON.Texture("./assets/textures/rock.png", scene);

  const grassMat = new BABYLON.StandardMaterial("grassMat", scene);
  grassMat.diffuseTexture = new BABYLON.Texture("./assets/textures/ground_grass.png", scene);

  const highlightMat = new BABYLON.StandardMaterial("highlightMat", scene);
  highlightMat.emissiveColor = new BABYLON.Color3(1, 1, 0.3);
  highlightMat.alpha = 0.7;

  const playingMat = new BABYLON.StandardMaterial("playingMat", scene);
  playingMat.emissiveColor = new BABYLON.Color3(0.3, 1, 0.3);
  playingMat.alpha = 0.7;

  return { rockMat, grassMat, highlightMat, playingMat };
}
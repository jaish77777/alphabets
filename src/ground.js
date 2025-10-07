export function createGround(scene, grassMat) {
  const ground = BABYLON.MeshBuilder.CreateDisc("islandGround", { radius: 100, tessellation: 64 }, scene);
  ground.material = grassMat;
  ground.receiveShadows = true;
  ground.position.y = -0.2;
  return ground;
}

export function createOcean(scene) {
  const ocean = BABYLON.MeshBuilder.CreateDisc("ocean", { radius: 500, tessellation: 128 }, scene);
  const mat = new BABYLON.StandardMaterial("oceanMat", scene);
  mat.diffuseColor = new BABYLON.Color3(0.4, 0.7, 1.0);
  mat.alpha = 0.9;
  ocean.material = mat;
  ocean.position.y = -0.5;
  return ocean;
}
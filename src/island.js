// island.js — creates a single island with grass and rock
export function createIsland(scene, name, position, rockMat, grassMat) {
  // Rock base
  const island = BABYLON.MeshBuilder.CreateCylinder(`${name}_base`, {
    diameterTop: 8,
    diameterBottom: 10,
    height: 4
  }, scene);
  island.position = position;
  island.material = rockMat;

  // Grass top
  const top = BABYLON.MeshBuilder.CreateDisc(`${name}_top`, { radius: 6 }, scene);
  top.position = new BABYLON.Vector3(position.x, position.y + 2.2, position.z);
  top.material = grassMat;

  return { island, top };
}
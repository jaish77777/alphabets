import { createScene } from './scene.js';


window.addEventListener('DOMContentLoaded', async () => {
const canvas = document.getElementById('renderCanvas');
const engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });


const scene = await createScene(engine, canvas);


engine.runRenderLoop(() => {
if (scene) scene.render();
});


window.addEventListener('resize', () => engine.resize());
});
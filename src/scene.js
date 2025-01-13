import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { GUI } from 'https://cdn.jsdelivr.net/npm/lil-gui@0.20/+esm'; 

import { createCamera } from './camera.js';

export function createScene() {
  
  // Initial scene setup
  const gameWindow = document.getElementById('render-target');
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x777777);
  
  const camera = createCamera(gameWindow);

  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(gameWindow.offsetWidth, gameWindow.offsetHeight);
  gameWindow.appendChild(renderer.domElement);
  
  // Create the central cube
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// Create four additional cubes at the corners of the central cube
const positions = [
  [4, 0, 4],  // Top-right corner
  null, // Top-left corner
  [4, 0, -4], // Bottom-right corner
  [-4, 0, -4] // Bottom-left corner
];

// Load the GLTF model for "Metal"
const metalModelPath = "./src/Island/Metal/metal.gltf";
const gltfLoader = new GLTFLoader();


//Load metal island
gltfLoader.load(
  metalModelPath,
  (gltf) => {
    const metalModel = gltf.scene;
    metalModel.position.set(-4, 0, 4); // Position for "Metal" - Top-left corner
    metalModel.scale.set(0.3, 0.3, 0.3); // Adjust scale as needed
    scene.add(metalModel);
    cornerCubes.splice(1, 0, metalModel); // Insert the model at the correct index
  },
  undefined,
  (error) => {
    console.error("Error loading GLTF model:", error);
  }
);

const labelsNames = ["Wood", "Metal", "Rock", "Food"];
const cornerCubes = [];

//Create cubes
positions.forEach((pos, index) => {
  if (!pos) return; // Skip if null (reserved for "Metal")
  const surroundingCube = new THREE.Mesh(
    geometry,
    new THREE.MeshBasicMaterial({ color: 0xff0000 })
  );
  surroundingCube.position.set(...pos);
  scene.add(surroundingCube);
  cornerCubes[index] = surroundingCube;
});

setupLights();

// Setup click counters and labels for each cube
const clickCounts = [0, 0, 0, 0];
const labelContainer = document.createElement('div');
labelContainer.style.position = 'absolute';
labelContainer.style.top = '10px';
labelContainer.style.right = '10px';
labelContainer.style.color = '#ffffff';
labelContainer.style.fontFamily = 'Arial, sans-serif';
labelContainer.style.fontSize = '14px';
labelContainer.style.padding = '10px';
labelContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
labelContainer.style.borderRadius = '5px';
labelContainer.style.userSelect = 'none';
document.body.appendChild(labelContainer);

const labels = labelsNames.map((name, index) => {
  const label = document.createElement('div');
  label.textContent = `${name}: 0 clicks`;
  label.style.marginBottom = '5px';
  label.style.userSelect = 'none'; // Prevent text selection for individual labels
  labelContainer.appendChild(label);
  return label;
});

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onDocumentMouseDown(event) {
  // Convert mouse position to normalized device coordinates (-1 to +1)
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Update the raycaster with the camera and mouse position
  raycaster.setFromCamera(mouse, camera.camera);

  // Check for intersections with all objects
  const intersects = raycaster.intersectObjects(cornerCubes, true); // Use true for recursive checks
  if (intersects.length > 0) {
    const clickedObject = intersects[0].object;

    // Find the index of the clicked object
    const index = cornerCubes.findIndex(
      (cube) => cube === clickedObject || cube.children.includes(clickedObject)
    );

    if (index !== -1) {
      clickCounts[index]++;
      labels[index].textContent = `${labelsNames[index]}: ${clickCounts[index]} clicks`;
    }
  }
}


gameWindow.addEventListener('mousedown', onDocumentMouseDown);
  
  function setupLights() {
    const lights = [
      new THREE.AmbientLight(0xffffff, 0.2),
      new THREE.DirectionalLight(0xffffff, 0.3),
      new THREE.DirectionalLight(0xffffff, 0.3),
      new THREE.DirectionalLight(0xffffff, 0.3)
    ];
    lights[1].position.set(0, 1, 0);
    lights[2].position.set(1, 1, 0);
    lights[3].position.set(0, 1, 1);
    scene.add(...lights);
  }
  
  function draw() {
    renderer.render(scene, camera.camera);

  }

  function start() {
    renderer.setAnimationLoop(draw);
  }

  function stop() {
    renderer.setAnimationLoop(null);
  }

  function onMouseDown(event) {
    camera.onMouseDown(event);
  }
  
  function onMouseUp(event) {
    camera.onMouseUp(event);
  }

  function onMouseMove(event) {
    camera.onMouseMove(event);
  }
  return {
    start,
    stop,
    onMouseDown,
    onMouseUp,
    onMouseMove
  }
} 
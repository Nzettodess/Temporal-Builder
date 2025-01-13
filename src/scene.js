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
  

  // Load the GLTF models
  const models = [
    { path: "./src/Island/metal/metal.gltf", position: [-4, 0, 4], scale: 0.3, name:"Metal" }, // Metal
    { path: "./src/Island/forest/forest.gltf", position: [4, 0, -4], scale: 0.7,name:"Wood" }, // Forest
    { path: "./src/Island/stone/stone.gltf", position: [-4, 0, -4], scale: 0.2, name: "Stone"}, // Stone
    { path: "./src/Island/food/food.gltf", position: [4, 0, 4], scale: 0.3,name: "Food" }, // Food
  ];

  const gltfLoader = new GLTFLoader();
  let centerModel = null;
  const loadedModels = [];
  const clickCounts = [0, 0, 0, 0];
  

  gltfLoader.load(
    "./src/Island/center/center.gltf", // Replace with the correct path to your GLTF file
    (gltf) => {
      // Add the loaded model to the scene
      const model = gltf.scene;
      model.position.set(0.5, -0.5, 0.5); // Adjust position if needed
      model.scale.set(0.7, 0.7, 0.7);
      scene.add(model);

      // Store reference to the center model
      centerModel = model;

    },
    (xhr) => {
      // Called while loading is in progress
      console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
    },
    (error) => {
      // Called if loading the model fails
      console.error('An error occurred while loading the GLTF model', error);
    }
  );

  // Load each model and add it to the scene at the specified position
  models.forEach((model, index) => {
    gltfLoader.load(
      model.path,
      (gltf) => {
        const gltfModel = gltf.scene;
        gltfModel.position.set(...model.position);
        gltfModel.scale.set(model.scale, model.scale, model.scale); // Scale adjustment
        scene.add(gltfModel);

         // Track the model with its index
         loadedModels.push({ model: gltfModel, index });

      },
      undefined,
      (error) => {
        console.error("Error loading GLTF model:", error);
      }
    );
  });

// Create a container for the "Update" message for checking center update
const updateMessage = document.createElement('div');
updateMessage.style.position = 'absolute';
updateMessage.style.top = '10px';
updateMessage.style.left = '10px';
updateMessage.style.color = '#ffffff';
updateMessage.style.fontFamily = 'Arial, sans-serif';
updateMessage.style.fontSize = '20px';
updateMessage.style.padding = '5px';
updateMessage.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
updateMessage.style.borderRadius = '5px';
updateMessage.style.userSelect = 'none';
updateMessage.style.display = 'none'; // Initially hidden
updateMessage.textContent = 'Update';
document.body.appendChild(updateMessage);



  //Labels and click counters
  //const labelsNames = ["Wood", "Metal", "Rock", "Food"];
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

  const labels = models.map((model, index) => {
    const label = document.createElement('div');
    label.textContent = `${model.name}: 0 clicks`;
    label.style.marginBottom = '5px';
    label.style.userSelect = 'none';
    labelContainer.appendChild(label);
    return label;
  });

  setupLights();

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  function onDocumentMouseDown(event) {
    // Convert mouse position to normalized device coordinates
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Update the raycaster
    raycaster.setFromCamera(mouse, camera.camera);

    const intersects = raycaster.intersectObjects(loadedModels.map(item => item.model), true);

    if (intersects.length > 0) {
      // Find the clicked model
      const intersected = intersects[0].object;
      const clickedModel = loadedModels.find(item => {
        let parent = intersected;
        while (parent) {
          if (item.model === parent) return true;
          parent = parent.parent;
        }
        return false;
      });

      if (clickedModel) {
        const index = clickedModel.index;
        clickCounts[index]++;
        labels[index].textContent = `${models[index].name}: ${clickCounts[index]} clicks`;
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

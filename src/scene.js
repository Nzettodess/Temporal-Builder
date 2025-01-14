import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { GUI } from 'https://cdn.jsdelivr.net/npm/lil-gui@0.20/+esm'; 
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { Scene, EquirectangularReflectionMapping, ACESFilmicToneMapping, WebGLRenderer } from 'three';
import { EXRLoader } from 'three/addons/loaders/EXRLoader.js';

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
    { path: "../public/Models/Island/metal/metal.gltf", position: [-4, .4, 4], scale: 0.3, name:"Metal" }, // Metal
    { path: "../public/Models/Island/forest/forest.gltf", position: [4, 1, -4], scale: 0.7,name:"Wood" }, // Forest
    { path: "../public/Models/Island/stone/stone.gltf", position: [-4, 0, -4], scale: 0.2, name: "Stone"}, // Stone
    { path: "../public/Models/Island/food/food.gltf", position: [4, 1, 4], scale: 0.3,name: "Food" }, // Food
  ];

  const gltfLoader = new GLTFLoader();
  let centerModel = null;
  const loadedModels = [];
  const clickCounts = [0, 0, 0, 0];
  
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = .5;
  
  function setupEnvironment() {
    const exrLoader = new EXRLoader();
    exrLoader.load(
      '../public/Lighting/forest.exr', // Replace with the path to your .exr file
      (texture) => {
        texture.mapping = THREE.EquirectangularReflectionMapping; // Correct mapping for environment maps
  
        // Apply the texture as the environment map and background
        scene.environment = texture;
        scene.background = texture;
  
        console.log('EXR HDRI loaded successfully!');
      },
      (xhr) => {
        console.log(`EXR HDRI loading: ${(xhr.loaded / xhr.total) * 100}% loaded`);
      },
      (error) => {
        console.error('Error loading EXR HDRI:', error);
      }
    );
  }
  
  // Call this function after setting up your scene and renderer
  setupEnvironment();

  gltfLoader.load(
    "../public/Models/Island/center/center.gltf", // Replace with the correct path to your GLTF file
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

  // Load the ground model
  gltfLoader.load(
    "../public/Models/Ocean/ocean.glb", // Replace with the correct path to your ground GLTF file
    (gltf) => {
      const groundModel = gltf.scene;
      groundModel.position.set(0, 0.5, 0); // Center it at the origin (adjust Y if needed)
      groundModel.scale.set(.2, .2, .2); // Adjust scale for the ground
      scene.add(groundModel);

      groundModel = model;

      console.log("Ground loaded successfully!");
    },
    (xhr) => {
      // Loading progress
      console.log(`Ground model loading: ${(xhr.loaded / xhr.total) * 100}% loaded`);
    },
    (error) => {
      // Loading error
      console.error("Error loading ground model:", error);
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
  
    // Existing lights setup
    lights[1].position.set(0, 1, 0);
    lights[2].position.set(1, 1, 0);
    lights[3].position.set(0, 1, 1);
    scene.add(...lights);
  
    // Add a "sunlight" DirectionalLight
    const sunlight = new THREE.DirectionalLight(0xffdd88, 1.5); // Warm color for sunlight
    sunlight.castShadow = true; // Enable shadows
    scene.add(sunlight);
  
    // Add a helper for the sunlight
    //const sunHelper = new THREE.DirectionalLightHelper(sunlight, 2);
    //scene.add(sunHelper);
  
    // Create a sun disc
    const sunGeometry = new THREE.SphereGeometry(0.5, 16, 16);
    const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffdd88, emissive: 0xffdd88 });
    const sunDisc = new THREE.Mesh(sunGeometry, sunMaterial);
    scene.add(sunDisc);
  
    // Create a pivot object for the sunlight
    const sunPivot = new THREE.Object3D();
    sunPivot.add(sunlight);
    sunPivot.add(sunDisc);
    scene.add(sunPivot);
  
    // Position the sun disc and light relative to the pivot
    sunlight.position.set(0, 10, 0); // Set initial height
    sunDisc.position.copy(sunlight.position);
  
    // Animation for east-to-west rotation (rotating around the Z-axis)
    const sunRadius = 20; // Distance from the pivot
    let angle = 0; // Start angle
  
    function animateSunlight() {
      angle += 0.01; // Adjust speed of rotation
      const x = sunRadius * Math.cos(angle); // East-to-west X position
      const z = sunRadius * Math.sin(angle); // North-South Z position
      sunlight.position.set(x, Math.sin(angle) * 10, z); // Adjust height for sunrise/sunset
      sunDisc.position.copy(sunlight.position); // Sync the disc position
      sunlight.target.position.set(0, 0, 0); // Ensure light points at the scene center
      sunlight.target.updateMatrixWorld(); // Update target matrix
  
      requestAnimationFrame(animateSunlight);
    }
  
    animateSunlight();
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

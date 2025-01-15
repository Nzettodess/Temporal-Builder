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
  renderer.toneMappingExposure = .2;
  
  function setupEnvironment() {
    const exrLoader = new EXRLoader();
    exrLoader.load(
      '../public/Lighting/puresky.exr', // Replace with the path to your .exr file
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
      model.position.set(0.5, 0.1, 0.5); // Adjust position if needed
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


  const clockOcean = new THREE.Clock();
  // Load the ground model
  gltfLoader.load("../public/Models/Ocean/ocean.gltf", function(glb) {
      const groundModel = glb.scene;
      groundModel.position.set(0, 0.1, 0); // Center it at the origin (adjust Y if needed)
      groundModel.scale.set(1, 1, 1); // Adjust scale for the ground
      scene.add(groundModel);

      // Handle animations
      const oceanClips = glb.animations;

          const mixer = new THREE.AnimationMixer(groundModel); 
          const clipOcean = THREE.AnimationClip.findByName(oceanClips, 'KeyAction');

          const action = mixer.clipAction(clipOcean);
          action.play(); // Start the animation
          // Add the mixer to the update loop
          scene.userData.mixer = mixer; // Store mixer to be updated
      

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
    const sunlight = new THREE.DirectionalLight(0xffdd88, 30.5); // Warm color for sunlight
    sunlight.intensity = 50.0;
    sunlight.castShadow = true; // Enable shadows
    scene.add(sunlight);
    
    // Add a "moonlight" DirectionalLight
    const moonlight = new THREE.DirectionalLight(0x8899ff, 30.0); // Cool color for moonlight
    moonlight.castShadow = true; // Enable shadows
    moonlight.intensity = 150.0;

    scene.add(moonlight);

    // Clock for animation
    const clock = new THREE.Clock();
  
    // Function to calculate HDRI intensity based on sun's Z position
    function calculateHDRIIntensity(sunPosition) {
      const { y } = sunPosition; // Get the sun's Y position
  
      if (y <= 0) {
          // Sun is below the horizon
          return 0.05; // Minimum intensity for nighttime
      }
  
      // Normalize the Y position relative to the max height (e.g., 10)
      const maxHeight = 10;
      const normalizedY = Math.max(Math.min(y / maxHeight, 1), 0); // Clamp between 0 and 1
  
      // Smooth intensity curve using a quadratic easing function
      return 0.01 + (normalizedY ** 2) * 0.99; // Scale to a max intensity of 1
  }

    // Update HDRI intensity in the animation loop
    function updateEnvironmentIntensity(sunLight, scene) {
      const intensity = calculateHDRIIntensity(sunLight.position); // Calculate intensity
      renderer.toneMappingExposure = intensity; // Adjust renderer exposure
      if (scene.environment) {
          scene.environment.intensity = intensity; // Optional: Adjust HDRI texture intensity
      }
  }
  
    // Create a sun disc
    const sunGeometry = new THREE.SphereGeometry(0.5, 16, 16);
    const sunMaterial = new THREE.MeshStandardMaterial({ color: 0xffdd88, emissive: 0xffdd88 });
    sunMaterial.emissiveIntensity = 100;
    const sunDisc = new THREE.Mesh(sunGeometry, sunMaterial);
    scene.add(sunDisc);

    // Create a moon disc
    const moonGeometry = new THREE.SphereGeometry(0.4, 16, 16);
    const moonMaterial = new THREE.MeshStandardMaterial({ color: 0x8899ff, emissive: 0x8899ff });
    moonMaterial.emissiveIntensity = 100;
    const moonDisc = new THREE.Mesh(moonGeometry, moonMaterial);
    scene.add(moonDisc);

    // Create a pivot object for the sunlight
    const sunPivot = new THREE.Object3D();
    sunPivot.add(sunlight);
    sunPivot.add(sunDisc);
    scene.add(sunPivot);

    const moonPivot = new THREE.Object3D();
    moonPivot.add(moonlight);
    moonPivot.add(moonDisc);
    scene.add(moonPivot);
  
    // Position the sun disc and light relative to the pivot
    sunlight.position.set(0, 10, 0); // Set initial height
    sunDisc.position.copy(sunlight.position);

    // Position the moon disc and light relative to the pivot
    moonlight.position.set(0, -10, 0); // Set initial height (opposite to the sun)
    moonDisc.position.copy(moonlight.position);
  
    // Animation for east-to-west rotation (rotating around the Z-axis)
    const sunRadius = 20; // Distance from the pivot
    let angle = 0; // Start angle
  
    function animateSunAndMoon() {
      angle += 0.001; // Adjust rotation speed
      const sunX = sunRadius * Math.cos(angle);
      const sunZ = sunRadius * Math.sin(angle);
      const sunY = Math.sin(angle) * 10; // Adjust for height
  
      // Update Sun Position
      sunlight.position.set(sunX, sunY, sunZ);
      sunDisc.position.copy(sunlight.position);
  
      // Update Moon Position (opposite to the sun)
      const moonX = -sunX;
      const moonZ = -sunZ;
      const moonY = -sunY;
      moonlight.position.set(moonX, moonY, moonZ);
      moonDisc.position.copy(moonlight.position);
  
      // Adjust intensity based on the sun's height
      updateEnvironmentIntensity(sunlight, scene);
  
      requestAnimationFrame(animateSunAndMoon);
  }
  
    animateSunAndMoon();
  }
  
  

  function draw() {
    if (scene.userData.mixer) {
      const delta = clockOcean.getDelta();
      scene.userData.mixer.update(delta);
    }

    renderer.render(scene, camera.camera);
    //requestAnimationFrame(draw);
  }

  // draw();

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

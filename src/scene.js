import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { GUI } from 'https://cdn.jsdelivr.net/npm/lil-gui@0.20/+esm'; 
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { Scene, EquirectangularReflectionMapping, ACESFilmicToneMapping, WebGLRenderer } from 'three';
import { EXRLoader } from 'three/addons/loaders/EXRLoader.js';


import { createCamera } from './camera.js';


export function createScene() {

  function displaySceneText(message, duration = 10000) {
    // Create text element
    const sceneText = document.createElement('div');
    sceneText.textContent = message;
    sceneText.style.position = 'absolute';
    sceneText.style.top = '20px';
    sceneText.style.left = '50%';
    sceneText.style.transform = 'translateX(-50%)';
    sceneText.style.color = 'white';
    sceneText.style.fontSize = '24px';
    sceneText.style.fontWeight = 'bold';
    sceneText.style.padding = '10px 20px';
    sceneText.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    sceneText.style.borderRadius = '10px';
    sceneText.style.zIndex = '200';
  
    // Append to the document
    document.body.appendChild(sceneText);
  
    // Remove after duration
    setTimeout(() => {
      document.body.removeChild(sceneText);
    }, duration);
  }

  let isPaused = false;

  // Access the settings panel defined in index.html
  const settingsPanel = document.getElementById('settings-panel');
 
  
  // Ensure the settings panel is hidden initially
  settingsPanel.style.display = 'none';
  
  // Create Pause Menu Container
  const pauseMenu = document.createElement('div');
  pauseMenu.id = 'pause-menu';
  pauseMenu.style.position = 'absolute';
  pauseMenu.style.top = '0';
  pauseMenu.style.left = '0';
  pauseMenu.style.width = '100%';
  pauseMenu.style.height = '100%';
  pauseMenu.style.display = 'none'; // Hidden by default
  pauseMenu.style.flexDirection = 'column';
  pauseMenu.style.justifyContent = 'center';
  pauseMenu.style.alignItems = 'center';
  pauseMenu.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
  pauseMenu.style.zIndex = '20';
  
  // Function to create buttons
  const createButton = (text, id) => {
    const button = document.createElement('button');
    button.textContent = text;
    button.id = id;
    button.style.margin = '10px';
    button.style.padding = '15px 30px';
    button.style.fontSize = '20px';
    button.style.color = 'white';
    button.style.backgroundColor = '#333';
    button.style.border = '2px solid #666';
    button.style.borderRadius = '5px';
    button.style.cursor = 'pointer';
    button.style.transition = 'background-color 0.3s';
    button.addEventListener('mouseover', () => {
      button.style.backgroundColor = '#555';
    });
    button.addEventListener('mouseout', () => {
      button.style.backgroundColor = '#333';
    });
    return button;
  };
  
  // Add Buttons to Pause Menu
  const resumeButton = createButton('Resume Game', 'resume-game');
  const settingsButton = createButton('Settings', 'pause-settings-button');
  const exitToMainMenuButton = createButton('Exit to Main Menu', 'exit-to-main-menu');
  const exitGameButton = createButton('Exit Game', 'exit-game');
  
  pauseMenu.appendChild(resumeButton);
  pauseMenu.appendChild(settingsButton);
  pauseMenu.appendChild(exitToMainMenuButton);
  pauseMenu.appendChild(exitGameButton);
  
  // Append Pause Menu to the Document
  document.body.appendChild(pauseMenu);
  
  // Create Pause Button
  const pauseButton = document.createElement('button');
  pauseButton.textContent = 'Pause';
  pauseButton.style.position = 'absolute';
  pauseButton.style.top = '10px';
  pauseButton.style.left = '10px';
  pauseButton.style.padding = '10px 20px';
  pauseButton.style.fontSize = '16px';
  pauseButton.style.color = 'white';
  pauseButton.style.backgroundColor = '#333';
  pauseButton.style.border = '2px solid #666';
  pauseButton.style.borderRadius = '5px';
  pauseButton.style.cursor = 'pointer';
  pauseButton.style.zIndex = '999';
  pauseButton.style.userSelect = 'none';
  
  // Attach event listener to the Pause Button
  pauseButton.addEventListener('click', () => {
    gameAudiosounds.GAbuttonClick.play();
    togglePause(); // Use togglePause for consistency
  });
  
  // Append Pause Button to the Document
  document.body.appendChild(pauseButton);
  
  // Function to toggle pause menu
  function togglePause() {
    isPaused = !isPaused;
    pauseMenu.style.display = isPaused ? 'flex' : 'none';
    if (isPaused) {
      console.log('Game paused');
      // Add logic to pause game logic or animations here
    } else {
      console.log('Game resumed');
      // Add logic to resume game logic or animations here
    }
  }
  
  // Resume Game Button
  resumeButton.addEventListener('click', () => {
    gameAudiosounds.GAbuttonClick.play();
    togglePause(); // Use togglePause to resume game
  });
  
  // Open Settings Menu
  settingsButton.addEventListener('click', () => {
    gameAudiosounds.GAbuttonClick.play();
    pauseMenu.style.display = 'none'; // Hide pause menu
    settingsPanel.style.display = 'flex'; // Show settings panel
  });
  
  // Close Settings and Return to Pause Menu
  const closeSettingsButton = document.getElementById('close-settings');
  closeSettingsButton.addEventListener('click', () => {
    gameAudiosounds.GAbuttonClick.play();
    settingsPanel.style.display = 'none'; // Hide settings panel
    pauseMenu.style.display = 'flex'; // Return to pause menu
  });
  
  // Exit to Main Menu Button
  exitToMainMenuButton.addEventListener('click', () => {
    gameAudiosounds.GAbuttonClick.play();
    window.location.reload(); // Reload the page to go back to the main menu
  });
  
  // Exit Game Button
  exitGameButton.addEventListener('click', () => {
    gameAudiosounds.GAbuttonClick.play();
    alert('Thanks for playing!');
    window.close();
  });

  // Initial scene setup
  const gameWindow = document.getElementById('render-target');
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x777777);
  
  const camera = createCamera(gameWindow);

  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(gameWindow.offsetWidth, gameWindow.offsetHeight);
  gameWindow.appendChild(renderer.domElement);
  
  const gameAudiosounds = {
    GAbackgroundMusic: new Audio('./public/Audio/Music/Game Song.mp3'),
    GAbuttonClick: new Audio('./public/Audio/SFX/click.mp3'),
    GAearthquake: new Audio('./public/Audio/SFX/earthquake.mp3'),
    GAforestAm: new Audio('./public/Audio/SFX/forest ambience.mp3'),
    GAlavaAm: new Audio('./public/Audio/SFX/lava ambience.mp3'),
    GAoceanAm: new Audio('./public/Audio/SFX/ocean ambience.mp3'),
    GAfruits: new Audio('./public/Audio/SFX/fruits.mp3'),
    GAmetal: new Audio('./public/Audio/SFX/metal.mp3'),
    GAstone: new Audio('./public/Audio/SFX/stone.mp3'),
    GAwood: new Audio('./public/Audio/SFX/wood.mp3'),
    GAupSuccess: new Audio('./public/Audio/SFX/upgrade success.mp3'),
    GAupFailed: new Audio('./public/Audio/SFX/upgrade fail.mp3'),

  };

      gameAudiosounds.GAbackgroundMusic.loop = true;
      gameAudiosounds.GAforestAm.loop = true;
      gameAudiosounds.GAlavaAm.loop = true;
      gameAudiosounds.GAoceanAm.loop = true;


      const musicVolumeSlider = document.getElementById('music-volume');
      const sfxVolumeSlider = document.getElementById('sfx-volume');

      // Update music volume when slider changes
      musicVolumeSlider.addEventListener('input', (e) => {
        const musicVolume = e.target.value / 100; // Convert 0-100 range to 0-1
        gameAudiosounds.GAbackgroundMusic.volume = musicVolume; // Adjust the volume
        gameAudiosounds.GAforestAm.volume = musicVolume; // Adjust the volume
        gameAudiosounds.GAlavaAm.volume = musicVolume; // Adjust the volume
        gameAudiosounds.GAoceanAm.volume = musicVolume; // Adjust the volume
        // gameAudiosounds.GAbackgroundMusic.volume = musicVolume; // Adjust the volume
        console.log('Music volume:', musicVolume);
      });

      // Update sound effects volume when slider changes
      sfxVolumeSlider.addEventListener('input', (e) => {
        const sfxVolume = e.target.value / 100; // Convert 0-100 range to 0-1
        gameAudiosounds.GAbuttonClick.volume = sfxVolume; // Adjust the volume
        gameAudiosounds.GAearthquake.volume = sfxVolume; // Adjust the volume
        gameAudiosounds.GAfruits.volume = sfxVolume; // Adjust the volume
        gameAudiosounds.GAmetal.volume = sfxVolume; // Adjust the volume
        gameAudiosounds.GAwood.volume = sfxVolume; // Adjust the volume
        gameAudiosounds.GAstone.volume = sfxVolume; // Adjust the volume
        gameAudiosounds.GAupSuccess.volume = sfxVolume; // Adjust the volume
        gameAudiosounds.GAupFailed.volume = sfxVolume; // Adjust the volume
        console.log('Sound effects volume:', sfxVolume);
      });
      
  //island
  const models = [
    { path: "../public/Models/Island/metal/metal1.gltf", position: [-6, 0.1, 6], scale: 1, name:"Metal" }, // Metal
    { path: "../public/Models/Island/forest/forest.gltf", position: [6, 1, -6], scale: 1.5,name:"Wood" }, // Forest
    { path: "../public/Models/Island/stone/stone.gltf", position: [-6, 0, -6], scale: .3, name: "Stone"}, // Stone
    { path: "../public/Models/Island/food/food.gltf", position: [6, 2, 6], scale: 1,name: "Food" }, // Food
  ];
  
  //moutain
  const decomodels = [
    { path: "../public/Models/Moutain/Moutain0.gltf", position: [-17, .4, 17], scale: 2, name:"deco" }, 
    { path: "../public/Models/Moutain/Moutain0.gltf", position: [-21, .4, 10], scale: 2, name:"deco" }, 
    { path: "../public/Models/Moutain/Moutain0.gltf", position: [-20, .4, 5], scale: 2, name:"deco" }, 
    { path: "../public/Models/Moutain/Moutain0.gltf", position: [-18, .4, 0], scale: 2, name:"deco" }, 
    { path: "../public/Models/Moutain/Moutain0.gltf", position: [-22, .4, -5], scale: 2, name:"deco" }, 
    { path: "../public/Models/Moutain/Moutain0.gltf", position: [-17, .4, -12], scale: 2, name:"deco" }, 

    { path: "../public/Models/Moutain/Moutain1.gltf", position: [-17-5, .4, 17], scale: 1,name:"deco" }, 
    { path: "../public/Models/Moutain/Moutain1.gltf", position: [-21-2, .4, 10], scale: 1,name:"deco" }, 
    { path: "../public/Models/Moutain/Moutain1.gltf", position: [-20-3, .4, 5], scale: 1,name:"deco" }, 
    { path: "../public/Models/Moutain/Moutain1.gltf", position: [-18-5, .4, 0], scale: 1,name:"deco" }, 
    { path: "../public/Models/Moutain/Moutain1.gltf", position: [-22-6, .4, -5], scale: 1,name:"deco" }, 
    { path: "../public/Models/Moutain/Moutain1.gltf", position: [-17-2, .4, -12], scale: 1,name:"deco" }, 

    { path: "../public/Models/Moutain/Moutain0.gltf", position: [10+2, .4, 17], scale: 2, name:"deco" }, 
    { path: "../public/Models/Moutain/Moutain0.gltf", position: [10+4, .4, 10], scale: 2, name:"deco" }, 
    { path: "../public/Models/Moutain/Moutain0.gltf", position: [10+6, .4, 5], scale: 2, name:"deco" }, 
    { path: "../public/Models/Moutain/Moutain0.gltf", position: [10+3, .4, 0], scale: 2, name:"deco" }, 
    { path: "../public/Models/Moutain/Moutain0.gltf", position: [10+5, .4, -5], scale: 2, name:"deco" }, 
    { path: "../public/Models/Moutain/Moutain0.gltf", position: [8+2, .4, -12], scale: 2, name:"deco" }, 

    { path: "../public/Models/Moutain/Moutain1.gltf", position: [8+2+4, .4, 17], scale: 1,name:"deco" }, 
    { path: "../public/Models/Moutain/Moutain1.gltf", position: [8+2+6, .4, 10], scale: 1,name:"deco" }, 
    { path: "../public/Models/Moutain/Moutain1.gltf", position: [10+2+3, .4, 5], scale: 1,name:"deco" }, 
    { path: "../public/Models/Moutain/Moutain1.gltf", position: [8+2+8, .4, 0], scale: 1,name:"deco" }, 
    { path: "../public/Models/Moutain/Moutain1.gltf", position: [10+2+6, .4, -5], scale: 1,name:"deco" }, 
    { path: "../public/Models/Moutain/Moutain1.gltf", position: [8+2+3, .4, -12], scale: 1,name:"deco" }, 

    { path: "../public/Models/Moutain/Moutain0.gltf", position: [-17, .4, 17], scale: 2, name:"deco" }, 
    { path: "../public/Models/Moutain/Moutain0.gltf", position: [-9, .4, 20+2], scale: 2, name:"deco" }, 
    { path: "../public/Models/Moutain/Moutain0.gltf", position: [0, .4, 20+3], scale: 2, name:"deco" }, 
    { path: "../public/Models/Moutain/Moutain0.gltf", position: [10, .4, 20+2], scale: 2, name:"deco" }, 

    { path: "../public/Models/Moutain/Moutain1.gltf", position: [-17, .4, 20+5], scale: 1,name:"deco" }, 
    { path: "../public/Models/Moutain/Moutain1.gltf", position: [-9, .4, 20+3], scale: 1,name:"deco" }, 
    { path: "../public/Models/Moutain/Moutain1.gltf", position: [0, .4, 20+5], scale: 1,name:"deco" }, 
    { path: "../public/Models/Moutain/Moutain1.gltf", position: [10, .4, 20+2], scale: 1,name:"deco" }, 
    { path: "../public/Models/Moutain/Moutain1.gltf", position: [5, .4, 20+3], scale: 1,name:"deco" }, 
    { path: "../public/Models/Moutain/Moutain1.gltf", position: [-5, .4, 20+1], scale: 1,name:"deco" }, 

    { path: "../public/Models/Moutain/Moutain0.gltf", position: [-17, .4, -17], scale: 2, name:"deco" }, 
    { path: "../public/Models/Moutain/Moutain0.gltf", position: [-9, .4, -20+2], scale: 2, name:"deco" }, 
    { path: "../public/Models/Moutain/Moutain0.gltf", position: [0, .4, -20+3], scale: 2, name:"deco" }, 
    { path: "../public/Models/Moutain/Moutain0.gltf", position: [10, .4, -20+2], scale: 2, name:"deco" }, 

    { path: "../public/Models/Moutain/Moutain1.gltf", position: [-17, .4, -20+5], scale: 1,name:"deco" }, 
    { path: "../public/Models/Moutain/Moutain1.gltf", position: [-9, .4, -20+3], scale: 1,name:"deco" }, 
    { path: "../public/Models/Moutain/Moutain1.gltf", position: [0, .4, -20+5], scale: 1,name:"deco" }, 
    { path: "../public/Models/Moutain/Moutain1.gltf", position: [10, .4, -20+2], scale: 1,name:"deco" }, 
    { path: "../public/Models/Moutain/Moutain1.gltf", position: [5, .4, -20+3], scale: 1,name:"deco" }, 
    { path: "../public/Models/Moutain/Moutain1.gltf", position: [-5, .4, -20+1], scale: 1,name:"deco" }, 

    

    
  ];

  //time machine
  const timeMachineModels = [
    "../public/Models/Time Machine/Time Machine 0.gltf",
    "../public/Models/Time Machine/Time Machine 25.gltf",
    "../public/Models/Time Machine/Time Machine 50.gltf",
    "../public/Models/Time Machine/Time Machine 75.gltf",
    "../public/Models/Time Machine/Time Machine 100.gltf",
  ];

  const versionCosts = [0, 0, 0, 0, 0]; // Costs for versions: 0, 25, 50, 75, 100
  let currentVersionIndex = 0; // Track the current version
  let timeMachineModel = null; // Reference to the currently displayed model


  const gltfLoader = new GLTFLoader();
  let centerModel = null;
  const loadedModels = [];
  const loadedDecoModels = [];
  const clickCounts = [0, 0, 0, 0]; //kilograms count
  
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = .2;
  
  //hdri
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
      model.position.set(0.5, -0.1, 0.5); // Adjust position if needed
      model.scale.set(1, 1, 1);
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
  // Load the OCean model
  gltfLoader.load("../public/Models/Ocean/ocean.gltf", function(glb) {
      const groundModel = glb.scene;
      groundModel.position.set(0, 0.1, 0); // Center it at the origin (adjust Y if needed)
      groundModel.scale.set(1.5, 1, 1.5); // Adjust scale for the ground
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

// Load the time machine model
function loadTimeMachineModel(versionIndex) {
  if (timeMachineModel) {
    scene.remove(timeMachineModel); // Unload the current model if it exists
  }

  gltfLoader.load(
    timeMachineModels[versionIndex],
    (glb) => {
      timeMachineModel = glb.scene;
      timeMachineModel.position.set(0.5, 1, 0.2);
      timeMachineModel.scale.set(0.05, 0.05, 0.05);
      scene.add(timeMachineModel);

      console.log(`Time Machine version ${versionIndex * 25} loaded successfully!`);

      // Check if the Time Machine 100 is loaded
      if (versionIndex === timeMachineModels.length - 1) {
        showWinMessage();
        playMaxLevelCutscene();
      }
    },
    (xhr) => {
      console.log(
        `Time Machine model version ${
          versionIndex * 25
        } loading: ${(xhr.loaded / xhr.total) * 100}% loaded`
      );
    },
    (error) => {
      console.error(`Error loading Time Machine model version ${versionIndex * 25}:`, error);
    }
  );
}
// Load the initial model
loadTimeMachineModel(currentVersionIndex);

function attemptUpgrade() {
  const nextVersionIndex = currentVersionIndex + 1;

  if (nextVersionIndex >= timeMachineModels.length) {
    console.log("Maximum version reached. No further upgrades.");
    return;
  }

  const requiredCost = versionCosts[nextVersionIndex];
  const hasEnoughClicks = clickCounts.every((count) => count >= requiredCost);

  if (hasEnoughClicks) {
    // Deduct the required cost from all click counters
    gameAudiosounds.GAupSuccess.play();
    clickCounts = clickCounts.map((count) => count - requiredCost);

    // Load the next version of the Time Machine
    currentVersionIndex = nextVersionIndex;
    loadTimeMachineModel(currentVersionIndex);
  } else {
    console.log(
      `Not enough clicks to upgrade. Version ${nextVersionIndex * 25} requires ${requiredCost} clicks on each object.`
    );
    
    gameAudiosounds.GAupFailed.play();
  }
}
function playMaxLevelCutscene() {
  // Create a cutscene video element
  const cutsceneVideo = document.createElement('video');
  cutsceneVideo.id = 'max-level-cutscene';
  cutsceneVideo.src = './public/Video/cutscene2.mp4'; // Replace with your video path
  cutsceneVideo.style.position = 'absolute';
  cutsceneVideo.style.top = '0';
  cutsceneVideo.style.left = '0';
  cutsceneVideo.style.width = '100%';
  cutsceneVideo.style.height = '100%';
  cutsceneVideo.style.objectFit = 'cover';
  cutsceneVideo.style.zIndex = '100';
  cutsceneVideo.autoplay = true;
  cutsceneVideo.controls = false;
  cutsceneVideo.muted = false;

  // Append the video to the document body
  document.body.appendChild(cutsceneVideo);
  displaySceneText(`Your time machine is back in one piece, you are back in time!`);

  // Listen for the end of the video
  cutsceneVideo.addEventListener('ended', () => {
    console.log("Cutscene ended. Returning to main menu...");
    
    // Remove the video from the DOM
    document.body.removeChild(cutsceneVideo);

    // Redirect to the main menu
    // loadMainMenu();
  });

  // // Optional: Add a skip button for the cutscene
  // const skipButton = document.createElement('button');
  // skipButton.textContent = 'Skip';
  // skipButton.style.position = 'absolute';
  // skipButton.style.top = '10px';
  // skipButton.style.right = '10px';
  // skipButton.style.zIndex = '101';
  // skipButton.addEventListener('click', () => {
  //   console.log("Cutscene skipped. Returning to main menu...");
  //   cutsceneVideo.pause();
  //   cutsceneVideo.dispatchEvent(new Event('ended')); // Simulate video ending
  // });
  // document.body.appendChild(skipButton);
}
function showWinMessage() {
  // Create a div element for the "You Won" message
  const winMessage = document.createElement("div");
  winMessage.textContent = "You Won!";
  winMessage.style.position = "absolute";
  winMessage.style.top = "50%";
  winMessage.style.left = "50%";
  winMessage.style.transform = "translate(-50%, -50%)";
  winMessage.style.padding = "20px";
  winMessage.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
  winMessage.style.color = "white";
  winMessage.style.fontSize = "2rem";
  winMessage.style.fontWeight = "bold";
  winMessage.style.borderRadius = "10px";
  winMessage.style.zIndex = "1000";

  // Append the message to the document body
  document.body.appendChild(winMessage);

  // Optionally, remove the message after a few seconds
  setTimeout(() => {
    winMessage.remove();
  }, 5000);
}

  //clickable island
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
  //deco moutain
  decomodels.forEach((decomodels, index) => {
    gltfLoader.load(
      decomodels.path,
      (gltf) => {
        const gltfModel = gltf.scene;
        gltfModel.position.set(...decomodels.position);
        gltfModel.scale.set(decomodels.scale, decomodels.scale, decomodels.scale); // Scale adjustment
        scene.add(gltfModel);

         // Track the model with its index
         loadedDecoModels.push({ model: gltfModel, index });

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
 // Labels and click counters
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

// Define upgrade costs for each version of the Time Machine
const upgradeCosts = [20, 50, 80, 100, 10000]; // Adjust as needed
let currentCost = upgradeCosts[0]; // Start with the cost of the first upgrade

const labels = models.map((model, index) => {
  const label = document.createElement('div');
  label.textContent = `${model.name}: 0 Kilograms / ${currentCost} Kilograms`;
  label.style.marginBottom = '5px';
  label.style.userSelect = 'none';
  labelContainer.appendChild(label);
  return label;
});

setupLights();

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function updateLabels() {
  // Update all labels with current and required amounts
  for (let i = 0; i < models.length; i++) {
    labels[i].textContent = `${models[i].name}: ${clickCounts[i]} Kilograms / ${currentCost} Kilograms`;
  }
}

function onDocumentMouseDown(event) {
  // Convert mouse position to normalized device coordinates
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Update the raycaster
  raycaster.setFromCamera(mouse, camera.camera);

  // Check for intersections with loaded models and the time machine model
  const intersects = raycaster.intersectObjects(
    [...loadedModels.map(item => item.model), timeMachineModel].filter(Boolean),
    true
  );

  if (intersects.length > 0) {
    const intersected = intersects[0].object;

    // Check if the intersected object is part of a loaded model
    const clickedModel = loadedModels.find(item => {
      let parent = intersected;
      while (parent) {
        if (item.model === parent) return true;
        parent = parent.parent;
      }
      return false;
    });

    if (clickedModel) {
      // Handle click on loaded models
      const index = clickedModel.index;
      clickCounts[index]++;
      updateLabels(); // Update labels after click

      // Play corresponding sound
      if (index === 0) {
        gameAudiosounds.GAmetal.play();
      } else if (index === 1) {
        gameAudiosounds.GAwood.play();
      } else if (index === 2) {
        gameAudiosounds.GAstone.play();
      } else if (index === 3) {
        gameAudiosounds.GAfruits.play();
      }

      // Store the original Y position
if (!clickedModel.originalY) {
  clickedModel.originalY = clickedModel.model.position.y; // Set it once during initialization
}

// Ensure no stacking or leftover animations
gsap.killTweensOf(clickedModel.model.position);

// Animate the bounce
gsap.to(clickedModel.model.position, {
  y: clickedModel.originalY + 0.2, // Move up relative to original position
  duration: 0.2,
  ease: "power1.out",
  yoyo: true,
  repeat: 1, // Bounce back to the original position
  onComplete: () => {
    // Ensure Y position is corrected after animation
    clickedModel.model.position.y = clickedModel.originalY;
  },
});

      // gsap.to(clickedModel.model.position, {
      //   y: clickedModel.model.position.y + 0.2, // Move up by 0.2 units
      //   duration: 0.2,
      //   ease: "power1.out",
      //   yoyo: true,
      //   repeat: 1, // Bounce back to original position
      //   overwrite: 'auto' // Overwrite any ongoing animations
      // });

      // return; // Exit early if a loaded model was clicked
    }

    // Handle click on the Time Machine model
    if (timeMachineModel) {
      let parent = intersected;
      while (parent) {
        if (timeMachineModel === parent) {
          // Check if all indices 0-3 have at least the required clicks for the current version
          const canUpgrade = clickCounts.slice(0, 4).every(count => count >= currentCost);

          if (canUpgrade) {
            // Deduct the required cost from the click counts of indices 0-3
            for (let i = 0; i < 4; i++) {
              clickCounts[i] -= currentCost;
              gameAudiosounds.GAupSuccess.play();
            }

            // Increment the version index and update the current cost
            currentVersionIndex = (currentVersionIndex + 1) % upgradeCosts.length;
            currentCost = upgradeCosts[currentVersionIndex]; // Update the cost for the next upgrade

            // Load the next version of the model
            loadTimeMachineModel(currentVersionIndex);

            // Check if the last version is loaded and display the win message
            if (currentVersionIndex === timeMachineModels.length - 1) {
              showWinMessage();
              playMaxLevelCutscene();
            }

            // Update labels after the upgrade
            updateLabels();
          } else {
            console.log(`Not enough resources to upgrade the Time Machine. Current cost: ${currentCost}`);
            gameAudiosounds.GAupFailed.play();
          }
          break;
        }
        parent = parent.parent;
      }
    }
  }
}


// Attach the combined event listener
gameWindow.addEventListener("mousedown", onDocumentMouseDown);

  
  // Attach the combined event listener
  gameWindow.addEventListener("mousedown", onDocumentMouseDown);

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
          return 0.01; // Minimum intensity for nighttime
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
      if (!isPaused) {
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
      }
      
      requestAnimationFrame(animateSunAndMoon);
  }
  
    animateSunAndMoon();
  }
  
  let lastEarthquakeTime = 0; // Tracks the last time an earthquake occurred
const EARTHQUAKE_INTERVAL = 15000; // 15 seconds in milliseconds
const EARTHQUAKE_CHANCE = 0.5; // 30% chance

function earthquakeloop(currentTime) {
  if (!isPaused) {
    // Check if it's time for the earthquake
    if (currentTime - lastEarthquakeTime >= EARTHQUAKE_INTERVAL) {
      lastEarthquakeTime = currentTime;

      // Randomly determine if the earthquake should happen
      if (Math.random() < EARTHQUAKE_CHANCE) {
        gameAudiosounds.GAearthquake.play();
        console.log("Earthquake triggered!");
        camera.earthquake(2, 0.7); // Trigger the earthquake for 3 seconds with 0.7 intensity

        // Deduct 10 from clickCounts and clamp to a minimum of 0
        for (let i = 0; i < 4; i++) {
          const maxDeduction = Math.floor(clickCounts[i] * 0.8); // Maximum 80% deduction
          const randomDeduction = Math.floor(Math.random() * (maxDeduction + 1)); // Random number between 0 and maxDeduction
          clickCounts[i] = Math.max(0, clickCounts[i] - randomDeduction);
          labels[i].textContent = `${models[i].name}: ${clickCounts[i]} Kilograms / ${currentCost} Kilograms`;
        }        
      } else {
        console.log("No earthquake this time.");
      }
    }
  }
  // Continue the game loop
  requestAnimationFrame(earthquakeloop);
}


// Start the game loop
requestAnimationFrame(earthquakeloop);

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
      gameAudiosounds.GAbackgroundMusic.play();
      gameAudiosounds.GAforestAm.play();
      gameAudiosounds.GAlavaAm.play();
      gameAudiosounds.GAoceanAm.play();

      displaySceneText(`Click on those 4 islands around to collect resources to fix your time machine!! 
        10KG for each type to the first Level, 20KG, 30KG and 40KG for the last level`);
      // displaySceneText(`10KG for each type to the first Level, 20, 30, 40`);

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


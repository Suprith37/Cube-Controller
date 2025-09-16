
let scene, camera, renderer, cube;

// Inition rotation speed
let rotationSpeed = 0.01;

// Limits for how far the cube can move on x and y axes
const boundaries = { x: 5, y: 5 };

const BASE_URL = "https://cube-controller.onrender.com"

// Get reference to feedback text element for showing messages
const feedback = document.getElementById('feedback');

// When the speed slider is moved, update the rotation speed and show the value
document.getElementById('speed-slider').addEventListener('input', (e) => {
  rotationSpeed = parseFloat(e.target.value); 
  document.getElementById('speed-val').innerText = rotationSpeed;
});


// Setting up 3D scene 
function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000); // Set background color to black

  // Create a perspective camera (FOV, aspect ratio, near, far)
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5; // Move camera away so we can see the cube

  // Create a WebGL renderer and attach it to the canvas in HTML
  renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('cube-canvas') });
  renderer.setSize(window.innerWidth, window.innerHeight); // Match window size
  renderer.outputEncoding = THREE.sRGBEncoding; // Set color encoding for brightness



  const materials = new THREE.MeshStandardMaterial({color : 0xff6347})
  
  // Create cube geometry and yellow material with lighting effects
  const geometry = new THREE.BoxGeometry(2,2,2); // Basic box shape
  cube = new THREE.Mesh(geometry, materials); // Combine shape and material into a mesh
  scene.add(cube); // Add cube to the scene


  // Add a bright point light that shines from a point in space
  const pointLight = new THREE.PointLight(0xffffff, 2, 100);
  pointLight.position.set(10, 10, 10); // Light's position
  scene.add(pointLight);


  // Add a directional light to give soft gradient lighting
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
  directionalLight.position.set(-5, 5, 5);
  scene.add(directionalLight);

  
  // Add ambient light to softly light everything a little bit
  const ambientLight = new THREE.AmbientLight(0x303030);
  scene.add(ambientLight);

 
  animate();

  // Fetch saved cube data from backend (position and speed)
  fetch('${BASE_URL}/api/cubes/cube_1')
    .then(res => res.json())
    .then(data => {
      // Set cube's position and speed from database
      cube.position.set(data.position.x, data.position.y, data.position.z);
      rotationSpeed = data.rotationSpeed;

      // Update slider and speed label to match the loaded value
      document.getElementById('speed-slider').value = rotationSpeed;
      document.getElementById('speed-val').innerText = rotationSpeed;
    });
}

// This function updates the cube on every animation frame
function animate() {
  requestAnimationFrame(animate); // Call itself repeatedly for smooth animation

  cube.rotation.y += rotationSpeed; // Rotate cube on Y-axis based on slider value
  cube.rotation.x += rotationSpeed;

  renderer.render(scene, camera); // Show the updated scene with cube
}

// Move cube based on button clicked and limit it within screen boundaries
function move(direction) {
  const step = 0.2; // How much to move each time

  if (direction === 'up' && cube.position.y < boundaries.y) cube.position.y += step;
  if (direction === 'down' && cube.position.y > -boundaries.y) cube.position.y -= step;
  if (direction === 'left' && cube.position.x > -boundaries.x) cube.position.x -= step;
  if (direction === 'right' && cube.position.x < boundaries.x) cube.position.x += step;
}

// Reset cube's position and speed to default values
function resetCube() {
  cube.position.set(0, 0, 0); // Back to center
  rotationSpeed = 0.01; // Default speed
  document.getElementById('speed-slider').value = rotationSpeed;
  document.getElementById('speed-val').innerText = rotationSpeed;

  // Call backend to reset cube data in database
  fetch('${BASE_URL}/api/cubes/cube_1/reset', { method: 'POST' })
    .then(res => res.json())
    .then(data => showFeedback('Cube reset to default.'));
}

function showFeedback(msg) {
  feedback.textContent = msg;
  setTimeout(() => feedback.textContent = '', 2000);
}
// saving cube' current state
function saveCube() {
  fetch('${BASE_URL}/api/cubes/cube_1/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      position: { 
        x: cube.position.x, 
        y: cube.position.y, 
        z: cube.position.z 
      },
      rotationSpeed
    })
  })
    .then(res => res.json())
    .then(data => showFeedback('State saved successfully.'));
}


// Show temporary message to the user (2 seconds)


// Start the app
init();

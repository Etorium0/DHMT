import * as THREE from "three";
import { GUI } from "dat.gui";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { cameraProjectionMatrix } from "three/examples/jsm/nodes/Nodes.js";

function getPointLight(intensity) {
  const light = new THREE.PointLight(0xffffff, intensity);
  light.castShadow = true;
  return light;
}

function getSpotLight(intensity) {
  const light = new THREE.SpotLight(0xffffff, intensity);
  light.castShadow = true;
  light.shadow.bias = 0.001;
  light.shadow.mapSize.width = 2048;
  light.shadow.mapSize.height = 2048;
  light.penumbra = 0.1;
  return light;
}

function getDirectionalLight(intensity) {
  const light = new THREE.DirectionalLight(0xffffff, intensity);
  light.castShadow = true;
  light.shadow.camera.left = -5;
  light.shadow.camera.bottom = -5;
  light.shadow.camera.right = 5;
  light.shadow.camera.top = 5;
  return light;
}

function getAmbientLight(intensity) {
  return new THREE.AmbientLight("rgb(255, 255, 255)", intensity);
}

function getLightByType(type) {
  switch (type) {
    case "PointLight":
      return getPointLight(100);
    case "SpotLight":
      return getSpotLight(100);
    case "DirectionalLight":
      return getDirectionalLight(100);
    case "AmbientLight":
      return getAmbientLight(100);
    default:
      return getPointLight(100);
  }
}

function update(scene, camera, renderer, controls, gui) {
  renderer.render(scene, camera);
  requestAnimationFrame(() => update(scene, camera, renderer, controls, gui));
  controls.update();
  gui.updateDisplay();
}

function getSphere(radius) {
  const geometry = new THREE.SphereGeometry(radius, 24, 24);
  const material = new THREE.MeshBasicMaterial({ color: "rgb(255, 255, 255)" });
  const mesh = new THREE.Mesh(geometry, material);
  return mesh;
}

function run() {
  // Scene
  const scene = new THREE.Scene();

  // Cam
  let camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.1,
    2000
  );
  camera.position.z = 6;

  // Renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor({ color: "rgb(120, 120, 120)" });
  renderer.shadowMap.enabled = true;
  document.body.appendChild(renderer.domElement);

  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshPhongMaterial({ color: "rgb(120, 120, 120)" });
  const cube = new THREE.Mesh(geometry, material);
  cube.castShadow = true;
  scene.add(cube);

  const planeGeometry = new THREE.PlaneGeometry(100, 100, 100, 100);
  const planeMaterial = new THREE.MeshPhongMaterial({
    color: "rgb(120, 120, 120)",
    side: THREE.DoubleSide,
  });
  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.rotation.x = Math.PI / 2;
  plane.position.y = -1;
  plane.receiveShadow = true;
  scene.add(plane);

  const controls = new OrbitControls(camera, renderer.domElement);

  const gui = new GUI();

  let light = getPointLight(100);
  let sphere = getSphere(0.05);
  light.position.x = 0;
  light.position.y = 2;
  light.position.z = 0;
  light.add(sphere);
  scene.add(light);

  document.getElementById("lightType").addEventListener("change", function () {
    const type = this.value;
    // Get current pos
    const lightPosition = { ...light.position };

    scene.remove(light);

    // Remove old light folder
    lightFolder.remove(lightPositionX);
    lightFolder.remove(lightPositionY);
    lightFolder.remove(lightPositionZ);
    lightFolder.remove(lightIntensity);
    lightFolder.remove(lightColor);

    light = getLightByType(type);
    light.position.set(lightPosition.x, lightPosition.y, lightPosition.z);

    // Reset sphere color
    sphere.material.color.set("rgb(255, 255, 255)");
    light.add(sphere);
    scene.add(light);

    // Add new light folder
    lightPositionX = lightFolder
      .add(light.position, "x", -10, 10)
      .name("Position X");
    lightPositionY = lightFolder
      .add(light.position, "y", -10, 10)
      .name("Position Y");
    lightPositionZ = lightFolder
      .add(light.position, "z", -10, 10)
      .name("Position Z");
    lightIntensity = lightFolder
      .add(light, "intensity", 0, 100)
      .name("Intensity");
    lightColor = lightFolder
      .addColor({ color: "rgb(255, 255, 255)" }, "color")
      .name("Color")
      .onChange(function (color) {
        const rgbColor = new THREE.Color(color);
        light.color.set(rgbColor);
        sphere.material.color.set(rgbColor);
      });
  });

  // Geometry folder
  const geometryFolder = gui.addFolder("Mesh Geometry");
  geometryFolder.open();

  // Rotation subfolder
  const rotationFolder = geometryFolder.addFolder("Rotation");
  rotationFolder
    .add(cube.rotation, "x", -Math.PI, Math.PI)
    .name("Rotate X Axis");
  rotationFolder
    .add(cube.rotation, "y", -Math.PI, Math.PI)
    .name("Rotate Y Axis");
  rotationFolder
    .add(cube.rotation, "z", -Math.PI, Math.PI)
    .name("Rotate Z Axis");
  rotationFolder.open();

  // Scale subfolder
  const scaleFolder = geometryFolder.addFolder("Scale");
  scaleFolder.add(cube.scale, "x", 0, 3).name("Scale X Axis");
  scaleFolder.add(cube.scale, "y", 0, 3).name("Scale Y Axis");
  scaleFolder.add(cube.scale, "z", 0, 3).name("Scale Z Axis");
  scaleFolder.open();
  // Camera folder
  const cameraFolder = gui.addFolder("Camera");
  cameraFolder.add(camera.position, "x", -10, 10).name("Position X");
  cameraFolder.add(camera.position, "y", -10, 10).name("Position Y");
  cameraFolder.add(camera.position, "z", 0, 10).name("Position Z");
  cameraFolder
    .add(camera, "fov", 1, 180)
    .name("Field of View")
    .onChange(() => {
      camera.updateProjectionMatrix();
    });
  cameraFolder.open();

  // Light folder
  const lightFolder = gui.addFolder("Light");
  let lightPositionX = lightFolder
    .add(light.position, "x", -10, 10)
    .name("Position X");
  let lightPositionY = lightFolder
    .add(light.position, "y", -10, 10)
    .name("Position Y");
  let lightPositionZ = lightFolder
    .add(light.position, "z", -10, 10)
    .name("Position Z");
  let lightIntensity = lightFolder
    .add(light, "intensity", 0, 100)
    .name("Intensity");
  let lightColor = lightFolder
    .addColor({ color: "rgb(255, 255, 255)" }, "color")
    .name("Color")
    .onChange(function (color) {
      const rgbColor = new THREE.Color(color);
      light.color.set(rgbColor);
      sphere.material.color.set(rgbColor);
    });
  lightFolder.open();

  update(scene, camera, renderer, controls, gui);
}
run();

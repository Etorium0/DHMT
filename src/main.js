import * as THREE from "three";
import { GUI } from "dat.gui";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { cameraProjectionMatrix } from "three/examples/jsm/nodes/Nodes.js";

let lookAt = { x: 0, y: 0, z: 0 };
let camera;

let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();

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

function updateLookAt(camera, lookAt) {
  camera.lookAt(new THREE.Vector3(lookAt.x, lookAt.y, lookAt.z));
  camera.updateProjectionMatrix();
}
function update(scene, camera, renderer, controls, gui) {
  updateLookAt(camera, lookAt);
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
  //Scene
  const scene = new THREE.Scene();

  //Cam
  camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.1,
    2000
  );
  camera.position.z = 6;

  //Renderer
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

  const geometry2 = new THREE.BoxGeometry(1, 1, 1);
  const material2 = new THREE.MeshPhongMaterial({
    color: "rgb(120, 120, 120)",
  });
  const cube2 = new THREE.Mesh(geometry2, material2);
  cube2.castShadow = true;
  cube2.position.set(2, 2, 2);
  scene.add(cube2);

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
  let isMouseOverGui = false;

  gui.domElement.addEventListener("mouseover", () => {
    isMouseOverGui = true;
  });

  gui.domElement.addEventListener("mouseout", () => {
    isMouseOverGui = false;
  });

  let light = getPointLight(100);
  let sphere = getSphere(0.05);
  light.position.x = 0;
  light.position.y = 2;
  light.position.z = 0;
  light.add(sphere);
  scene.add(light);

  //Update camera lookAt on clicking object
  window.addEventListener(
    "mousedown",
    (event) => {
      if (!isMouseOverGui) {
        //Update mouse pos
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        //Update raycaster
        raycaster.setFromCamera(mouse, camera);

        let intersects = raycaster.intersectObjects(scene.children);

        //Make the camera look at the object
        if (intersects.length > 0) {
          lookAt = {
            x: intersects[0].object.position.x,
            y: intersects[0].object.position.y,
            z: intersects[0].object.position.z,
          };
          updateLookAt(camera, lookAt);
        }

        lookAtX.setValue(lookAt.x);
        lookAtY.setValue(lookAt.y);
        lookAtZ.setValue(lookAt.z);
      }
    },
    false
  );

  document.getElementById("lightType").addEventListener("change", function () {
    const type = this.value;
    //Get current pos
    const lightPosition = { ...light.position };

    scene.remove(light);

    //Remove old light folder
    for (let i = lightFolder.__controllers.length - 1; i >= 0; i--) {
      lightFolder.remove(lightFolder.__controllers[i]);
    }

    light = getLightByType(type);
    light.position.set(lightPosition.x, lightPosition.y, lightPosition.z);

    //Reset sphere color
    sphere.material.color.set("rgb(255, 255, 255)");
    light.add(sphere);
    scene.add(light);

    //Add new light folder
    lightFolder.add(light.position, "x", -10, 10).name("Position X");
    lightFolder.add(light.position, "y", -10, 10).name("Position Y");
    lightFolder.add(light.position, "z", -10, 10).name("Position Z");
    lightFolder.add(light, "intensity", 0, 100).name("Intensity");
    lightFolder
      .addColor({ color: "rgb(255, 255, 255)" }, "color")
      .name("Color")
      .onChange(function (color) {
        const rgbColor = new THREE.Color(color);
        light.color.set(rgbColor);
        sphere.material.color.set(rgbColor);
      });

    if (type === "SpotLight") {
      lightFolder
        .add(light.shadow.mapSize, "width", 0, 4096)
        .name("ShadowMapW");
      lightFolder
        .add(light.shadow.mapSize, "height", 0, 4096)
        .name("ShadowMapH");
      lightFolder.add(light, "penumbra", 0, 1).name("Penumbra");
    }

    if (type === "DirectionalLight") {
      lightFolder
        .add(light.shadow.camera, "left", -10, 10)
        .name("ShadowCamLeft")
        .onChange(() => {
          light.shadow.camera.updateProjectionMatrix();
        });
      lightFolder
        .add(light.shadow.camera, "right", -10, 10)
        .name("ShadowCamRight")
        .onChange(() => {
          light.shadow.camera.updateProjectionMatrix();
        });
      lightFolder
        .add(light.shadow.camera, "top", -10, 10)
        .name("ShadowCamTop")
        .onChange(() => {
          light.shadow.camera.updateProjectionMatrix();
        });
      lightFolder
        .add(light.shadow.camera, "bottom", -10, 0)
        .name("ShadowCamBottom")
        .onChange(() => {
          light.shadow.camera.updateProjectionMatrix();
        });
    }
  });
  //Camera folder
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

  //LookAt folder
  const lookAtFolder = gui.addFolder("LookAt");
  lookAt = { x: 0, y: 0, z: 0 };
  let lookAtX = lookAtFolder
    .add(lookAt, "x", -10, 10)
    .name("LookAt X")
    .onChange(() => {
      updateLookAt(camera, lookAt);
    })
    .listen();
  let lookAtY = lookAtFolder
    .add(lookAt, "y", -10, 10)
    .name("LookAt Y")
    .onChange(() => {
      updateLookAt(camera, lookAt);
    })
    .listen();
  let lookAtZ = lookAtFolder
    .add(lookAt, "z", -10, 10)
    .name("LookAt Z")
    .onChange(() => {
      updateLookAt(camera, lookAt);
    })
    .listen();
  lookAtFolder.open();

  //Light folder
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

import * as THREE from "three"
import { DegRadHelper } from "./Helper.js"
import { ColorGUIHelper } from "./Helper.js"
import { GUI } from "dat.gui"
import { OrbitControls } from "three/examples/jsm/Addons.js"
import { TransformControls } from "three/examples/jsm/Addons.js"
import Stats from "three/examples/jsm/libs/stats.module.js"
import { TeapotGeometry } from "three/examples/jsm/geometries/TeapotGeometry.js"
import TWEEN from '@tweenjs/tween.js';
import { GLTFLoader } from "three/examples/jsm/Addons.js"

var objList = []
var lightList = []
var lightHelper = []
var tweenList = new Array();
var initialState = []
// globale variables
let camera, scene, renderer
let floor, geometry, material, mesh, lightObj, axes
let gui
let stats
let textureLoader = new THREE.TextureLoader()
var objectLoader = new GLTFLoader()

// controls 
let obControls, afControls
let settings = {
    common: {
        showaxes: false,
        background: 'rgb(80,80,80)',
        showHelper: true,
        
        floorLock: true
    },
    geometry: {
        scale: 1,
        shape: 'cube',
        material: 'basic',
        wireframe: false,
        color: 0x999999,
        opacity: 1
    },
    light: {
        type: "Point Light",
        enable: true,
        shadow: true,
        intensity: 1,
        color: 0xffffff,
        posY: 2,
        posZ: 0,
        posX: 0,
    },
    affine: {
        mode: 'none',
    },
    camera: {
        fov: 75,
        near: 0.1,
        far: 100,
        posX: 1,
        posY: 2,
        posZ: 4,
        lookX: 0,
        lookY: 0,
        lookZ: 0,
        lookAtObj: false,
    },
    animation: {
        play: false,
        type: 'go up and down',
    }
}

$(".mode").click(function chooseTransformMode() {
    var mode = this.value
    console.log(mode)
    switch (mode) {
        case "translate":
            afControls.setMode(mode)
            break
        case "scale":
            afControls.setMode(mode)
            break
        case "rotate":
            afControls.setMode(mode)
            break
    }       
})
var id = 1
$(".geometry").click(function chooseGeometry() {
    var geometryName = $(this).text()
    var geometry
    var material = new THREE.MeshBasicMaterial({transparent: true, color: 'white', side: THREE.DoubleSide, name: 'basic' })
    console.log(geometryName)
        switch (geometryName) {
            case "Box":
                geometry = new THREE.BoxGeometry(1, 1, 1)
                break
            case "Sphere":
                geometry = new THREE.SphereGeometry(1, 32, 32)
                break
            case "Cone":
                geometry = new THREE.ConeGeometry(1, 2, 32)
                break
            case "Cylinder":
                geometry = new THREE.CylinderGeometry(1, 1, 1, 32)
                break
            case "Torus":
                geometry = new THREE.TorusGeometry(1, 0.3, 32, 32)
                break
            case "Torus Knot":
                geometry = new THREE.TorusKnotGeometry(1, 0.1, 32, 32)
                break
            case "Teapot":
                geometry = new TeapotGeometry(0.5)
                break
            case "Dinosaur":
                loadGLFT('./assets/models/dinosaur/scene.gltf', -90, 0, 0)
                geometry = null
                break;
            case "Toilet Paper":
                loadGLFT('./assets/models/simple_toilet_paper_2.0/scene.gltf', 90, 0, 0)
                geometry = null
                break;
        }
        if (geometry != null)
            {
                var mesh = new THREE.Mesh(geometry, material)
                mesh.name = id++
                mesh.castShadow = true // Shadow (đổ bóng).
                objList[objList.length] = mesh
                scene.add(mesh)
            }
        

        console.log(objList[objList.length-1].name)
}
)

function loadGLFT(url, x = 0, y = 0, z = 0)
{
    objectLoader.load(
        // resource URL
	url,
	// called when the resource is loaded
	function ( gltf ) {
        console.log(gltf)
        gltf.scene.traverse( function ( object ) {

            if ( object.isMesh )
                {
                    object.castShadow = true; // Shadow (đổ bóng).
                    object.name = id++;
                    object.rotation.x = THREE.MathUtils.degToRad(x);
                    object.rotation.y = THREE.MathUtils.degToRad(y);
                    object.rotation.z = THREE.MathUtils.degToRad(z);
                    objList[objList.length] = object;
                    scene.add(object)
                }
        } );


	},
	// called while loading is progressing
	function ( xhr ) {

		console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

	},
	// called when loading has errors
	function ( error ) {

		console.log( error );

	}
    )
}
$(".light").click(function chooseLight() {
    var lightName = $(this).text()
    var val;
    console.log(lightName)
    val = getLightByType(lightName)
    val.name = id++ 
    lightList[lightList.length] = val
    lightHelper[lightHelper.length] = val.helper

    scene.add(val.light)

    if (val.type == 'Spot Light' || val.type == 'Directional Light')
    {
        scene.add(val.light.target)
    }

    if(settings.common.showHelper)
    {
        if (val.type == 'Ambient Light')
        {
            val.light.add(val.helper)
        }
        else
            scene.add(val.helper)
    }
    val.light.name = val.name
    val.helper.name = val.name
    console.log(lightList[lightList.length-1].name)
}
)
init()
initGUI()
animate()

//MOUSE ON CANVAS
var isMouseDown = false
var box, crnbox
var isDragging = false
var mouse = new THREE.Vector2()
var raycaster = new THREE.Raycaster()
document.getElementById("canvas").addEventListener("mousemove", function(event)
{
    if (isDragging) return
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
    raycaster.setFromCamera(mouse, camera)
    
    if (isMouseDown == false) {
        var temp = objList
        if(settings.common.showHelper)
            temp=temp.concat(lightHelper)
        var intersects = raycaster.intersectObjects(temp)
        if (box != null)
            scene.remove(box)
        box = null
        if (intersects.length > 0  && intersects[0].object.name != 'inactive') {
            
           document.body.style.cursor = "pointer"
            if (box == null)
            {
                box = new THREE.BoxHelper( intersects[0].object, 0xffff00 )
                scene.add( box )
                
            }
                return
        } 
        
        document.body.style.cursor = "default"
    }
    else {
        
    }
})

var befMesh
var befLight
document.getElementById("canvas").addEventListener("mousedown", function(event)
{
    isMouseDown = true
    

    if (!isDragging)
    {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
        raycaster.setFromCamera(mouse, camera)
        befMesh = mesh
        befLight = lightObj
        var temp = objList
        if(settings.common.showHelper)
            temp=temp.concat(lightHelper)
        var intersects = raycaster.intersectObjects(temp)
        if (intersects.length > 0 && intersects[0].object.name != 'inactive') {
            if (objList.includes(intersects[0].object))
            {
                mesh = intersects[0].object
                
                lightObj = null
            }
            else
            {
                
                var index = lightHelper.indexOf(intersects[0].object.parent)
                
                if (index == -1)
                {
                    index = lightHelper.indexOf(intersects[0].object)
                }
                lightObj = lightList[index]
                mesh = null
            }
            
        }
    }

    if (mesh == null && g!=null)
    { gui.removeFolder(g)
        g = null}
    if (lightObj == null && l!=null)
    { gui.removeFolder(l)
        l = null}
    
    if (mesh != null)
        {
            
            if (befMesh != mesh)
                {
                    
                    initGeometryGUI()
                    
                    afControls.attach(mesh)
                }
            
        }
    if (lightObj != null)
        {

            if (befLight != lightObj)
                {
                    initLightGUI(lightObj.type)
                    initLightTypeGUI()
                    afControls.attach(lightObj.light)
                }
            
        }
})

document.getElementById("canvas").addEventListener("mouseup", function(event)
{
    isMouseDown = false    
    if (settings.camera.lookAtObj) {
        if(mesh!=null)
            {
                settings.camera.lookX = mesh.position.x
                settings.camera.lookY = mesh.position.y
                settings.camera.lookZ = mesh.position.z
            }
    }
})

document.getElementById("canvas").addEventListener("dblclick", function(event)
{
    
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
    raycaster.setFromCamera(mouse, camera)
    var temp = objList.concat(lightHelper)
    var intersects = raycaster.intersectObjects(temp)
    if (intersects.length <= 0 || (intersects.length > 0 && intersects[0].object.name == 'inactive')) {
            
        if (g!=null)
                gui.removeFolder(g)
        g = null
        if (l!=null)
                gui.removeFolder(l)
        l = null
        mesh = null
        lightObj = null
        afControls.detach()
    } 
})
//CAMERA
function updateLookAt() {
    camera.lookAt(new THREE.Vector3(settings.camera.lookX, settings.camera.lookY, settings.camera.lookZ));
    camera.updateProjectionMatrix();
  }
//LIGHT
function getPointLight(intensity) {
    const light = new THREE.PointLight(0xffffff, intensity);
    light.castShadow = true;
    const helper = new THREE.PointLightHelper(light);
    return {light: light, helper: helper, name: '', type: 'Point Light'};
  }
  
  function getSpotLight(intensity) {
    const light = new THREE.SpotLight(0xffffff, intensity);
    light.castShadow = true;
    light.shadow.bias = 0.001;
    light.shadow.mapSize.width = 2048;
    light.shadow.mapSize.height = 2048;
    light.penumbra = 0.1;
    
    const helper = new THREE.SpotLightHelper(light);
    return {light: light, helper: helper, name: '', type: 'Spot Light'};
  }
  
  function getDirectionalLight(intensity) {
    const light = new THREE.DirectionalLight(0xffffff, intensity);
    light.castShadow = true;
    light.shadow.camera.left = -5;
    light.shadow.camera.bottom = -5;
    light.shadow.camera.right = 5;
    light.shadow.camera.top = 5;
    
    const helper = new THREE.DirectionalLightHelper(light);
    return {light: light, helper: helper, name: '', type: 'Directional Light'};
  }
  
  function getAmbientLight(intensity) {
    const light = new THREE.AmbientLight(0x404040 , intensity)
    var geometry = new THREE.SphereGeometry(0.2, 10, 10)
    var material = new THREE.MeshBasicMaterial({ color: light.color, side: THREE.DoubleSide, name: 'basic' })
    const helper = new THREE.Mesh(geometry, material)
    return {light: light, helper: helper, name: '', type: 'Ambient Light'};
  }

  function getLightByType(type) {
    switch (type) {
      case "Point Light":
        return getPointLight(100);
      case "Spot Light":
        return getSpotLight(100);
      case "Directional Light":
        return getDirectionalLight(100);
      case "Ambient Light":
        return getAmbientLight(100);
    }
  }

  function updateLight()
  {
    if (lightObj == null) return
    if (lightObj.type == 'Ambient Light')
    {
            lightObj.helper.material.color.set(lightObj.light.color.getHex())
            return
    }
        
    else if (lightObj.type == 'Spot Light' || lightObj.type == 'Directional Light')
    {   
            lightObj.light.target.updateMatrixWorld();
    }
    lightObj.helper.update()
    
        
    
  }

//INIT
function init() {
    // scene
    scene = new THREE.Scene()
    scene.background = new THREE.Color(settings.common.background)

    // camera
    camera = new THREE.PerspectiveCamera(settings.camera.fov, window.innerWidth / window.innerHeight, settings.camera.near, settings.camera.far)
    camera.position.set(settings.camera.posX, settings.camera.posY, settings.camera.posZ)
    camera.lookAt(settings.camera.lookX, settings.camera.lookY, settings.camera.lookZ)

    // renderer
    renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    document.body.appendChild(renderer.domElement)
    renderer.domElement.id = "canvas"


    // axes
    axes = new THREE.AxesHelper(100)

    // floor
    geometry = new THREE.PlaneGeometry (10, 10, 10, 10)
    let floorMat = new THREE.MeshPhongMaterial({transparent: true, color: 0x222222, side: THREE.DoubleSide, name: 'phong' })

    // floor mesh
    floor = new THREE.Mesh(geometry, floorMat)
    floor.rotation.x = -Math.PI / 2
    floor.position.y = -0.5
    floor.receiveShadow = true
    floor.name = 'inactive'
    scene.add(floor)

    objList[0] = floor
    

    // transform controls
    obControls = new OrbitControls(camera, renderer.domElement)
    obControls.enableDamping = true
    obControls.dampingFactor = 0.25
    obControls.enableZoom = true
    obControls.minDistance = 0.5
    obControls.maxDistance = 1000
    obControls.minPolarAngle = 0


    // affine controls
    afControls = new TransformControls(camera, renderer.domElement)
    afControls.addEventListener('change', () => {
        // console.log(afControls.object.position)
        renderer.render(scene, camera)
        updateLight()
    })
    afControls.addEventListener('dragging-changed', (event) => {
        if (event.value) {
            obControls.enabled = false
        } else {
            obControls.enabled = true
        }

        isDragging = event.value
    })
    scene.add(afControls)

    // stats
    stats = new Stats()
    stats.showPanel(0)
    
    
    document.body.appendChild(stats.domElement)
    stats.domElement.id = "STAT"


    window.addEventListener('resize', onWindowResize, false)
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.render(scene, camera)
}

function animate() {
    requestAnimationFrame(animate)
    for (let i = 0; i < objList.length; i++)
        {

            var name = objList[i].name
            if (objList[i].name === 'inactive') name = 0;
            if (tweenList[name] != null)
                {
                    tweenList[name].update();
                }
                
        }
        
    gui.updateDisplay();
    updateLookAt();
    stats.update()
    renderer.render(scene, camera)
}

var l = null

function initLightTypeGUI()
{
    var light = lightObj.light
    settings.light.type = lightObj.type
    var matCon = l.add(settings.light, 'type', ['Point Light', 'Spot Light', 'Ambient Light', 'Directional Light'])
    matCon.setValue(settings.light.type)
    matCon.onChange(() => {
        const index = lightList.indexOf(lightObj)
        const lightPosition = { ...light.position };
        const name = lightObj.name
        
        afControls.detach()
        scene.remove(light);
        scene.remove(lightObj.helper);
            
        lightObj = getLightByType(settings.light.type)
        lightList[index] = lightObj
        lightHelper[index] = lightObj.helper
        lightObj.name = name
        lightObj.light.name = name
        lightObj.helper.name = name
        lightObj.light.position.set(lightPosition.x, lightPosition.y, lightPosition.z);

        scene.add(lightObj.light)
        if (lightObj.type == 'Spot Light' || lightObj.type == 'Directional Light')
        {
            scene.add(lightObj.light.target)
        }

        if (lightObj.type == 'Ambient Light')
        {
            lightObj.light.add(lightObj.helper)
        }
        else
            scene.add(lightObj.helper)
        
    
        afControls.attach(lightObj.light)
        initLightGUI(lightObj.type)
        initLightTypeGUI()
    })
}
function initLightGUI(type) 
{
    var light = lightObj.light
    if (l!=null)
        gui.removeFolder(l)

    // geometry
    l = gui.addFolder('light')

    makeXYZGUI(gui, light.position, l, -10, 10, "Position")

    l.add(light, "intensity", 0, 100).name("Intensity");

    if (type === "Spot Light") {
        l.add(light, "penumbra", 0, 1).name("Penumbra");
        makeXYZGUI(gui, light.target.position, l, -20, 20, "Target", updateLight)
        l.add(light, "distance", 0, 40, 0.1).name("Distance").onChange(() => {
            updateLight()
          });
        l.add(new DegRadHelper(light, 'angle'), 'value', 0, 90).name("Angle").onChange(() => {
            updateLight()
          });
    }
    else if (type === "Point Light")
        {
            l.add(light, "distance", 0, 40, 0.1).name("Distance").onChange(() => {
                updateLight()
              });
        }
    else if (type === "Directional Light") {
        
        l
        .add(light.shadow.camera, "bottom", -10, 0)
        .name("ShadowCamBottom")
        .onChange(() => {
          light.shadow.camera.updateProjectionMatrix();
        });

        makeXYZGUI(gui, light.target.position, l, -20, 20, "Target", updateLight)
    }
    l.addColor(new ColorGUIHelper(light, 'color'), 'value').name('Light color').onChange(() => {
        updateLight()
    })

    var obj = { Remove:function(){ removeLight() }};

    l.add(obj,'Remove');

    l.open()
}

var g = null
var textureGui = null
function initGeometryGUI() 
{
    textureGui = null
    if (g!=null)
        gui.removeFolder(g)

    // geometry
    g = gui.addFolder('geometry')

    makeXYZGUI(gui, mesh.scale, g, 0.1, 10, "Scale")

    g.add(new DegRadHelper(mesh.rotation, 'x'), 'value', -180, 180).name('Rotate X')
    g.add(new DegRadHelper(mesh.rotation, 'y'), 'value', -180, 180).name('Rotate Y')
    g.add(new DegRadHelper(mesh.rotation, 'z'), 'value', -180, 180).name('Rotate Z')

    
    settings.geometry.color = mesh.material.color.getHex()
    settings.geometry.material = mesh.material.name
    settings.geometry.opacity = mesh.material.opacity

    var matCon = g.add(settings.geometry, 'material', ['basic', 'lambert', 'phong', 'toon'])
    matCon.setValue(settings.geometry.material)    
    matCon.onChange(() => {
        
        if (settings.geometry.material == 'basic') {
            material = new THREE.MeshBasicMaterial({opacity:settings.geometry.opacity, transparent: true, color: settings.geometry.color, 
                side: THREE.DoubleSide, name: settings.geometry.material,
                map: mesh.material.map})
            if (textureGui != null)
            {   g.remove(textureGui)
                textureGui = null
            }
        } else if (settings.geometry.material == 'lambert') {
            material = new THREE.MeshLambertMaterial({opacity:settings.geometry.opacity,transparent: true, color: settings.geometry.color, 
                side: THREE.DoubleSide, name: settings.geometry.material,
                map: mesh.material.map,
                bumpMap: mesh.material.map })
        } else if (settings.geometry.material == 'phong') {
            material = new THREE.MeshPhongMaterial({opacity:settings.geometry.opacity,transparent: true, color: settings.geometry.color, 
                side: THREE.DoubleSide, name: settings.geometry.material,
                side: THREE.DoubleSide, name: settings.geometry.material,
                map: mesh.material.map,
                bumpMap: mesh.material.map })
        } else if (settings.geometry.material == 'toon') {
            const threeTone = textureLoader.load( '/assets/texture/gradientMap/threeTone.jpg' );
			threeTone.minFilter = THREE.NearestFilter;
			threeTone.magFilter = THREE.NearestFilter;
            material = new THREE.MeshToonMaterial({opacity:settings.geometry.opacity,transparent: true, color: settings.geometry.color, 
                side: THREE.DoubleSide, name: settings.geometry.material, gradientMap: threeTone,
                map: mesh.material.map,
                bumpMap: mesh.material.map })
        } 
        mesh.material = material
        if (mesh.material.name != 'basic' && textureGui == null)
            initTextureGUI()
    })
    g.addColor(settings.geometry, 'color').onChange(() => {
        mesh.material.color.set(settings.geometry.color)
  
    })

    
    g.add(settings.geometry, 'opacity', 0, 1, 0.1).name('Opacity').onChange(()=>{
        var a = settings.geometry.opacity
        mesh.material.opacity = a
        
    })
    g.add(mesh, 'castShadow')

    g.add(mesh, 'receiveShadow')
    var obj = { Remove:function(){ removeObject() }};
    if (mesh.name != floor.name)
        {
            
            g.add(obj,'Remove');
        }
    if (mesh.material.name != 'basic')
        initTextureGUI()
    g.open()
}
function initTextureGUI()
{
    textureGui = g.add(mesh.material, 'bumpScale', 0, 100)
}
function initGUI() {
    // gui  
    gui = new GUI()
    gui.domElement.id = "GUI"
    // common
    let h = gui.addFolder('common')

    h.addColor(settings.common, 'background').onChange(() => {
        scene.background = new THREE.Color(settings.common.background)
    })

    

    h.add(settings.common, 'showaxes').onChange(() => {
        if (settings.common.showaxes) {
            scene.add(axes)
        } else {
            scene.remove(axes)
        }
    })

    h.add(settings.common, 'showHelper').onChange(() => {
        if (settings.common.showHelper) {
            for(let i=0; i<lightHelper.length; i++)
            {
                if(lightList[i].type == 'Ambient Light')
                    lightList[i].light.add(lightHelper[i])
                else
                    scene.add(lightHelper[i])
            }    
            if(lightObj!=null)
                {
                    afControls.attach(lightObj.light)
                }
        } else {
            for(let i=0; i<lightHelper.length; i++)
                {
                 console.log(lightHelper[i].name)
                 if(lightList[i].type == 'Ambient Light')
                    lightList[i].light.remove(lightHelper[i])
                 else
                    scene.remove(lightHelper[i])
                }
            if(lightObj!=null)
            {
                afControls.detach()
            }

        }
    })

    h.add(settings.common, 'floorLock').onChange(() => {
        if (settings.common.floorLock) {
            if(mesh!=null)
                {
                    if (mesh.name==floor.name) {
                        if (g!=null)
                                gui.removeFolder(g)
                        g = null
                        mesh = null
                        afControls.detach()
                    } 
                }
            
            floor.name = 'inactive'
        } else {
            floor.name = '0'
        }
    })

    h.open()

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
    
    //LookAt folder
    const lookAtFolder = gui.addFolder("LookAt");
    lookAtFolder.add(settings.camera, 'lookAtObj').onChange(() => {
        if (settings.camera.lookAtObj) {
            if(mesh!=null)
                {
                    settings.camera.lookX = mesh.position.x
                    settings.camera.lookY = mesh.position.y
                    settings.camera.lookZ = mesh.position.z
                }
        }
    })
    lookAtFolder
    .add(settings.camera, "lookX", -10, 10)
    .name("LookAt X")
    .onChange(() => {
      updateLookAt();
      settings.camera.lookAtObj = false
    })
    .listen();
    lookAtFolder
    .add(settings.camera, "lookY", -10, 10)
    .name("LookAt Y")
    .onChange(() => {
      updateLookAt();
      settings.camera.lookAtObj = false
    })
    .listen();
    lookAtFolder
    .add(settings.camera, "lookZ", -10, 10)
    .name("LookAt Z")
    .onChange(() => {
      updateLookAt();
      settings.camera.lookAtObj = false
    })
    .listen();
}

function makeXYZGUI(gui, vector3, guiFolder, min, max, name, funct = "none") {
    if (funct == "none")
        {
        guiFolder.add(vector3, 'x', min, max).name(name + " X")
        guiFolder.add(vector3, 'y', min, max).name(name + " Y")
        guiFolder.add(vector3, 'z', min, max).name(name + " Z")
        }
    else
    {
        guiFolder.add(vector3, 'x', min, max).name(name + " X").onChange(funct)
        guiFolder.add(vector3, 'y', min, max).name(name + " Y").onChange(funct)
        guiFolder.add(vector3, 'z', min, max).name(name + " Z").onChange(funct)
    }
    
  }

function removeObject()
{
    var index = objList.indexOf(mesh)
    if (index == -1) return
    scene.remove(mesh)
    objList = removeFromArray(index, objList)
    mesh = null
    if (mesh == null && g!=null)
    { 
        gui.removeFolder(g)
        g = null
    }
    afControls.detach()
}
function removeLight()
{
    var index = lightList.indexOf(lightObj)
    if (index == -1) return
    scene.remove(lightObj.light)
    scene.remove(lightObj.helper)
    lightList = removeFromArray(index, lightList)
    lightHelper = removeFromArray(index, lightHelper)
    lightObj = null
    if (lightObj == null && l!=null)
    { 
        gui.removeFolder(l)
        l = null
    }
    afControls.detach()
}

function removeFromArray(index, oldArr)
{
    const newArr = oldArr.slice(0, index).concat(oldArr.slice(index+1))
    return newArr
}

//TEXTURE
$("#textureList").on("click",".textureThumb", function() {
    var src = this.getAttribute("src")
    console.log(src)
    loadTexture(src)
});
// $(".textureThumb").click(function () {

//     var src = this.getAttribute("src")
//     console.log(src)
//     loadTexture(src)
// })

$("#gridTexture").click(function () {

    if (mesh != null)
        mesh.material.wireframe = true
})
document.addEventListener('DOMContentLoaded', () => {
    const textureInput = document.getElementById('textureInput');
    textureInput.addEventListener('change', handleTextureUpload);
});
document.getElementById('textureBtn').addEventListener('click', function(){
    document.getElementById("textureInput").click();
});

var fileSrc = []
function handleTextureUpload(event) {
    if (event.target.files.length <= 0) return;
    const file = event.target.files[0];
    const name = file.name
    //validate
    var idxDot = name.lastIndexOf(".") + 1;
    var extFile = name.substr(idxDot, name.length).toLowerCase();
    if (extFile=="jpg" || extFile=="jpeg" || extFile=="png"){
        var url = URL.createObjectURL(file)
        fileSrc[fileSrc.length] = url
        loadTextureToList(url)
        loadTexture(url)
    }
}

function loadTextureToList(url)
{
    var iDiv = document.createElement('div');
    iDiv.className = 'thumbnail';
    document.getElementById('textureList').appendChild(iDiv);

    var iImage = document.createElement('img');
    iImage.className = "textureThumb"
    iImage.src = url
    iDiv.appendChild(iImage);
    
}

function loadTexture(url, wrapS = THREE. RepeatWrapping, wrapT = THREE.RepeatWrapping, minFilter = THREE.NearestFilter, magFilter = THREE.LinearFilter)
{
        textureLoader.load(url, (texture) => {
        if (mesh != null)
        {
            mesh.material.wireframe = false
            mesh.material.map = texture; 
            var maps = ['map']; 
            if (mesh.material.name != 'basic')
                {
                    mesh.material.bumpMap = texture;
                    maps = ['map', 'bumpMap']; 
                }
                
            maps.forEach(function (mapName) {
                var _texture = mesh.material[mapName]; 
                _texture.wrapS = wrapS; 
                _texture.wrapT = wrapT; 
                _texture.minFilter = minFilter;
                _texture.magFilter = magFilter;
            });

            
        }
    });
}


//ANIMATION


function ani1(obj) {
    const duration = 2000;
    const targetY = obj.position.y + 2;
    console.log(tweenList[obj.name])
    if (tweenList[obj.name] == null) 
        tweenList[obj.name] = new TWEEN.Group()
    var tweenIds = Object.keys(tweenList[obj.name]._tweens);
    if (tweenIds.length === 0) {
        var newObj = obj.clone()
        if (tweenIds.length === 0) {
            var newObj = obj.clone()
            newObj.geometry = obj.geometry.clone();
            newObj.material = obj.material.clone();
            initialState[obj.name] = newObj
        }
        initialState[obj.name] = newObj
        
        console.log("ameo")
    }

    let tween = new TWEEN.Tween(obj.position, tweenList[obj.name])
        .to({ y: targetY }, duration)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .yoyo(true)
        .repeat(Infinity)
        .start();

}

function ani2(obj) {
    const duration = 1000;
    console.log(tweenList[obj.name])
    if (tweenList[obj.name] == null) tweenList[obj.name] = new TWEEN.Group()
        
        var tweenIds = Object.keys(tweenList[obj.name]._tweens);
        if (tweenIds.length === 0) {
            var newObj = obj.clone()
            if (tweenIds.length === 0) {
                var newObj = obj.clone()
                newObj.geometry = obj.geometry.clone();
                newObj.material = obj.material.clone();
                initialState[obj.name] = newObj
            }
            initialState[obj.name] = newObj
            
            console.log("ameo")
        }

    let tween = new TWEEN.Tween(obj.rotation, tweenList[obj.name])
        .to({ y: obj.rotation.y + Math.PI * 2 }, duration)
        .easing(TWEEN.Easing.Linear.None)
        .repeat(Infinity)
        .start();

}

function ani3(obj) {
    const duration = 1500;
    const targetScale = obj.scale.clone().multiplyScalar(1.5);
    console.log(tweenList[obj.name])
    if (tweenList[obj.name] == null) tweenList[obj.name] = new TWEEN.Group()
        var tweenIds = Object.keys(tweenList[obj.name]._tweens);
    if (tweenIds.length === 0) {
        var newObj = obj.clone()
        if (tweenIds.length === 0) {
            var newObj = obj.clone()
            newObj.geometry = obj.geometry.clone();
            newObj.material = obj.material.clone();
            initialState[obj.name] = newObj
        }
        initialState[obj.name] = newObj
        
        console.log("ameo")
    }

    let tween = new TWEEN.Tween(obj.scale, tweenList[obj.name])
        .to(targetScale, duration)
        .easing(TWEEN.Easing.Elastic.InOut)
        .yoyo(true)
        .repeat(Infinity)
        .start();
 
}

function ani4(obj) {
    const duration = 5000;
    const radius = 2;
    const height = 4;
    console.log(tweenList[obj.name])
    if (tweenList[obj.name] == null) tweenList[obj.name] = new TWEEN.Group()
        var tweenIds = Object.keys(tweenList[obj.name]._tweens);
    if (tweenIds.length === 0) {
        var newObj = obj.clone()
        if (tweenIds.length === 0) {
            var newObj = obj.clone()
            newObj.geometry = obj.geometry.clone();
            newObj.material = obj.material.clone();
            initialState[obj.name] = newObj
        }
        initialState[obj.name] = newObj
        
        console.log("ameo")
    }


    let tween = new TWEEN.Tween({ t: 0 }, tweenList[obj.name])
        .to({ t: 1 }, duration / 2)
        .onUpdate(params => {
            const t = params.t;
            const angle = t * Math.PI * 4;
            obj.position.x = radius * Math.cos(angle);
            obj.position.y = t * height;
            obj.position.z = radius * Math.sin(angle);
        })
        .easing(TWEEN.Easing.Quadratic.InOut)
        .chain(
            new TWEEN.Tween({ t: 1 })
                .to({ t: 0 }, duration / 2)
                .onUpdate(params => {
                    const t = params.t;
                    const angle = t * Math.PI * 4;
                    obj.position.x = radius * Math.cos(angle);
                    obj.position.y = t * height;
                    obj.position.z = radius * Math.sin(angle);
                })
                .easing(TWEEN.Easing.Quadratic.InOut)
        )
        .repeat(Infinity)
        .start();
    
}

function ani5(obj) {
    const duration = 2000;
    const initialScale = obj.scale.clone();
    const initialRotationY = obj.rotation.y;

    console.log(tweenList[obj.name])
    if (tweenList[obj.name] == null) tweenList[obj.name] = new TWEEN.Group()
        var tweenIds = Object.keys(tweenList[obj.name]._tweens);
    if (tweenIds.length === 0) {
        var newObj = obj.clone()
        if (tweenIds.length === 0) {
            var newObj = obj.clone()
            newObj.geometry = obj.geometry.clone();
            newObj.material = obj.material.clone();
            initialState[obj.name] = newObj
        }
        initialState[obj.name] = newObj
        
        console.log("ameo")
    }


    const spinAndShrinkTween = new TWEEN.Tween(obj, tweenList[obj.name])
        .to({
            rotation: { y: obj.rotation.y + Math.PI * 2 },
            scale: { x: 0.1, y: 0.1, z: 0.1 },
        }, duration / 2)
        .easing(TWEEN.Easing.Cubic.InOut)
        .chain(
            new TWEEN.Tween(obj)
                .to({
                    rotation: { y: initialRotationY },
                    scale: initialScale,
                }, duration / 2)
                .easing(TWEEN.Easing.Cubic.InOut)
        )
        .repeat(Infinity)
        .start();
    
}


function ani6(obj) {
    const duration = 2000;
    const initialColor = obj.material.color.clone();
    const targetColor = new THREE.Color(0xff0000);

    console.log(tweenList[obj.name])
    if (tweenList[obj.name] == null) tweenList[obj.name] = new TWEEN.Group()
        var tweenIds = Object.keys(tweenList[obj.name]._tweens);
    if (tweenIds.length === 0) {
        var newObj = obj.clone()
        if (tweenIds.length === 0) {
            var newObj = obj.clone()
            newObj.geometry = obj.geometry.clone();
            newObj.material = obj.material.clone();
            initialState[obj.name] = newObj
        }
        initialState[obj.name] = newObj
        
        console.log("ameo")
    }


    const tween = new TWEEN.Tween(obj.material.color, tweenList[obj.name])
        .to(targetColor, duration)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .yoyo(true)
        .repeat(Infinity)
        .start();

    tween.onComplete(() => {
        obj.material.color.copy(initialColor);
    });
}

function ani7(obj) {
    const duration = 2000;
    const angle = Math.PI / 6;

    const initialRotation = obj.rotation.clone();

    console.log(tweenList[obj.name])
    if (tweenList[obj.name] == null) tweenList[obj.name] = new TWEEN.Group()
        var tweenIds = Object.keys(tweenList[obj.name]._tweens);
    if (tweenIds.length === 0) {
        var newObj = obj.clone()
        if (tweenIds.length === 0) {
            var newObj = obj.clone()
            newObj.geometry = obj.geometry.clone();
            newObj.material = obj.material.clone();
            initialState[obj.name] = newObj
        }
        initialState[obj.name] = newObj
        
        console.log("ameo")
    }

    let tween = new TWEEN.Tween(obj.rotation, tweenList[obj.name])
        .to({ z: angle }, duration / 2)
        .easing(TWEEN.Easing.Cubic.InOut)
        .yoyo(true)
        .repeat(Infinity)
        .onComplete(() => {
            obj.rotation.copy(initialRotation);
        })
        .start();
    
}

function ani8(obj) {
    const duration = 3000;
    const amplitude = 0.5;
    const frequency = 2;

    const initialVertices = obj.geometry.attributes.position.array.slice();

    console.log(tweenList[obj.name])
    if (tweenList[obj.name] == null) tweenList[obj.name] = new TWEEN.Group()
        var tweenIds = Object.keys(tweenList[obj.name]._tweens);
        if (tweenIds.length === 0) {
            var newObj = obj.clone()
            if (tweenIds.length === 0) {
                var newObj = obj.clone()
                newObj.geometry = obj.geometry.clone();
                newObj.material = obj.material.clone();
                initialState[obj.name] = newObj
            }
            initialState[obj.name] = newObj
            
            console.log("ameo")
        }

    let tween = new TWEEN.Tween({ t: 0 }, tweenList[obj.name])
        .to({ t: 1 }, duration)
        .onUpdate(params => {
            const t = params.t;
            for (let i = 0; i < obj.geometry.attributes.position.count; i++) {
                const x = initialVertices[i * 3];
                const y = initialVertices[i * 3 + 1];
                const z = initialVertices[i * 3 + 2];

                const newY = y + amplitude * Math.sin(frequency * (x + t * 2 * Math.PI));
                obj.geometry.attributes.position.array[i * 3 + 1] = newY;
            }
            obj.geometry.attributes.position.needsUpdate = true;
        })
        .easing(TWEEN.Easing.Sinusoidal.InOut)
        .repeat(Infinity)
        .start();
}

function stopAnimation(obj) {
    
    tweenList[obj.name].removeAll()
    console.log(initialState[obj.name])
    
    objList[obj.name] = initialState[obj.name]
    scene.remove(mesh)

    mesh = objList[obj.name]
    scene.add(mesh)
    afControls.attach(mesh)
    initGeometryGUI(mesh)

    if (mesh.name == '0')
        floor = objList[obj.name]
    //TWEEN.removeAll();
}

$(".controls-object button.animation").click(function chooseAnimation() {
    const animationValue = $(this).val();

    if (mesh) {
        switch (animationValue) {
            case "ani1":
                ani1(mesh);
                break;
            case "ani2":
                ani2(mesh);
                break;
            case "ani3":
                ani3(mesh);
                break;
            case "ani4":
                ani4(mesh);
                break;
            case "ani5":
                ani5(mesh);
                break;
            case "ani6":
                ani6(mesh);
                break;
            case "ani7":
                ani7(mesh);
                break;
            case "ani8":
                ani8(mesh);
                break;
            case "noani": // No animation
                stopAnimation(mesh);
                break;
            default:
                console.warn("Unknown animation value:", animationValue);
                break;
        }
    }
});

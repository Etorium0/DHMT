import * as THREE from "three"
import { DegRadHelper } from "./Helper.js"
import { ColorGUIHelper } from "./Helper.js"
import { GUI } from "dat.gui"
import { OrbitControls } from "three/examples/jsm/Addons.js"
import { TransformControls } from "three/examples/jsm/Addons.js"
import Stats from "three/examples/jsm/libs/stats.module.js"
import { TeapotGeometry } from "three/examples/jsm/geometries/TeapotGeometry.js"
import { mod } from "three/examples/jsm/nodes/Nodes.js"
import { update } from "three/examples/jsm/libs/tween.module.js"

var objList = []
var lightList = []
var lightHelper = []
// globale variables
let camera, scene, renderer
let floor, geometry, material, mesh, floorMesh, lightObj, axes
let gui
let stats
let textureLoader = new THREE.TextureLoader()

// controls 
let obControls, afControls
let settings = {
    common: {
        showaxes: true,
        background: 'rgb(80,80,80)',
        floorLock: true
    },
    geometry: {
        scale: 1,
        shape: 'cube',
        material: 'basic',
        wireframe: false,
        color: 0x999999,
    },
    light: {
        type: 'point',
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
    },
    animation: {
        play: false,
        type: 'go up and down',
    }
}

$(".mode").click(function () {
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
$(".geometry").click(function () {
    var geometryName = $(this).text()
    var geometry
    var material = new THREE.MeshBasicMaterial({ color: 'white', side: THREE.DoubleSide, name: 'basic' })
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
        }
        var mesh = new THREE.Mesh(geometry, material)
        mesh.name = id++
        mesh.castShadow = true // Shadow (đổ bóng).
        objList[objList.length] = mesh
        scene.add(mesh)

        console.log(objList[objList.length-1].name)
}
)
$(".light").click(function () {
    var lightName = $(this).text()
    var val;
    console.log(lightName)
        switch (lightName) {
            case "Point Light":
                val = getPointLight(100);   
                break;
            case "Spot Light":
                val = getSpotLight(100);
                break;
            case "Directional Light":
                val = getDirectionalLight(100);
                break;
            case "Ambient Light":
                val = getAmbientLight(100);
                val.helper.name = 'ambient'
                break;
        }
        val.name = id++ 
        lightList[lightList.length] = val
        lightHelper[lightHelper.length] = val.helper

        scene.add(val.light)
        if (val.helper.name == 'ambient')
        {
            val.light.add(val.helper)
        }
        else
            scene.add(val.helper)

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
        var temp = objList.concat(lightHelper)
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
        var temp = objList.concat(lightHelper)
        var intersects = raycaster.intersectObjects(temp)
        if (intersects.length > 0 && intersects[0].object.name != 'inactive') {
            if (objList.includes(intersects[0].object))
            {
                mesh = intersects[0].object
                lightObj = null
            }
            else
            {
                console.log(lightHelper.length)
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
    
    
})

document.getElementById("canvas").addEventListener("mouseup", function(event)
{
    isMouseDown = false
    if (crnbox != null)
        scene.remove(crnbox)
    crnbox = null

    if (mesh != null)
        {
            crnbox = new THREE.BoxHelper( mesh, 0xffff00 )
            scene.add( crnbox )
            if (befMesh != mesh)
                {
                    initGeometryGUI()
                    afControls.attach(mesh)
                }
            
        }
    if (lightObj != null)
        {
            console.log("LA2")
            crnbox = new THREE.BoxHelper( lightObj.helper, 0xffff00 )
            scene.add( crnbox )
            if (befLight != lightObj)
                {
                    initLightGUI()
                    afControls.attach(lightObj.light)
                }
            
        }
})

document.getElementById("canvas").addEventListener("dblclick", function(event)
{
    
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
    raycaster.setFromCamera(mouse, camera)
    var intersects = raycaster.intersectObjects(objList)
    if (intersects.length <= 0) {
            
        if (g!=null)
                gui.removeFolder(g)
        g = null
         mesh = null
        if (crnbox != null)
            scene.remove(crnbox)
        crnbox = null
        afControls.detach()
    } 
})

//LIGHT
function getPointLight(intensity) {
    const light = new THREE.PointLight(0xffffff, intensity);
    light.castShadow = true;
    const helper = new THREE.PointLightHelper(light);
    return {light: light, helper: helper, name: ''};
  }
  
  function getSpotLight(intensity) {
    const light = new THREE.SpotLight(0xffffff, intensity);
    light.castShadow = true;
    light.shadow.bias = 0.001;
    light.shadow.mapSize.width = 2048;
    light.shadow.mapSize.height = 2048;
    light.penumbra = 0.1;
    
    const helper = new THREE.SpotLightHelper(light);
    return {light: light, helper: helper, name: ''};
  }
  
  function getDirectionalLight(intensity) {
    const light = new THREE.DirectionalLight(0xffffff, intensity);
    light.castShadow = true;
    light.shadow.camera.left = -5;
    light.shadow.camera.bottom = -5;
    light.shadow.camera.right = 5;
    light.shadow.camera.top = 5;
    
    const helper = new THREE.DirectionalLightHelper(light);
    return {light: light, helper: helper, name: ''};
  }
  
  function getAmbientLight(intensity) {
    const light = new THREE.AmbientLight(0x404040 , intensity)
    var geometry = new THREE.SphereGeometry(0.2, 10, 10)
    var material = new THREE.MeshBasicMaterial({ color: light.color, side: THREE.DoubleSide, name: 'basic' })
    const helper = new THREE.Mesh(geometry, material)
    return {light: light, helper: helper, name: ''};
  }
  function updateLight(lightObj)
  {
    if (lightObj == null) return
    try{lightObj.helper.update();}
    catch(exeption)
    {
        lightObj.helper.material.color.set(lightObj.light.color.getHex())
    } 
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
    axes = new THREE.AxesHelper(5)
    scene.add(axes)

    // floor
    geometry = new THREE.PlaneGeometry (10, 10, 10, 10)
    let floorMat = new THREE.MeshPhongMaterial({ color: 0x222222, side: THREE.DoubleSide, name: 'phong' })

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
    obControls.maxPolarAngle = Math.PI / 2

    // affine controls
    afControls = new TransformControls(camera, renderer.domElement)
    afControls.addEventListener('change', () => {
        // console.log(afControls.object.position)
        renderer.render(scene, camera)
        updateLight(lightObj)
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
    gui.updateDisplay();
    if (settings.animation.play) {
        switch (settings.animation.type) {
            case 'go up and down':
                mesh.position.y = Math.sin(performance.now() * 0.001) * 0.5
                break
            case 'go left and right':
                mesh.position.x = Math.sin(performance.now() * 0.001) * 0.5
                break
            case 'go forward and backward':
                mesh.position.z = Math.sin(performance.now() * 0.001) * 0.5
                break
            case 'rotate':
                mesh.rotation.y = performance.now() * 0.001
                break
            case 'go around':
                mesh.position.x = Math.sin(performance.now() * 0.001) * 0.5
                mesh.position.z = Math.cos(performance.now() * 0.001) * 0.5
                break
            default:
                break
        }
    }

    stats.update()
    renderer.render(scene, camera)
}

var l = null
function initLightGUI() 
{
    if (l!=null)
        gui.removeFolder(l)

    // geometry
    l = gui.addFolder('light')

    l.addColor(new ColorGUIHelper(lightObj.light, 'color'), 'value').name('Light color').onChange(() => {
        updateLight(lightObj)
    })

    l.open()
}

var g = null
function initGeometryGUI() 
{
    if (g!=null)
        gui.removeFolder(g)

    // geometry
    g = gui.addFolder('geometry')
    g.add(mesh.scale, "x", 0.1, 10).name('Scale X')
    g.add(mesh.scale, "y", 0.1, 10).name('Scale Y')
    g.add(mesh.scale, "z", 0.1, 10).name('Scale Z')

    g.add(new DegRadHelper(mesh.rotation, 'x'), 'value', -180, 180).name('Rotate X')
    g.add(new DegRadHelper(mesh.rotation, 'y'), 'value', -180, 180).name('Rotate Y')
    g.add(new DegRadHelper(mesh.rotation, 'z'), 'value', -180, 180).name('Rotate Z')

    
    settings.geometry.color = mesh.material.color.getHex()
    settings.geometry.material = mesh.material.name
    var matCon = g.add(settings.geometry, 'material', ['basic', 'lambert', 'phong', 'toon']).onChange(() => {
        if (settings.geometry.material == 'basic') {
            material = new THREE.MeshBasicMaterial({ color: settings.geometry.color, side: THREE.DoubleSide, name: settings.geometry.material })
            
        } else if (settings.geometry.material == 'lambert') {
            material = new THREE.MeshLambertMaterial({ color: settings.geometry.color, side: THREE.DoubleSide, name: settings.geometry.material })
        } else if (settings.geometry.material == 'phong') {
            material = new THREE.MeshPhongMaterial({ color: settings.geometry.color, side: THREE.DoubleSide, name: settings.geometry.material })
        } else if (settings.geometry.material == 'toon') {
            material = new THREE.MeshToonMaterial({ color: settings.geometry.color, side: THREE.DoubleSide, name: settings.geometry.material })
        } 
        mesh.material = material
    })

    matCon.setValue(settings.geometry.material)    
    g.addColor(settings.geometry, 'color').onChange(() => {
        mesh.material.color.set(settings.geometry.color)
  
    })

    g.open()
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

    h.add(settings.common, 'floorLock').onChange(() => {
        if (settings.common.floorLock) {
           
            if (mesh.name==floor.name) {
                if (g!=null)
                        gui.removeFolder(g)
                g = null
                mesh = null
                if (crnbox != null)
                    scene.remove(crnbox)
                crnbox = null
                afControls.detach()
            } 
            floor.name = 'inactive'
        } else {
            floor.name = '0'
        }
    })

    h.open()
}
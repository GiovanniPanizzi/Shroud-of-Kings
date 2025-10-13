import * as THREE from './libs/three.js/build/three.module.js';
import { GLTFLoader } from './libs/three.js/examples/jsm/loaders/GLTFLoader.js';

/* CREATE CANVAS USING THREE */
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const axesHelper = new THREE.AxesHelper(5);
//scene.add(axesHelper);

camera.position.set(2, 2, 5);

/* SHADOWS */
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

/* CREATE MEDIEVAL GUY 3D */
const loader = new GLTFLoader();
let skeleton;
let mixer;
let model;

// Caricamento modello
loader.load('./models/medieval_guy.glb', function(gltf) {
    model = gltf.scene;
    model.scale.set(0.01, 0.01, 0.01);
    scene.add(model);

    let skinnedMesh;
    model.traverse((child) => {
        if (child.isSkinnedMesh) skinnedMesh = child;
    });

    if (skinnedMesh) {
        skeleton = skinnedMesh.skeleton;
    }

    if(skeleton) {
        console.log(skeleton.bones);
    }   

    if (gltf.animations && gltf.animations.length > 0) {
        mixer = new THREE.AnimationMixer(model);
        gltf.animations.forEach(clip => mixer.clipAction(clip).play());
    }
});

/* FLOOR */
const planeGeometry = new THREE.PlaneGeometry(20, 20);
const planeMaterial = new THREE.MeshPhongMaterial({ color: 0xFFFFFF, side: THREE.DoubleSide });
const floor = new THREE.Mesh(planeGeometry, planeMaterial);
floor.rotation.x = Math.PI / 2;
floor.position.y = 0;
floor.receiveShadow = true;
scene.add(floor);

/* WALL 1 */
const wallGeometry = new THREE.PlaneGeometry(20, 10);
const wallMaterial = new THREE.MeshPhongMaterial({ color: 0x0000ff, side: THREE.DoubleSide });
const wall = new THREE.Mesh(wallGeometry, wallMaterial);
wall.position.z = -10;
wall.position.y = 5;
wall.receiveShadow = true;
scene.add(wall);

/* WALL 2 */

const wall2Geometry = new THREE.PlaneGeometry(20, 10);
const wall2Material = new THREE.MeshPhongMaterial({ color: 0xff00000, side: THREE.DoubleSide });
const wall2 = new THREE.Mesh(wall2Geometry, wall2Material);
wall2.position.x = -10;
wall2.position.y = 5;
wall2.rotation.y = Math.PI / 2;
wall2.receiveShadow = true;
scene.add(wall2);

/* LIGHT */
const light = new THREE.DirectionalLight(0xffffff, 1);
light.castShadow = true;
light.position.set(1, 2, 1);

light.shadow.mapSize.width = 1024;
light.shadow.mapSize.height = 1024;
light.shadow.camera.near = 0.5;
light.shadow.camera.far = 50;
light.shadow.camera.left = -10;
light.shadow.camera.right = 10;
light.shadow.camera.top = 10;
light.shadow.camera.bottom = -10;

scene.add(light);

/* RAY CASTING */
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

/* MOUSE MOVE */
window.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
});

function animate() {
    requestAnimationFrame(animate);
    if(model){
        camera.position.x = model.position.x - 2;
        camera.position.z = model.position.z + 5;
        camera.lookAt(model.position);
    }
    renderer.render(scene, camera);
}

animate();

/* FULLSCREEN FUNCTION */
const fullScreenButton = document.querySelector('.full-screen');

function goFullScreen() {
    if (renderer.domElement.requestFullscreen) {
        renderer.domElement.requestFullscreen();
    } else if (renderer.domElement.webkitRequestFullscreen) { /* Safari */
        renderer.domElement.webkitRequestFullscreen();
    } else if (renderer.domElement.msRequestFullscreen) { /* IE11 */
        renderer.domElement.msRequestFullscreen();
    }
    resizeCanvas();
}

fullScreenButton.addEventListener('click', goFullScreen);

/* RESIZE HANDLER */
function resizeCanvas() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
}

const ws = new WebSocket("ws://localhost:9002");

let msg = "";

let wPressed = false;
let aPressed = false;
let sPressed = false;
let dPressed = false;
let spacePressed = false;

document.addEventListener("keydown", (event) => {
    if (event.key === "w" || event.key === "W") {
        wPressed = true;
    }

    if (event.key === "s" || event.key === "S") {
        sPressed = true;
    }

    if (event.key === "a" || event.key === "A") {
        aPressed = true;
    }

    if (event.key === "d" || event.key === "D") {
        dPressed = true;
    }

    if (event.key === " ") {
        if (!spacePressed) {
            spacePressed = true;
        }
    }
});

document.addEventListener("keyup", (event) => {
    if (event.key === "w" || event.key === "W") {
        wPressed = false;
    }

    if (event.key === "s" || event.key === "S") {
        sPressed = false;
    }

    if (event.key === "a" || event.key === "A") {
        aPressed = false;
    }

    if (event.key === "d" || event.key === "D") {
        dPressed = false;
    }

    if (event.key === " ") {
        spacePressed = false;
    }
});

ws.onopen = () => {
    console.log("Connesso al server");
    setInterval(() => {
        if(wPressed) msg += "move_forward;";
        if(sPressed) msg += "move_backward;";
        if(aPressed) msg += "move_left;";
        if(dPressed) msg += "move_right;";
        if(spacePressed) msg += "jump;";
        ws.send(msg);
        console.log(msg);
        msg = "";
    }, 1000 / 12);
};

ws.onmessage = (event) => {
    if (!model) return; 

    const parts = event.data.split(",");
    if (parts.length >= 3) {
        model.position.x = parseFloat(parts[0]);
        model.position.y = parseFloat(parts[1]);
        model.position.z = parseFloat(parts[2]);

        console.log(`Posizione aggiornata: x=${model.position.x}, z=${model.position.z}, ${model.position.y}`);
    } else {
        console.warn("Messaggio malformato dal server:", event.data);
    }
};

window.addEventListener('resize', resizeCanvas);
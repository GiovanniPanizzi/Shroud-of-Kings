import * as THREE from './libs/three.js/build/three.module.js';
import { GLTFLoader } from './libs/three.js/examples/jsm/loaders/GLTFLoader.js';
import { PointerLockControls } from './libs/three.js/examples/jsm/controls/PointerLockControls.js';

/* CREATE CANVAS USING THREE */
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000);


const axesHelper = new THREE.AxesHelper(5);

camera.position.set(2, 2, 5);

const controls = new PointerLockControls(camera, renderer.domElement);

document.addEventListener('click', () => {
    controls.lock();
});

/* SHADOWS */
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

//FLOOR

const floorGeometry = new THREE.PlaneGeometry(50000, 50000, 100, 100);
const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x808080, side: THREE.DoubleSide });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.position.y = -3000;
floor.rotation.x = - Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

//labirint
let loader = new GLTFLoader();

loader.load('./models/labirint.glb', function(gltf) {
    const maze = gltf.scene;
    maze.scale.set(100, 100, 100);
    maze.position.set(0, 3, 0);

    maze.traverse((child) => {
        if (child.isMesh) {
            if (Array.isArray(child.material)) {
                child.material.forEach(mat => {
                    if (mat.isMeshStandardMaterial) {
                        mat.side = THREE.DoubleSide;
                        mat.needsUpdate = true;
                    }
                });
            } else {
                if (child.isMesh) {
                    child.material = new THREE.MeshBasicMaterial({
                        color: 0x280282,
                        side: THREE.DoubleSide
                    });
                }
            }
        }
    });

    scene.add(maze);
});

/* LIGHT */
const ambient = new THREE.AmbientLight(0xffffff, 5.0);
scene.add(ambient);

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
    controls.update(0.1);
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
let shiftPressed = false;

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

    if (event.key === "Shift") {
        shiftPressed = true;
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

    if (event.key === "Shift") {
        shiftPressed = false;
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
        if(shiftPressed) msg += "shift;";
        ws.send(msg);
        msg = "";
    }, 1000 / 60);
};

ws.onmessage = (event) => {

    const parts = event.data.split(",");
    if (parts.length >= 3) {
        camera.position.x = parseFloat(parts[0]);
        camera.position.y = parseFloat(parts[1]);
        camera.position.z = parseFloat(parts[2]);
    } else {
        console.warn("Messaggio malformato dal server:", event.data);
    }
};

window.addEventListener('resize', resizeCanvas);
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.157.0/build/three.module.js';

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

/* CREATE TEXTURE WITH CANVAS */
const canvas = document.createElement('canvas');
canvas.width = 200;
canvas.height = 100;
const ctx = canvas.getContext('2d');

ctx.font = 'bold 10px Arial';
ctx.fillStyle = 'white';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.fillText('Find Lobby', canvas.width, canvas.height);

// Texture
const texture = new THREE.CanvasTexture(canvas);
const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
const plane = new THREE.Mesh(new THREE.PlaneGeometry(5, 2), material);
plane.position.set(0, 2, 0);
scene.add(plane);

//add border
const borderGeometry = new THREE.EdgesGeometry(new THREE.PlaneGeometry(5, 2));
const borderMaterial = new THREE.LineBasicMaterial({ color: 0x0000ff, linewidth: 5 });
const border = new THREE.LineSegments(borderGeometry, borderMaterial);
border.position.copy(plane.position);
scene.add(border);

/* CREATE BOX */
const geometry = new THREE.BoxGeometry();
const boxMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000, shininess: 100 });
const box = new THREE.Mesh(geometry, boxMaterial);

scene.add(box);

renderer.render(scene, camera);
box.castShadow = true;

/* CREATE SPHERE */
const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);
const sphereMaterial = new THREE.MeshPhongMaterial({ color: 0x0000ff, shininess: 100 });
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
sphere.position.set(2, 4, 3);
scene.add(sphere);
sphere.castShadow = true;

/* FLOOR */
const planeGeometry = new THREE.PlaneGeometry(20, 20);
const planeMaterial = new THREE.MeshPhongMaterial({ color: 0xFFFFFF, side: THREE.DoubleSide });
const floor = new THREE.Mesh(planeGeometry, planeMaterial);
floor.rotation.x = Math.PI / 2;
floor.position.y = -1;
floor.receiveShadow = true;
scene.add(floor);

/* LIGHT */
const light = new THREE.DirectionalLight(0xffffff, 1);
light.castShadow = true;
light.position.set(5, 10, 5);

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

/* MOUSE CLICK */
window.addEventListener('click', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(plane);

    if(intersects.length > 0){
        lobbyRequest();
    }
});

sphere.userData.velocity = 0;

function updateLightFromMouse() {
    // mouse.x e mouse.y in NDC (-1..1)
    const vector = new THREE.Vector3(mouse.x, 1 , mouse.y); // z = 0.5 -> mezzo del frustum
    vector.unproject(camera); // trasforma in coordinate mondo

    // distanza dalla camera (puoi regolarla)
    const dir = vector.sub(camera.position).normalize();
    const distance = 10;

    // posiziona la luce
    light.position.copy(camera.position).add(dir.multiplyScalar(distance));
}

/* LOBBY REQUEST */

function lobbyRequest() {
    console.log("Lobby requested");

    // crea una connessione WebSocket al server
    const ws = new WebSocket("ws://localhost:9002/");

    // evento quando la connessione viene aperta
    ws.onopen = () => {
        console.log("Connesso al server WebSocket");
        // eventualmente inviare un messaggio al server
        ws.send(JSON.stringify({ action: "joinLobby" }));
    };

    // evento quando arriva un messaggio dal server
    ws.onmessage = (event) => {
        console.log("Messaggio dal server:", event.data);
    };

    // evento quando la connessione viene chiusa
    ws.onclose = () => {
        console.log("Connessione chiusa");
    };

    // evento per errori
    ws.onerror = (err) => {
        console.error("Errore WebSocket:", err);
    };
}

function animate() {
    camera.position.x = Math.sin(Date.now() * 0.001) * 5;
    camera.lookAt(0, 0, box.position.z);
    border.lookAt(camera.position);
    renderer.render(scene, camera);
    camera.position.z = Math.cos(Date.now() * 0.001) * 5;
    box.position.x = Math.sin(Date.now() * 0.001) * 2;

    box.rotation.x += 0.01;
    box.rotation.z += 0.01;

    /* SPHERE BOUNCING */

    if(sphere.position.y <= -0.5){
        sphere.userData.velocity = -sphere.userData.velocity;
    }
    else{
        sphere.userData.velocity -= 0.01;
    }

    sphere.position.y += sphere.userData.velocity;

    /* LIGHT FOLLOWS MOUSE */
    updateLightFromMouse();

    // Raycasting
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(plane);

    texture.needsUpdate = true;

    boxMaterial.color.setHSL((Date.now() * 0.0001) % 1, 1, 0.5);
    requestAnimationFrame(animate);

    plane.lookAt(camera.position);
    if (intersects.length > 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // cancella il vecchio testo
        ctx.fillStyle = 'blue';
        ctx.font = 'bold 30px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Find Lobby', canvas.width / 2, canvas.height / 2);
    
        // Aggiorna la texture
        texture.needsUpdate = true;
    } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = 'bold 30px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Find Lobby', canvas.width / 2, canvas.height / 2);
        texture.needsUpdate = true;
    }
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

window.addEventListener('resize', resizeCanvas);
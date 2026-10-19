

import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const popup = document.getElementById("popup");
const viewer = document.getElementById("viewer");
const closeButton = document.getElementById("close");

let scene, camera, renderer, controls;
let currentModel = null;
let animationId = null;
let initialized = false;

const loader = new GLTFLoader();

function setupViewer() {
    if (initialized) return;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x282930);

    camera = new THREE.PerspectiveCamera(
        50,
        viewer.clientWidth / viewer.clientHeight,
        0.1,
        1000
    );

    camera.position.set(5, 4, 7);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(viewer.clientWidth, viewer.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    viewer.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enableRotate = true;
    controls.enableZoom = true;
    controls.enablePan = true;
    controls.zoomToCursor = true;
    controls.target.set(0, 0.8, 0);
    controls.update();

    scene.add(new THREE.GridHelper(
        200, 200, 0x565968, 0x3c3e48
    ));

    scene.add(new THREE.HemisphereLight(
        0xffffff, 0x505060, 2.0
    ));

    const keyLight = new THREE.DirectionalLight(0xffffff, 3.0);
    keyLight.position.set(5, 10, 7);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xc4d8ff, 1.2);
    fillLight.position.set(-6, 4, -5);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 1.5);
    rimLight.position.set(0, 6, -8);
    scene.add(rimLight);

    initialized = true;
}

function loadModel(modelPath) {
    setupViewer();

    if (currentModel) {
        scene.remove(currentModel);

        currentModel.traverse((object) => {
            if (object.isMesh) {
                object.geometry.dispose();

                if (Array.isArray(object.material)) {
                    object.material.forEach(material => material.dispose());
                } else {
                    object.material.dispose();
                }
            }
        });

        currentModel = null;
    }

    loader.load(
        modelPath,
        (gltf) => {
            const model = gltf.scene;

            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());

            model.position.x -= center.x;
            model.position.z -= center.z;
            model.position.y -= box.min.y;

            const maxDimension = Math.max(size.x, size.y, size.z);

            if (maxDimension > 0) {
                model.scale.setScalar(2.5 / maxDimension);
            }

            const scaledBox = new THREE.Box3().setFromObject(model);
            model.position.y -= scaledBox.min.y;

            scene.add(model);
            currentModel = model;

            const finalBox = new THREE.Box3().setFromObject(model);
            const finalCenter = finalBox.getCenter(new THREE.Vector3());

            controls.target.copy(finalCenter);
            controls.update();

            camera.position.set(
                finalCenter.x + 5,
                finalCenter.y + 3,
                finalCenter.z + 7
            );

            camera.lookAt(finalCenter);
            controls.update();
        },
        undefined,
        (error) => {
            console.error("A modell betöltése sikertelen:", error);
        }
    );
}

function animate() {
    if (!initialized || popup.style.display !== "flex") {
        animationId = null;
        return;
    }

    animationId = requestAnimationFrame(animate);

    controls.update();
    renderer.render(scene, camera);
}

function openModel(modelPath) {
    popup.style.display = "flex";

    loadModel(modelPath);
    resizeViewer();

    if (animationId === null) {
        animate();
    }
}

document.querySelectorAll(".model-link").forEach((element) => {
    element.addEventListener("click", () => {
        openModel(element.dataset.model);
    });
});

function resizeViewer() {
    if (!renderer || !camera) return;

    const width = viewer.clientWidth;
    const height = viewer.clientHeight;

    if (!width || !height) return;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
}

function closePopup() {
    popup.style.display = "none";

    if (animationId !== null) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
}

closeButton.addEventListener("click", closePopup);

popup.addEventListener("click", (event) => {
    if (event.target === popup) closePopup();
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closePopup();
});

window.addEventListener("resize", resizeViewer);


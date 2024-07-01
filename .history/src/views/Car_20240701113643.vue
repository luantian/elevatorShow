<template>
  <div class="car" ref="ContainerRef"></div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { GLTFLoader, RGBELoader } from "three/examples/jsm/Addons";
import gsap from "gsap";

const ContainerRef = ref(null);

let ground = null;

const scene = new THREE.Scene();
// 创建相机
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  600
);
camera.position.z = 5;

// 创建渲染器
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setAnimationLoop(animationLoop);

const controls = new OrbitControls(camera, renderer.domElement);

const axesHelper = new THREE.AxesHelper(100, 100, 100);
scene.add(axesHelper);

/**
 * 创建反射的方案
 * 1. 创建 WebGLCubeRendererTarget
 * 2. 将 WebGLCubeRendererTarget 实例对象作为参数传给 CubeCamera
 * 3. 在帧循环函中调用第 2 步中创建的 CubeCamera 对象的 update 方法，每帧更新渲染结果
 * 4. 将 WebGLCubeRendererTarget 对象的 texture 赋值给环境材质的环境贴图通道: envMap
 */
const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(1024);
const cubeCamera = new THREE.CubeCamera(0.1, 500, cubeRenderTarget);

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("/libs/draco/");

const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

gltfLoader.load("car.glb", (gltf) => {
  const model = gltf.scene;
  scene.add(model);
  model.traverse((child) => {
    if (child.type === "Mesh") {
      child.material.envMap = cubeRenderTarget.texture;
      child.visible = true;
    }
    if (child.name === "ground") {
      child.material.side = THREE.DoubleSide;
      child.visible = true;

      ground = child;
    }
    if (child.name === "flyLight") {
      child.material.map.anisotropy = 8;
      gsap.to(child.material.map.offset, {
        x: 1,
        repeat: -1,
        ease: "none",
        duration: 0.5,
      });
    }
    if (child.name === "mainCar") {
      child.traverse((item) => {
        if (item.type === "Mesh") {
          item.material.envMapIntensity = 5; // 光源被盖住，可以调亮物体
        }
      });
    }
    if (["wheelFront", "wheelBack"].includes(child.name)) {
      gsap.to(child.rotation, {
        y: Math.PI * 2,
        repeat: -1,
        ease: "none",
        duration: 0.3,
      });
    }
    if (["groundDetail"].includes(child.name)) {
      gsap.to(child.material.map.offset, {
        x: -100,
        repeat: -1,
        ease: "none",
        duration: 10,
      });
    }
  });
});

const rgbeLoader = new RGBELoader();
rgbeLoader.load("sky.hdr", (skyTexture) => {
  scene.background = skyTexture;
  scene.environment = skyTexture;
  skyTexture.mapping = THREE.EquirectangularReflectionMapping;
});

// const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
// const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
// const cube = new THREE.Mesh(boxGeometry, material);
// cube.position.set(0, 1.2, 0);
// scene.add(cube);

function animationLoop() {
  controls.update();

  if (ground) {
    ground.visible = false;
    cubeCamera.position.copy(camera.position);
    cubeCamera.position.y = -cubeCamera.position.y;
    cubeCamera.update(renderer, scene);
    ground.visible = true;
  }

  renderer.render(scene, camera);
}

onMounted(() => {
  ContainerRef.value.appendChild(renderer.domElement);
});
</script>

<style scoped>
.car {
  width: 100vw;
  height: 100vh;
}
</style>

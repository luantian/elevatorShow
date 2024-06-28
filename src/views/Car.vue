<template>
  <div class="car" ref="ContainerRef"></div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const ContainerRef = ref(null);

const scene = new THREE.Scene();
// 创建相机
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 5;

// 创建渲染器
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

const controls = new OrbitControls(camera, renderer.domElement);

const axesHelper = new THREE.AxesHelper(100, 100, 100);
scene.add(axesHelper);

const ambientLight = new THREE.AmbientLight();
ambientLight.intensity = 1;
scene.add(ambientLight);

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

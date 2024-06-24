<template>
  <div class="test" ref="containerRef"></div>
  <div class="opera">
    <!-- <div class="state">当前状态: {{ snapshot.value }}</div> -->

    <div>
      <div class="state">电梯内按钮：</div>
      <t-space style="margin-bottom: 10px">
        <t-button theme="default" @click="openDoor">开门</t-button>
        <t-button theme="default" @click="closeDoor">关门</t-button>
      </t-space>
      <!-- :theme="snapshot.context.queue.includes(item) ? 'primary' : 'default'" -->
      <div style="padding: 10px 0">
        <t-space>
          <t-button
            v-for="(item, index) in floorYs"
            :key="index"
            @click="addFloor(index + 1)"
            >{{ index + 1 }}楼</t-button
          >
        </t-space>
      </div>
    </div>
    <div>
      <div class="state">电梯外按钮：</div>
      <div
        style="padding-bottom: 10px"
        v-for="(item, index) in floorYs"
        :key="index"
      >
        <span class="state">{{ index + 1 }}楼：</span>
        <t-space>
          <t-button theme="default" @click="addFloor(index + 1)">上</t-button>
          <t-button theme="default" @click="addFloor(index + 1)">下</t-button>
        </t-space>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useMachine } from "@xstate/vue";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import elevatorMachine from "@/machines/elevatorMachine";
import _ from "lodash";
import LiuGuangImage from "@/assets/1.webp";

import gsap from "gsap";

let scene, camera, renderer, model, controls, axesHelper, texture, pointG1;

let floorIndex = 0;
let xOpens = [-3000, 3000];
let floorYs = ref([0, 8400, 8400 * 2, 8400 * 3]);

const { snapshot, send, actorRef } = useMachine(elevatorMachine);

const containerRef = ref(null);

function init() {
  // 创建场景
  scene = new THREE.Scene();

  // 创建相机
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 5;

  // 创建渲染器
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  containerRef.value.appendChild(renderer.domElement);
  controls = new OrbitControls(camera, renderer.domElement);
  axesHelper = new THREE.AxesHelper(100, 100, 100);
  scene.add(axesHelper);

  // 添加光源
  // const light = new THREE.DirectionalLight(0xffffff, 0.4);
  // light.position.set(0, 1, 1).normalize();
  // scene.add(light);

  const ambientLight = new THREE.AmbientLight();
  scene.add(ambientLight);

  pointG1 = createPointLight();
  scene.add(pointG1.pointLight);

  // 创建聚光灯
  const spotG1 = createSpotLight({ position: { x: 0, y: 0, z: 5 } });
  const spotG2 = createSpotLight({ position: { x: 0, y: 0, z: -5 } });
  const spotG3 = createSpotLight({ position: { x: -5, y: 0, z: 0 } });
  const spotG4 = createSpotLight({ position: { x: 5, y: 0, z: 0 } });
  const spotG5 = createSpotLight({ position: { x: -5, y: 5, z: 0 } });
  const spotG6 = createSpotLight({ position: { x: 5, y: 5, z: 0 } });

  // 添加聚光灯到场景
  scene.add(spotG1.spotLight);
  // scene.add(spotG2.spotLight);
  // scene.add(spotG3.spotLight);
  // scene.add(spotG4.spotLight);
  // scene.add(spotG5.spotLight);
  // scene.add(spotG6.spotLight);

  // 添加一个辅助对象来可视化聚光灯
  // scene.add(spotG1.spotLightHelper);
  // scene.add(spotG2.spotLightHelper);
  // scene.add(spotG3.spotLightHelper);
  // scene.add(spotG4.spotLightHelper);
  // scene.add(spotG5.spotLightHelper);
  // scene.add(spotG6.spotLightHelper);

  scene.add(spotG1.targetObject);
  scene.add(spotG2.targetObject);
  scene.add(spotG3.targetObject);
  scene.add(spotG4.targetObject);
  scene.add(spotG5.targetObject);
  scene.add(spotG6.targetObject);

  // gsap.to(spotG1.targetObject.position, {
  //   duration: 2,
  //   x: 2,
  //   yoyo: true,
  //   repeat: -1,
  //   ease: "power1.inOut",
  //   onUpdate: () => {
  //     spotG1.spotLightHelper.update(); // 更新聚光灯辅助对象
  //   },
  // });

  // gsap.to(spotG2.targetObject.position, {
  //   duration: 2,
  //   x: 2,
  //   yoyo: true,
  //   repeat: -1,
  //   ease: "power1.inOut",
  //   onUpdate: () => {
  //     spotG2.spotLightHelper.update(); // 更新聚光灯辅助对象
  //   },
  // });

  // gsap.to(spotG3.targetObject.position, {
  //   duration: 2,
  //   x: 2,
  //   yoyo: true,
  //   repeat: -1,
  //   ease: "power1.inOut",
  //   onUpdate: () => {
  //     spotG3.spotLightHelper.update(); // 更新聚光灯辅助对象
  //   },
  // });

  // gsap.to(spotG4.targetObject.position, {
  //   duration: 2,
  //   x: 2,
  //   yoyo: true,
  //   repeat: -1,
  //   ease: "power1.inOut",
  //   onUpdate: () => {
  //     spotG4.spotLightHelper.update(); // 更新聚光灯辅助对象
  //   },
  // });

  // createLiuguang();

  // 加载OBJ模型
  const loader = new OBJLoader();
  loader.load("/evelator_obj/工地工程升降电梯.obj", function (obj) {
    console.log("obj", obj);
    model = obj;
    scene.add(model);
    centerAndScaleModel(model);

    const names = [
      "none_line",
      "护栏",
      "none_k",
      "电梯井",
      "电梯仓",
      "窗框2",
      "door2",
      "窗框1",
      "窗框3",
      "窗框4",
      "door1",
      "BackDoor1",
      "BackDoor2",
    ];

    const redMaterial = new THREE.MeshPhysicalMaterial({
      color: "red",
    });

    // 模糊玻璃 材质
    const glurredGlass = new THREE.MeshPhysicalMaterial({
      side: THREE.DoubleSide,
      specularColor: new THREE.Color("#ffffff"),
      color: 0xffffff,
      transmission: 0.9,
      opacity: 1,
      metalness: 0,
      roughness: 0,
      ior: 1.52,
      thickness: 0.8,
      specularIntensity: 1,
    });

    // 镜面玻璃 材质
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0.1,
      roughness: 0.05,
      transparent: true,
      opacity: 0.25,
      transmission: 0.9, // Transmission for glass effect
      thickness: 0.5, // Thickness of the glass
      envMapIntensity: 1, // Environment map intensity for reflections
    });

    // 黑色金属光泽 材质
    const blackMetalMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x808080, // 中金属灰色
      metalness: 1.0,
      roughness: 0.4,
      reflectivity: 0.6,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
    });

    const material = new THREE.MeshPhongMaterial({
      color: "red",
    });

    // model.materialLibraries[0] = "工地工程升降电梯.mtl"

    model.children.forEach((item, index) => {
      item.name = names[index];
    });

    scene.getObjectByName("door1").material = glurredGlass;
    scene.getObjectByName("door2").material = glurredGlass;
    scene.getObjectByName("电梯仓").material = blackMetalMaterial;
    scene.getObjectByName("电梯井").material = blackMetalMaterial;

    scene.getObjectByName("none_line").material = blackMetalMaterial;
    scene.getObjectByName("护栏").material = blackMetalMaterial;
    scene.getObjectByName("none_k").material = blackMetalMaterial;
  });

  // 处理窗口缩放
  window.addEventListener("resize", onWindowResize, false);

  // 渲染场景
  animate();
}

function openDoor() {
  const duration = 1;
  onPointLight();
  gsap.to(scene.getObjectByName("door1").position, {
    x: xOpens[0],
    y: floorYs.value[floorIndex],
    duration,
  });
  gsap.to(scene.getObjectByName("door2").position, {
    x: xOpens[1],
    y: floorYs.value[floorIndex],
    duration,
  });
  gsap.to(scene.getObjectByName("窗框1").position, {
    x: xOpens[0],
    y: floorYs.value[floorIndex],
    duration,
  });
  gsap.to(scene.getObjectByName("窗框2").position, {
    x: xOpens[1],
    y: floorYs.value[floorIndex],
    duration,
  });
}

function closeDoor() {
  const duration = 1;
  gsap.to(scene.getObjectByName("door1").position, {
    x: 0,
    y: floorYs.value[floorIndex],
    duration,
  });
  gsap.to(scene.getObjectByName("door2").position, {
    x: 0,
    y: floorYs.value[floorIndex],
    duration,
  });
  gsap.to(scene.getObjectByName("窗框1").position, {
    x: 0,
    y: floorYs.value[floorIndex],
    duration,
  });
  gsap.to(scene.getObjectByName("窗框2").position, {
    x: 0,
    y: floorYs.value[floorIndex],
    duration,
    onComplete() {
      offPointLight();
    },
  });
}

function addFloor(FI) {}

function setFloor(FI) {
  const arr = [
    "door1",
    "door2",
    "BackDoor1",
    "BackDoor2",
    "电梯仓",
    "窗框1",
    "窗框2",
    "窗框3",
    "窗框4",
  ];

  arr.forEach((id) => {
    gsap.to(scene.getObjectByName(id).position, { y: floorYs[floorIndex] });
  });
}

function getFloorNum(floorIndex) {
  if (floorIndex < 0) {
    return floorIndex;
  }
  return floorIndex + 1;
}

function centerAndScaleModel(model) {
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);
  const scale = 2 / maxDim;
  model.scale.set(scale, scale, scale);

  box.setFromObject(model);
  box.getCenter(model.position).multiplyScalar(-1);
}

function createSpotLight(params) {
  const position = params.position || { x: 0, y: 1, z: 5 };
  const spotLight = new THREE.SpotLight(0xffffff);
  spotLight.position.set(position.x, position.y, position.z);
  spotLight.angle = Math.PI / 10;
  spotLight.penumbra = 0.1;
  spotLight.decay = 0.1;
  spotLight.distance = 10;
  // 创建目标对象
  const targetObject = new THREE.Object3D();
  targetObject.position.set(0, 0, 0);
  spotLight.target = targetObject;

  const spotLightHelper = new THREE.SpotLightHelper(spotLight);

  return { spotLight, targetObject, spotLightHelper };
}

function createPointLight() {
  // 添加点光源
  const pointLight = new THREE.PointLight(0xe0db70, 0, 1);
  pointLight.position.set(0, -0.6, 0);
  const geometry = new THREE.SphereGeometry(0.02, 10, 10);
  const material = new THREE.MeshBasicMaterial({ color: 0x000000 });
  const sphere = new THREE.Mesh(geometry, material);
  sphere.position.set(0, -0.6, 0);
  scene.add(sphere);
  pointLight.distance = 0.5;
  return { pointLight, material };
}

function onPointLight() {
  pointG1.pointLight.intensity = 0.2;
  pointG1.material.color.set(0xe0db70);
}

function offPointLight() {
  pointG1.pointLight.intensity = 0;
  pointG1.material.color.set(0x000000);
}

function createLiuguang() {
  texture = new THREE.TextureLoader().load(LiuGuangImage);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping; //每个都重复
  texture.repeat.set(1, 1);
  texture.needsUpdate = true;

  let material = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.BackSide,
    transparent: true,
  });

  // 创建顶点数组
  let points = [
    new THREE.Vector3(1, 0, -1),
    new THREE.Vector3(1, 0, 1),
    new THREE.Vector3(-1, 0, 1),
    new THREE.Vector3(-1, 0, -1),
  ];

  // CatmullRomCurve3创建一条平滑的三维样条曲线
  let curve = new THREE.CatmullRomCurve3(points); // 曲线路径

  // 创建管道
  let tubeGeometry = new THREE.TubeGeometry(curve, 80, 0.01, 8, true);

  let mesh = new THREE.Mesh(tubeGeometry, material);

  if (texture) {
    gsap.to(texture.offset, { x: 10, duration: 50, repeat: -1 });
  }

  scene.add(mesh);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  // if(texture) texture.offset.x -= 0.01;
  renderer.render(scene, camera);
}

// 初始化
onMounted(() => {
  init();
});
</script>

<style scoped>
.test {
  width: 100vw;
  height: 100vh;
}

.opera {
  width: 300px;
  position: absolute;
  right: 0;
  top: 0;
}

.state {
  color: #fff;
  font-size: 20px;
  margin-bottom: 20px;
}
</style>

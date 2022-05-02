import "./style.css";
import {
  AmbientLight,
  BoxGeometry,
  Color,
  DirectionalLight,
  Mesh,
  MeshStandardMaterial,
  PCFSoftShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  WebGLRenderer,
} from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import handleResize from "./helpers/handleResize";
import { loadTextureWithMaps, setRepeatMapping } from "./helpers/loadTextures";

const init = async () => {
  const canvas = document.querySelector<HTMLDivElement>("#webgl")!;
  const scene = new Scene();
  const sceneObjects = [];

  const mesh = new Mesh(
    new BoxGeometry(1, 1, 1, 2, 2, 2),
    new MeshStandardMaterial()
  );

  mesh.position.y = 1;

  const geometry = new PlaneGeometry(100, 100, 100, 100);
  const material = new MeshStandardMaterial();

  const rockMossTexture = await loadTextureWithMaps("Rock_Moss_001");

  material.map = setRepeatMapping(rockMossTexture[0], 10, 10);
  material.displacementMap = setRepeatMapping(rockMossTexture[1], 10, 10);
  material.normalMap = setRepeatMapping(rockMossTexture[2], 10, 10);
  material.aoMap = setRepeatMapping(rockMossTexture[3], 10, 10);
  material.roughnessMap = setRepeatMapping(rockMossTexture[4], 10, 10);

  material.needsUpdate = true;

  const plane = new Mesh(geometry, material);

  plane.position.y = -0.5;
  plane.rotation.x = -Math.PI / 2;
  plane.receiveShadow = true;

  const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
  };

  let aspectRatio = sizes.width / sizes.height;

  const camera = new PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );

  camera.position.z = 8;
  camera.position.y = 8;
  camera.position.x = 8;
  camera.lookAt(mesh.position);

  scene.background = new Color(0x3333ff);

  scene.add(camera);

  scene.add(mesh);
  sceneObjects.push(mesh);
  scene.add(plane);
  sceneObjects.push(plane);

  addExperimentalCube();

  let ambientLight = new AmbientLight(0x505050);
  let directionalLight = new DirectionalLight(0xffffff, 1);
  directionalLight.castShadow = true;
  directionalLight.position.set(2, 10, 1);
  directionalLight.target.position.set(0, 0, 0);
  //Set up shadow properties for the light
  directionalLight.shadow.mapSize.width = 100; // default
  directionalLight.shadow.mapSize.height = 100; // default
  directionalLight.shadow.camera.near = 0.5; // default
  directionalLight.shadow.camera.far = 500; // default

  scene.add(ambientLight);
  scene.add(directionalLight);
  scene.add(directionalLight.target);

  // let directionalLightHelper = new DirectionalLightHelper(directionalLight, 5);
  // scene.add(directionalLightHelper);

  const controls = new OrbitControls(camera, canvas);

  controls.enableDamping = true;
  controls.minPolarAngle = Math.PI / 6; // radians
  controls.maxPolarAngle = Math.PI / 2; // radians

  const renderer = new WebGLRenderer({
    canvas,
  });

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.render(scene, camera);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFSoftShadowMap;

  handleResize(sizes, aspectRatio, camera, renderer);

  const cursor = {
    x: 0,
    y: 0,
  };

  window.addEventListener("mousemove", (event) => {
    cursor.x = event.clientX / sizes.width - 0.5;
    cursor.y = event.clientY / sizes.height - 0.5;
  });

  // window.addEventListener("dblclick", () => {
  //   document.fullscreenElement
  //     ? document.exitFullscreen()
  //     : canvas.requestFullscreen();
  // });

  // const clock = new Clock();

  const tick = () => {
    // const elapsedTime = clock.getElapsedTime();

    // camera.position.x = Math.sin(cursor.x * Math.PI * 2) * 3;
    // camera.position.z = Math.cos(cursor.x * Math.PI * 2) * 3;
    // camera.position.y = cursor.y * -5;
    // camera.lookAt(mesh.position);
    controls.update();

    renderer.render(scene, camera);

    window.requestAnimationFrame(tick);
  };

  tick();

  function addExperimentalCube() {
    let uniforms = {
      colorB: { type: "vec3", value: new Color(0xacb6e5) },
      colorA: { type: "vec3", value: new Color(0x74ebd5) },
    };

    let geometry = new BoxGeometry(1, 1, 1);
    let material = new ShaderMaterial({
      uniforms: uniforms,
      fragmentShader: fragmentShader(),
      vertexShader: vertexShader(),
    });

    let mesh = new Mesh(geometry, material);

    mesh.castShadow = true;
    mesh.position.x = 2;
    mesh.position.y = 1;
    scene.add(mesh);
    sceneObjects.push(mesh);
  }

  function vertexShader() {
    return `
    varying vec3 vUv; 

    void main() {
      vUv = position; 

      vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
      gl_Position = projectionMatrix * modelViewPosition; 
    }
  `;
  }

  function fragmentShader() {
    return `
    uniform vec3 colorA; 
    uniform vec3 colorB; 
    varying vec3 vUv;

    void main() {
      gl_FragColor = vec4(mix(colorA, colorB, vUv.z), 1.0);
    }
  `;
  }
};

init();

import "./style.css";
import {
  AmbientLight,
  BoxGeometry,
  Color,
  Mesh,
  MeshLambertMaterial,
  PerspectiveCamera,
  PointLight,
  Scene,
  ShaderMaterial,
  WebGLRenderer,
} from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import handleResize from "./helpers/handleResize";

const canvas = document.querySelector<HTMLDivElement>("#webgl")!;
const scene = new Scene();
const sceneObjects = [];

const mesh = new Mesh(
  new BoxGeometry(1, 1, 1, 2, 2, 2),
  new MeshLambertMaterial() // { color: "#ff0000", wireframe: false }
);

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

camera.position.z = 3;
camera.position.y = 3;
camera.position.x = 3;
camera.lookAt(mesh.position);

scene.add(camera);

scene.add(mesh);
sceneObjects.push(mesh);

addExperimentalCube();

let ambientLight = new AmbientLight(0x505050);
let pointLight = new PointLight(0xdddddd);
pointLight.position.set(-5, -3, 3);

scene.add(ambientLight);
scene.add(pointLight);

const controls = new OrbitControls(camera, canvas);

controls.enableDamping = true;

const renderer = new WebGLRenderer({
  canvas,
});

renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.render(scene, camera);

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
  mesh.position.x = 2;
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

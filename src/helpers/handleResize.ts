import { PerspectiveCamera, WebGLRenderer } from "three";

interface ISize {
  width: number;
  height: number;
}
interface IReturnSizes {
  sizes: ISize;
  aspectRatio: number;
}

export default (
  sizes: ISize,
  aspectRatio: number,
  camera: PerspectiveCamera,
  renderer: WebGLRenderer
): IReturnSizes => {
  window.addEventListener("resize", () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    aspectRatio = sizes.width / sizes.height;

    camera.aspect = aspectRatio;
    camera.updateProjectionMatrix();

    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  });

  return {
    sizes,
    aspectRatio,
  };
};

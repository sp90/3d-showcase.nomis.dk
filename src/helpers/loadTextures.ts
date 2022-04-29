import {
  LoadingManager,
  MeshStandardMaterial,
  RepeatWrapping,
  Texture,
  TextureLoader,
} from "three";

export const loadTextures = (urls: string[], callback: Function) => {
  const textures: Texture[] = [];

  const onLoad = () => {
    callback(null, textures);
  };

  const onProgress = () => {};

  const onError = (url: string) => {
    callback(new Error("Cannot load " + url));
  };

  const manager = new LoadingManager(onLoad, onProgress, onError);
  const loader = new TextureLoader(manager);

  for (var i = 0; i < urls.length; i++) {
    textures.push(loader.load(urls[i]));
  }
};

export interface TexturesWithMaps {
  basecolor: Texture;
  height: Texture;
  normal: Texture;
  ambientOcclusion: Texture;
  roughness: Texture;
}

export const loadTextureWithMaps = async (
  baseName: string,
  fileType = "png"
) => {
  const loader = new TextureLoader();

  const promises = [
    await loader.loadAsync(`/${baseName}_basecolor.${fileType}`),
    await loader.loadAsync(`/${baseName}_height.${fileType}`),
    await loader.loadAsync(`/${baseName}_normal.${fileType}`),
    await loader.loadAsync(`/${baseName}_ambientOcclusion.${fileType}`),
    await loader.loadAsync(`/${baseName}_roughness.${fileType}`),
  ];

  return Promise.all(promises);
};

export const setRepeatMapping = (texture: Texture, x: number, y: number) => {
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.repeat.set(x, y);

  return texture;
};

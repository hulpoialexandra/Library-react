import { useCamera } from '@ionic/react-hooks/camera';
import { CameraPhoto, CameraResultType, CameraSource, FilesystemDirectory } from '@capacitor/core';
import { useEffect, useState } from 'react';
import { base64FromPath, useFilesystem } from '@ionic/react-hooks/filesystem';
import { useStorage } from '@ionic/react-hooks/storage';

export interface Photo {
  filepath: string;
  webviewPath?: string;

  id?:string;
}

const PHOTO_STORAGE = 'photos';

export function usePhotoGallery() {
  const { getPhoto } = useCamera();
  const [photos, setPhotos] = useState<Photo[]>([]);

  const takePhoto = async () => {
    const cameraPhoto = await getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 100
    });
    const fileName = new Date().getTime() + '.jpeg';
    const savedFileImage = await savePicture(cameraPhoto, fileName);
    const newPhotos = [savedFileImage, ...photos];
    setPhotos(newPhotos);
    set(PHOTO_STORAGE, JSON.stringify(newPhotos));
  };

  const { deleteFile, readFile, writeFile } = useFilesystem();
  const savePicture = async (photo: CameraPhoto, fileName: string): Promise<Photo> => {
    const base64Data = await base64FromPath(photo.webPath!);
    await writeFile({
      path: fileName,
      data: base64Data,
      directory: FilesystemDirectory.Data
    });

    return {
      filepath: fileName,
      webviewPath: photo.webPath
    };
  };

  const { get, set } = useStorage();
  useEffect(() => {
    const loadSaved = async () => {
      const photosString = await get(PHOTO_STORAGE);
      const photos = (photosString ? JSON.parse(photosString) : []) as Photo[];
      for (let photo of photos) {
        const file = await readFile({
          path: photo.filepath,
          directory: FilesystemDirectory.Data
        });
        photo.webviewPath = `data:image/jpeg;base64,${file.data}`;
      }
      setPhotos(photos);
    };
    loadSaved();
  }, [get, readFile]);

  const deletePhoto = async (photo: Photo) => {
    const newPhotos = photos.filter(p => p.filepath !== photo.filepath);
    set(PHOTO_STORAGE, JSON.stringify(newPhotos));
    const filename = photo.filepath.substr(photo.filepath.lastIndexOf('/') + 1);
    await deleteFile({
      path: filename,
      directory: FilesystemDirectory.Data
    });
    setPhotos(newPhotos);
  };

  const selectPhoto = async (id:string,photo: Photo) => {
    const newPhotos = photos.filter(p => p.id !== id);
    const ph = photos.filter(p => p.id == id)[0];
    if(ph){
      ph.id=undefined;
      newPhotos[newPhotos.length]=ph;
    }
    const newPhotos2 = newPhotos.filter(p => p.filepath !== photo.filepath);
    photo.id=id;
    newPhotos2[newPhotos2.length]=photo;
    set(PHOTO_STORAGE, JSON.stringify(newPhotos2));
    setPhotos(newPhotos2);
  };

  return {
    photos,
    takePhoto,
    deletePhoto,
    selectPhoto,
  };
}
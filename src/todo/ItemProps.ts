import { Photo } from "../camera/usePhotoGallery";

export interface ItemProps {
  _id?: string;
  titlu: string;
  autor:string;
  version:string;
  photo?:Photo;
}

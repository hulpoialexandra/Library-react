import { createAnimation,IonActionSheet,IonModal, IonButton, IonButtons, IonCol, IonContent, IonFab, IonFabButton, IonGrid, IonHeader, IonIcon, IonImg, IonPage, IonRow, IonTitle, IonToolbar } from "@ionic/react"
import React, { useState } from "react"
import { Photo, usePhotoGallery } from "./usePhotoGallery";
import { camera, close, trash,checkmark } from 'ionicons/icons';
import { RouteComponentProps } from "react-router";




interface PhotoGalleryProps extends RouteComponentProps<{
    id?: string;
  }> {}

const PhotoGalleryScreen:React.FC<PhotoGalleryProps> =({ history,match})=>{
    const {photos,takePhoto,deletePhoto,selectPhoto}=usePhotoGallery();
    const [photoToDelete,setPhotoToDelete]=useState<Photo>();
    

    //----------
    const [showModal, setShowModal] = useState(false);

    const enterAnimation = (baseEl: any) => {
        const backdropAnimation = createAnimation()
          .addElement(baseEl.querySelector('ion-backdrop')!)
          .fromTo('opacity', '0.01', 'var(--backdrop-opacity)');
    
        const wrapperAnimation = createAnimation()
          .addElement(baseEl.querySelector('.modal-wrapper')!)
          .keyframes([
            { offset: 0, opacity: '0', transform: 'scale(0)' },
            { offset: 1, opacity: '0.99', transform: 'scale(1)' }
          ]);
    
        return createAnimation()
          .addElement(baseEl)
          .easing('ease-out')
          .duration(500)
          .addAnimation([backdropAnimation, wrapperAnimation]);
      }
      const leaveAnimation = (baseEl: any) => {
        return enterAnimation(baseEl).direction('reverse');
      }
    //----------
    console.log("Render PhotoGalleryScreen");
    return(
        <IonModal isOpen={true} enterAnimation={enterAnimation} leaveAnimation={leaveAnimation}>
            <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonButton onClick={()=>history.goBack()}>
                            Back
                        </IonButton>
                    </IonButtons>                     
                    <IonTitle>Photo Gallery</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonGrid>
                    <IonRow>
                        {photos.map((photo, index) => (
                        <IonCol size="4" key={index}>
                            <IonImg onClick={() => setPhotoToDelete(photo)}
                                    src={photo.webviewPath}/>
                        </IonCol>
                        ))}
                    </IonRow>
                </IonGrid>
                <IonFab vertical="bottom" horizontal="center" slot="fixed">
                    <IonFabButton onClick={() => takePhoto()}>
                        <IonIcon icon={camera}/>
                    </IonFabButton>
                </IonFab>
                <IonActionSheet
                isOpen={!!photoToDelete}
                buttons={[{
                    text: 'Delete',
                    role: 'destructive',
                    icon: trash,
                    handler: () => {
                    if (photoToDelete) {
                        deletePhoto(photoToDelete);
                        setPhotoToDelete(undefined);
                    }
                    }
                }, 
                
                {
                    text: 'Select',
                    icon: checkmark,
                    handler: () => {
                        if (photoToDelete) {
                            const routeId = match.params.id || '';
                            selectPhoto(routeId,photoToDelete);
                            setPhotoToDelete(undefined);
                            history.goBack();
                        }
                        }
                },
                {
                    text: 'Cancel',
                    icon: close,
                    role: 'cancel'
                }]}
                onDidDismiss={() => setPhotoToDelete(undefined)}
                />
            </IonContent>
        </IonPage>
        </IonModal>
    )
}
export default PhotoGalleryScreen;
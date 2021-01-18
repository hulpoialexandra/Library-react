import React, { useContext, useEffect, useState } from 'react';
import {
  IonButton,
  IonButtons,
  IonFab,
  IonFabButton,
  IonContent,
  IonHeader,
  IonInput,
  IonLabel,
  IonIcon,
  IonLoading,
  IonPage,
  IonTitle,
  IonToolbar,
  IonAlert,
  IonImg,
  IonActionSheet,
  createAnimation
} from '@ionic/react';
import { getLogger } from '../core';
import {camera, trash,map,create,close, ellipseSharp } from 'ionicons/icons';
import { ItemContext } from './ItemProvider';
import { RouteComponentProps } from 'react-router';
import { ItemProps } from './ItemProps';
import { removeItem } from './itemApi';
import { Plugins } from '@capacitor/core';
import { Photo, usePhotoGallery } from '../camera/usePhotoGallery';
import { PhotoGalleryScreen } from '../camera';

const {Storage}=Plugins;
const log = getLogger('ItemEdit');


interface ItemEditProps extends RouteComponentProps<{
  id?: string;
}> {}

const ItemEdit: React.FC<ItemEditProps> = ({ history, match }) => {
  const { items, saving, savingError, saveItem,deleting,deletingError,deleteItem,itemsStorage } = useContext(ItemContext);
  const [titlu, setTitlu] = useState('');
  const [autor, setAutor] = useState('');
  const [version, setVersion] = useState('');
  const [photo,setPhoto]=useState<Photo>();
  const [photoToUpdate,setPhotoToUpdate]=useState<Photo>();
  const {photos,deletePhoto}=usePhotoGallery();
  const [versionChanged, setVersionChanged] = useState(false);
  const [item, setItem] = useState<ItemProps>();
  useEffect(shakeAnimations, []);

  // const [showAlert1, setShowAlert1] = useState(false);
  
  // useEffect(()=>{
  //   if(savingError){
  //     console.log("ALERTAAAA")
  //     setShowAlert1(true)
  //   }
  // },[savingError])
  // useEffect(()=>{

  // },[])
  
  useEffect(()=>{
    if(versionChanged==true){
      console.log("VERSIUNEA "+version)
      if(version==""){
        setVersion("1")
      }
      else{
        const newVersion=(parseInt(version)+1).toString();
        setVersion(newVersion);
      }
    }
  },[versionChanged])
  useEffect(() => {
    log('useEffect');
    const routeId = match.params.id || '';
    const item = items?.find(it => it._id === routeId);
    // setItem(item);
    if (item) {
      setItem(item);
      setTitlu(item.titlu);
      setAutor(item.autor);
      setVersion(item.version);
      if(item.photo)
        setPhoto(item.photo);
      else{
        setPhoto(photos.filter(p => p.id == item._id)[0]);
      }
    }
    else{
      console.log("sunt aici")
      const item2 = itemsStorage?.find(it => it._id === routeId);
      if(item2){
        setItem(item2);
        setTitlu(item2.titlu);
        setAutor(item2.autor);
        setVersion(item2.version)
        if(item2.photo)
          setPhoto(item2.photo);
        else{
          setPhoto(photos.filter(p => p.id == item2._id)[0]);
        }
      }
    }
  }, [match.params.id, items||itemsStorage,photos]);
  const handleSave = () => {
    const editedItem = item ? { ...item, titlu,autor,version } : { titlu,autor,version };
    saveItem && saveItem(editedItem).then(() => history.goBack());
  };
  const handleDelete=()=>{
    const removedItem=item? { ...item, titlu,autor,version } : { titlu,autor,version };
    deleteItem && deleteItem(removedItem).then(()=>history.goBack());
  };

  log('render');
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton className="back" onClick={()=>history.goBack()}>
              Back
            </IonButton>
          </IonButtons>          
          <IonTitle>Editare carte</IonTitle>
          <IonButtons slot="end">
            <IonButton className="save" onClick={()=>{
              if(titlu==""){
                const el = document.querySelector('.shake1');
                if (el) {
                  const animation = createAnimation()
                    .addElement(el)
                    .duration(1000)
                    // .direction('alternate')
                    .iterations(Infinity)
                    .afterStyles({
                      'color':'red'
                    })
                  animation.play();
                }
              }
              else{
                const el = document.querySelector('.shake1');
                if (el) {
                  const animation = createAnimation()
                    .addElement(el)
                    .duration(1000)
                    // .direction('alternate')
                    .iterations(Infinity)
                    .afterStyles({
                      'color':'green'
                    })
                  animation.play();
                }
              }
              if(autor==""){
                const el = document.querySelector('.shake2');
                if (el) {
                  const animation = createAnimation()
                    .addElement(el)
                    .duration(1000)
                    // .direction('alternate')
                    .iterations(Infinity)
                    .afterStyles({
                      'color':'red'
                    })
                  animation.play();
                }
              }
              else{
                const el = document.querySelector('.shake2');
                if (el) {
                  const animation = createAnimation()
                    .addElement(el)
                    .duration(1000)
                    // .direction('alternate')
                    .iterations(Infinity)
                    .afterStyles({
                      'color':'green'
                    })
                  animation.play();
                }
                chainAnimations();
              }
              if(autor!=""&&titlu!="")
                  handleSave()
              }}>
              Save
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonInput className="shake1" placeholder="Titlu" value={titlu} onIonChange={e => {
          setTitlu(e.detail.value || '');
          setVersionChanged(true)
        }} />
        <IonInput className="shake2" placeholder="Autor" value={autor} onIonChange={e => {
          setAutor(e.detail.value || '')
          setVersionChanged(true)
        }} />
        <div>
        <IonLabel>Version</IonLabel>
        <IonInput placeholder="0" value={version} disabled/>
        </div>
        {photo &&
          <IonImg src={photo?.webviewPath} onClick={()=>setPhotoToUpdate(photo)}/>
        }
        <IonActionSheet
                isOpen={!!photoToUpdate}
                buttons={[{
                    text: 'Delete',
                    role: 'destructive',
                    icon: trash,
                    handler: () => {
                    if (photoToUpdate) {
                        deletePhoto(photoToUpdate);
                        setPhotoToUpdate(undefined);
                        setPhoto(undefined);
                    }
                    }
                },
                {
                  text: 'Update',
                  role: 'destructive',
                  icon: create,
                  handler: () => {
                  if (photoToUpdate) {
                      // updatePhoto(photoToUpdate);
                      setPhotoToUpdate(undefined);
                      if(item)
                        history.push(`/camera/${item._id}`);
                  }
                  }
                }, 
                {
                  text: 'Cancel',
                  icon: close,
                  role: 'cancel'
                }]}
                onDidDismiss={() => setPhotoToUpdate(undefined)}
                />
        <IonLoading isOpen={saving} />
        {/* {savingError && (
          setShowAlert1(true)
        )} */}
        {/* <IonAlert
        isOpen={showAlert1}
        onDidDismiss={() => setShowAlert1(false)}
        header={'Alert'}
        subHeader={'Subtitle'}
        message={'This is an alert message.'}
        buttons={['OK']}
      /> */}
      {/*
        <IonLoading isOpen={deleting} />
        {deletingError && (
          <div>{deletingError.message || 'Failed to delete item'}</div>
        )} */}
        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={handleDelete}>
              <IonIcon icon={trash} />
            </IonFabButton>
        </IonFab>
        {!photo &&  <IonFab vertical="bottom" horizontal="start" slot="fixed">
          <IonFabButton onClick={() => {
            if(item)
            history.push(`/camera/${item._id}`);
          }}>
            <IonIcon icon={camera} />
          </IonFabButton>
        </IonFab>}
        <IonFab vertical="bottom" horizontal="center" slot="fixed">
          <IonFabButton onClick={() =>{
            if(item) 
            history.push(`/map/${item._id}`);}}>
            <IonIcon icon={map} />
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  );

  function shakeAnimations(){
    const el1 = document.querySelector('.shake1');
    const el2 = document.querySelector('.shake2');
    if (el1 && el2) {
      const animation1 = createAnimation()
        .addElement(el1)
        .duration(300)
        .direction('alternate')
        .iterations(4)
        .fromTo('transform', 'translateX(0px)', 'translateX(10px)');
      const animation2 = createAnimation()
        .addElement(el2)
        .duration(300)
        .direction('alternate')
        .iterations(3)        
        .fromTo('transform', 'translateX(10px)', 'translateX(0px)');
      //   (async () => {
      //   await animation1.play();
      //   await animation2.play();
      // })();
      const parentAnimation = createAnimation()
      .duration(10000)
      .addAnimation([animation1, animation2]);
    parentAnimation.play();  
    }
  }
  function chainAnimations() {
    const elB = document.querySelector('.save');
    const elC = document.querySelector('.back');
    if (elB && elC) {
      const animationA = createAnimation()
        .addElement(elB)
        .duration(2000)
        .fromTo('transform', 'scale(1)', 'scale(1.5)')
        .afterStyles({
          'color': 'blue'
        });
      const animationB = createAnimation()
        .addElement(elC)
        .duration(2000)
        .fromTo('transform', 'scale(1)', 'scale(0.5)')
        .afterStyles({
          'color': 'blue'
        });
        (async () => {
        await animationA.play();
        await animationB.play();
      })();
    }
  }
};


export default ItemEdit;

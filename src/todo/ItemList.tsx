import React, { useContext, useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router';
import {
  IonAlert,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonImg,
  IonLabel,
  IonList, IonLoading,
  IonPage,
  IonSearchbar,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar
} from '@ionic/react';
import { add,logOut,checkmarkCircle,alertCircle,camera} from 'ionicons/icons';
import Item from './Item';
import { getLogger } from '../core';
import { ItemContext } from './ItemProvider';
import { AuthContext } from '../auth/AuthProvider';
import { useNetwork } from './useNetwork';
import { Plugins } from '@capacitor/core';
import { ItemProps } from './ItemProps';
import { usePhotoGallery } from '../camera/usePhotoGallery';

const {Storage}=Plugins;

const log = getLogger('ItemList');



const ItemList: React.FC<RouteComponentProps> = ({ history }) => {
  const { items, fetching, fetchingError,savingError,itemsStorage} = useContext(ItemContext);
  const {logout,token}=useContext(AuthContext);
  const { networkStatus } = useNetwork();
  const[searchItem,setSearchItem]=useState<string>('');
  const [filter, setFilter] = useState<string | undefined>(undefined);
  const [filterItems,setFilterItems]=useState<ItemProps[]|undefined>([]);
  const [showAlert1, setShowAlert1] = useState(false);
  const {photos}=usePhotoGallery();


  async function fetchData(reset?: boolean) {
    console.log(filter);
    setFilterItems(items?.filter(({_id,titlu,autor})=>filter&&autor.indexOf(filter)>=0));
    setFilterItems(itemsStorage?.filter(({_id,titlu,autor})=>filter&&autor.indexOf(filter)>=0));
    console.log(filterItems);
  }

  useEffect(()=>{
    if(savingError){
      setShowAlert1(true)
    }
  },[savingError])

  useEffect(() => {
    fetchData(true);
  }, [filter]);
  
  log('render');
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Biblioteca</IonTitle>
          <IonLabel>Connected</IonLabel>
        {networkStatus.connected===true&&(
        <IonIcon icon={checkmarkCircle}/>
        )}
        {networkStatus.connected===false&&(
        <IonIcon icon={alertCircle}/>
        )}
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonLoading isOpen={fetching} message="Fetching items" />
        <IonSearchbar 
          value={searchItem}
          debounce={500}
          onIonChange={e=>setSearchItem(e.detail.value!)}>
        </IonSearchbar>
        <IonSelect value={filter} placeholder="Select autor" onIonChange={e=>setFilter(e.detail.value)}>
          <IonSelectOption key={'0'} value={false}>{'none'}</IonSelectOption>
          {items&&items.map(item => <IonSelectOption key={item._id} value={item.autor}>{item.autor}</IonSelectOption>)}
          {!items&& itemsStorage &&itemsStorage.map(item => <IonSelectOption key={item._id} value={item.autor}>{item.autor}</IonSelectOption>)}
        </IonSelect>
        {filterItems && (
          <IonList>
            {filterItems
            .filter(({_id,titlu,autor})=>titlu.indexOf(searchItem)>=0)
            .map(({ _id, titlu,autor,version}) =>
              <Item key={_id} _id={_id} titlu={titlu} autor={autor} version={version} onEdit={id => history.push(`/item/${id}`)} />)}
          </IonList>
        )}
        {!filter && items && (
          <IonList>
            {items
            .filter(({_id,titlu,autor})=>titlu.indexOf(searchItem)>=0)
            .map(({ _id, titlu,autor,version}) =>
              <Item key={_id} _id={_id} titlu={titlu} autor={autor} version={version} onEdit={id => history.push(`/item/${id}`)} />)}
              
          </IonList>
        )}
        {!filter &&!items && itemsStorage && (
          <IonList>
            {itemsStorage
              .filter(({_id,titlu,autor})=>titlu.indexOf(searchItem)>=0)
              .map(({ _id, titlu,autor,version}) =>
              [<Item key={_id} _id={_id} titlu={titlu} autor={autor} version={version} onEdit={id => history.push(`/item/${id}`)} />,
              <IonImg src={photos.filter(p => p.id == _id)[0]?.webviewPath}/>]
              )}
          </IonList>
        )}
        {/* persistenta */}
        {/* {storageItems && (
          <IonList>
              {storageItems.map(({ _id, titlu,autor}) =>
              <Item key={_id} _id={_id} titlu={titlu} autor={autor} onEdit={id => history.push(`/item/${id}`)} />)}
          </IonList>
        )} */}
        {fetchingError && (
          <div>Failed to connect to server</div>
        )}
        <IonAlert
        isOpen={showAlert1}
        onDidDismiss={() => setShowAlert1(false)}
        header={'Alert'}
        subHeader={'Error saving item'}
        message={'Cannot save item, conflict detected.'}
        buttons={['OK']}
      />
        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={() => history.push('/item')}>
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>
        <IonFab vertical="bottom" horizontal="start" slot="fixed">
          <IonFabButton onClick={() => logout && logout(token)}>
            <IonIcon icon={logOut} />
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  );
};

export default ItemList;

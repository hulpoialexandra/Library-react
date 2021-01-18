import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import React from 'react';
import { MyMap } from './MyMap';
import { RouteComponentProps } from 'react-router';
import { useLocation } from './UseLocation';

interface MapScreenProps extends RouteComponentProps<{
  id?: string;
}> {}

const Home: React.FC<MapScreenProps> = ({match}) => {
  const routeId = match.params.id || '';
  // const myLocation = useMyLocation();
  const {locations,getLocation,setLocation }= useLocation();
  const myLocation=getLocation(routeId);
  const { lat: lat, lng: lng } = myLocation || {}
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Map</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Map</IonTitle>
          </IonToolbar>
        </IonHeader>
        <div>My Location is</div>
        <div>latitude: {lat}</div>
        <div>longitude: {lng}</div>
        {lat && lng &&
          <MyMap
            lat={lat}
            lng={lng}
            onMapClick={
              log('onMap')
            }
            onMarkerClick={log('onMarker')}
          />}
      </IonContent>
    </IonPage>
  );

  function log(source: string) {
    return (e: any) => {
      console.log(source, e.latLng.lat(), e.latLng.lng());
      setLocation(routeId,e.latLng.lat(), e.latLng.lng())
    }
  }
};

export default Home;

import { useEffect, useState } from 'react';
import { useMyLocation } from './useMyLocation';
import { useStorage } from '@ionic/react-hooks/storage';


interface Location {
    id?:string;
    lat?:number;
    lng?:number;
}
const LOCATION_STORAGE = 'locations';


export function useLocation() {
    const myLocation = useMyLocation();
    const [locations,setLocations]=useState<Location[]>();

    const { get, set } = useStorage();
    useEffect(() => {
      const loadSaved = async () => {
        const photosString = await get(LOCATION_STORAGE);
        const photos = (photosString ? JSON.parse(photosString) : []) as Location[];
        setLocations(photos);
      };
      loadSaved();
    }, [get]);
    
    const getLocation=(id:string):{lat:number|undefined,lng:number|undefined}=>{
        var location;
        if(locations)
            location = locations.filter(p => p.id == id)[0];
        if(location){
            const loc={lat:location.lat,lng:location.lng}
            return loc;
        }
        const loc={lat:myLocation.position?.coords.latitude,lng:myLocation.position?.coords.longitude}
        return loc;    
    }
        
    const setLocation=(id:string,lat:number,lng:number)=>{
        const locations2 = locations?.filter(p => p.id !== id);
        const location = locations?.filter(p => p.id == id)[0];
        if(location){
            location.lat=lat;
            location.lng=lng;
            if(locations2){
                locations2[locations2.length]=location;
                set(LOCATION_STORAGE, JSON.stringify(locations2));
                setLocations(locations2);
            }
            else{
                set(LOCATION_STORAGE, JSON.stringify([location]));
                setLocations([location]);
            }
        }
        else{
            const loc={id,lat,lng};
            if(locations2){
                locations2[locations2.length]=loc;
                set(LOCATION_STORAGE, JSON.stringify(locations2));
                setLocations(locations2);
            }
            else{
                set(LOCATION_STORAGE, JSON.stringify([loc]));
                setLocations([loc]);
            }
        }    
    }
  
    return {locations,getLocation,setLocation};
}

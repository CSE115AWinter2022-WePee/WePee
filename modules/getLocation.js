import Geolocation from 'react-native-geolocation-service';
import { requestLocation, requestLocationPermission } from '../modules/requestLocation';


// function to check permissions and get Location
export const getCurrentLocation = async () => {
    return new Promise(async (resolve, reject) => {
        const res = await requestLocationPermission()
        if (res) {
            try {
                Geolocation.getCurrentPosition(
                    position => {
                        console.log(position);
                        const coordinates = {
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude,
                        }
                        const region = {
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude,
                            latitudeDelta: 0.0922,
                            longitudeDelta: 0.0421,
                        }
                        resolve({coordinates, region }) 
                    },
                    error => {
                        // See error code charts below.
                        console.log(error.code, error.message);
                        reject('ERROR LOCATION')
                    },
                    {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
                );
            } catch (error) {
                console.log(error.code, error.message);
                reject('ERROR LOCATION')
            }
       
        } else reject('ERROR LOCATION')

    })
    
   
};
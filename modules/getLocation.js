import { resolveConfig } from 'prettier';
import Geolocation from 'react-native-geolocation-service';
import { requestLocation, requestLocationPermission } from '../modules/requestLocation';


// function to check permissions and get location
export const getCurrentLocation = () => {
    return new Promise(async (resolve, reject) => {
        const res = await requestLocationPermission()
        if (res) {
            Geolocation.getCurrentPosition(
                position => {
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
                    resolve({coordinates, region})
                },
                error => {
                    reject(error.message);
                },
                {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
            );
        } else {
            reject("No location permission")
        }
    });
};
import Geolocation from 'react-native-geolocation-service';
import { requestLocation, requestLocationPermission } from '../modules/requestLocation';


// function to check permissions and get Location
export const getCurrentLocation = (setLocation, setRegion) => {
    const result = requestLocationPermission();
    result.then(res => {
    console.log('res is:', res);
    if (res) {
        Geolocation.getCurrentPosition(
        position => {
            console.log(position);
            setLocation(position);
            setRegion({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              });
        },
        error => {
            // See error code charts below.
            console.log(error.code, error.message);
            setLocation(false);
        },
        {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
        );
    }
    });
    //console.log('Location: ${location}');
};
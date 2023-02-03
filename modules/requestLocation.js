import { PermissionsAndroid, Platform } from 'react-native';
import Geolocation from 'react-native-geolocation-service';

export const requestLocationPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
              title: 'WePee Location Permission',
              message:
                'WePee needs access to your location ' +
                'so you can find nearby bathrooms.',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED ? true : false

        // if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        //   console.log('Location is go');
        //   return true;
        // } else {
        //   console.log('Location denied for some reason');
        //   return false;
        // }
      }
      else {
        // ios permission
        const iosAuth = await Geolocation.requestAuthorization('whenInUse')
        //console.log("ios auth status ", iosAuth)
        return iosAuth === 'granted' ? true : false

      }
      
    } catch (err) {
      console.warn(err);
      return false;
    }
  };
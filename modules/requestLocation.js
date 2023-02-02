import { PermissionsAndroid } from 'react-native';

export const requestLocationPermission = async () => {
    try {
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
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Location is go');
        return true;
      } else {
        console.log('Location denied for some reason');
        return false;
      }
    } catch (err) {
      console.warn(err);
      return false;
    }
  };
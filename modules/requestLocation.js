import { PermissionsAndroid } from 'react-native';

export const requestLocation = async () => {
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
      } else {
        console.log('Location denied for some reason');
      }
    } catch (err) {
      console.warn(err);
    }
  };
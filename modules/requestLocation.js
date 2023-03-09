import { PermissionsAndroid, Platform } from 'react-native'
import Geolocation from 'react-native-geolocation-service'

export const requestLocationPermission = async () => {
  try {
    if (Platform.OS === 'android') {
      // request multiple permissions: the android docs: https://developer.android.com/training/location/permissions
      // recommend requestin both fine and coarse location together so that you can fall back to coarse
      const granted = await PermissionsAndroid.requestMultiple([PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION, PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION])
      // const granted = await PermissionsAndroid.request(
      //   PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      //   {
      //     title: 'WePee Location Permission',
      //     message:
      //           'WePee needs access to your location ' +
      //           'so you can find nearby bathrooms.',
      //     buttonNegative: 'Cancel',
      //     buttonPositive: 'OK'
      //   }
      // )
      return Object.values(granted).includes(PermissionsAndroid.RESULTS.GRANTED)
    } else {
      // ios permission
      const iosAuth = await Geolocation.requestAuthorization('whenInUse')
      // console.log("ios auth status ", iosAuth)
      return iosAuth === 'granted'
    }
  } catch (err) {
    console.warn(err)
    return false
  }
}

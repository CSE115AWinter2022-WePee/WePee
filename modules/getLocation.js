import Geolocation from 'react-native-geolocation-service'
import { requestLocationPermission } from '../modules/requestLocation'

// function to check permissions and get location
export const getCurrentLocation = (latitudeDelta, longitudeDelta) => {
  console.log("getLocation:", latitudeDelta, longitudeDelta)
  return new Promise(async (resolve, reject) => {
    const res = await requestLocationPermission()
    if (res) {
      Geolocation.getCurrentPosition(
        position => {
          const coordinates = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }
          const region = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            latitudeDelta: latitudeDelta,
            longitudeDelta: longitudeDelta
          }
          resolve({ coordinates, region })
        },
        error => {
          reject(error.message)
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      )
    } else {
      reject(new Error('No location permission'))
    }
  })
}

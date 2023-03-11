import Geolocation from 'react-native-geolocation-service'
import { requestLocationPermission } from '../modules/requestLocation'

// function to check permissions and get location
// Takes the `latitudeDelta` and `longitudeDelta` for the region view as arguments
export const getCurrentLocation = async (latitudeDelta, longitudeDelta) => {
  const res = await requestLocationPermission()
  if (res) {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        position => {
          const coordinates = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }
          const region = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            latitudeDelta,
            longitudeDelta
          }
          resolve({ coordinates, region })
        },
        error => {
          reject(error.message)
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      )
    })
  } else {
    return Promise.reject(new Error('No location permission'))
  }
}

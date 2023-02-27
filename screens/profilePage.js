import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import BottomSheet from '@gorhom/bottom-sheet'
import MapView, { Marker } from 'react-native-maps'
import firestore from '@react-native-firebase/firestore'
import { Icon, AirbnbRating, Dialog } from '@rneui/themed'
import { tags } from '../modules/tags'

import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  Alert
} from 'react-native'

import { ScrollView } from 'react-native-gesture-handler'

const ProfileScreen = ({ route }) => {
  // refs
  const bottomSheetRef = useRef(null)
  const mapViewRef = useRef(null)

  const [bathroomData, setBathroomData] = useState()
  const [tagsSection, setTagsSection] = useState()

  const [dbUserReviews, setDbUserReviews] = useState() // State to store current user reviews

  const snapPoints = useMemo(() => ['30%', '60%', '85%'], [])

  const [region, setRegion] = useState(route.params?.region) // Store current map region

  // On initial render only, fetch all bathroom data
  useEffect(() => {
    fetchBathroomData(route.params?.bathroomId)
  }, [])

  // Fetch current bathroom data from firestore database
  const fetchBathroomData = async (bathroomId) => {
    try {
      const doc = firestore().collection('bathrooms').doc(bathroomId)
      setDbUserReviews(doc)
      const snap = await doc.get()
      if (snap.exists) {
        setBathroomData(snap.data())
        setRegion({
          ...region,
          latitude: snap.data().latitude,
          longitude: snap.data().longitude
        })
        setCoordinate({ latitude: snap.data().latitude, longitude: snap.data().longitude })
        displayTags(snap.data())
      }
    } catch (error) {
      console.log(error)
    }
  }


  return (
    <View style={{ backgroundColor: 'white' }}>
      <SafeAreaView>
        <View style={{ height: '100%' }}>

          <TouchableOpacity // Animate to bathroom button
            onPress={() => { mapViewRef.current.animateToRegion(region, 1000) }}
            style={styles.bathroomLocationButton}
          >
            <Icon name='map-marker-alt' type='font-awesome-5' size={35} color='lightblue' />
          </TouchableOpacity>

          <TouchableOpacity // Show list button
            onPress={() => bottomSheetRef.current.snapToIndex(0)}
            style={styles.showListButton}
          >
            <Icon name='list' type='material' size={30} color='white' containerStyle={{ marginRight: 3 }} />
            <Text style={{ fontSize: 14, fontWeight: 'bold', color: 'white' }}>View List</Text>
          </TouchableOpacity>

        </View>

        <BottomSheet
          ref={bottomSheetRef}
          index={0}
          snapPoints={snapPoints}
          onChange={handleSheetChanges}
          style={{ marginBottom: 0 }}
          enablePanDownToClose
        >
          <ScrollView>
            <View style={{ flex: 1, alignItems: 'center', backgroundColor: 'lightgrey' }}>
              <View style={{ width: '100%', alignItems: 'center', backgroundColor: 'white', padding: 15 }}>
                <Text style={[styles.txt, { fontWeight: 'bold', fontSize: 20 }]}>
                  {bathroomData?.name}
                </Text>
                <Text style={[styles.txt, { marginVertical: 15 }]}>
                  {bathroomData?.description}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>

                </View>

                <TouchableOpacity style={{ alignContent: 'center', marginTop: 10 }} onPress={toggleDialog}>
                  <Text style={[styles.txt, { fontWeight: 'bold', textDecorationLine: 'underline', fontSize: 18 }]}>
                    Leave a review
                  </Text>
                </TouchableOpacity>

                <ShowDialog />

              </View>

              <View style={{ width: '100%' }}>
                <Text style={[styles.txt, { fontWeight: 'bold', fontSize: 18, marginTop: 30, marginLeft: 15 }]}>
                  Features
                </Text>
                <View style={{ alignItems: 'center', backgroundColor: 'white', marginTop: 15, padding: 10 }}>
                  {tagsSection}
                </View>
              </View>

            </View>
          </ScrollView>

        </BottomSheet>

      </SafeAreaView>
    </View>
  )
}

export default ProfileScreen

const styles = StyleSheet.create({
  txt: {
    color: 'black',
    fontSize: 15
  },
  showListButton: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    bottom: 15,
    right: 15,
    height: 50,
    width: 130,
    opacity: 0.8,
    padding: 5,
    borderRadius: 100,
    backgroundColor: '#3C99DC'
  },
  bathroomLocationButton: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    top: 15,
    right: 15,
    height: 50,
    width: 50,
    opacity: 0.8,
    padding: 5,
    borderRadius: 100,
    backgroundColor: 'gray'
  }
})

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import firestore from '@react-native-firebase/firestore'

import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Image
} from 'react-native'

import { ScrollView } from 'react-native-gesture-handler'

const ProfileScreen = ({ route }) => {
  // refs
  const bottomSheetRef = useRef(null)
  const mapViewRef = useRef(null)
  const [userReviews, setUserReviews] = useState()
  const uid = route.params?.uid // set userid, should not change

  const snapPoints = useMemo(() => ['30%', '60%', '85%'], [])

  // On initial render only, fetch all bathroom data
  useEffect(() => {
    fetchBathroomData(uid)
  }, [])

  // Fetch user's review data from firestore database
  const fetchBathroomData = async (uid) => {
    try {
      const doc = firestore().collection('reviews').where("uid", "==", uid) // get all of this user's reviews
      const snap = await doc.get()
      if (snap.exists) {
        setUserReviews(snap.data())
      }
    } catch (error) {
      console.log(error)
    }
  }

  console.log(userReviews)

  return (
    <View style={{ backgroundColor: 'white' }}>
      <SafeAreaView>
        <View style={{ alignItems: 'center' }}>
          <View style={{ height: '100%' }}>
            <Image // profile image
              style={{width: 160, height: 160, borderRadius: 100, borderWidth: 2, top: 100}}
              source={{ // source is user profile pic or the static google one
              uri: route.params?.photoURL || "https://lh3.googleusercontent.com/-XdUIqdMkCWA/AAAAAAAAAAI/AAAAAAAAAAA/4252rscbv5M/photo.jpg"
              }}>
            </Image>
          </View>

          {/* <FlatList
                              // Hprizontal tag filter list
                data={mTags}
                horizontal
                showsHorizontalScrollIndicator={false}
                renderItem={({ item, index }) => <TagItem tag={item} index={index} />}
                keyExtractor={item => item.key}
                style={{ width: '100%', height: 40, position: 'absolute', top: 108 }}
              /> */}
        </View>
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

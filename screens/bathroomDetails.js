import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import BottomSheet from '@gorhom/bottom-sheet'
import MapView, { Marker } from 'react-native-maps'
import firestore from '@react-native-firebase/firestore'
import auth from '@react-native-firebase/auth'
import { Input, Icon, AirbnbRating, Dialog } from '@rneui/themed'
import { tags } from '../modules/tags'
import DeviceInfo from 'react-native-device-info'
import { MapTypeDropdown } from '../modules/MapTypeDropdown'
import { getBathroomNameFromId, updateBathroomNameInReview } from '../modules/getAndSetBathroomNameFromId'

import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  Alert
} from 'react-native'

import { ScrollView } from 'react-native-gesture-handler'

const BathroomDetailsScreen = ({ route }) => {
  // refs
  const bottomSheetRef = useRef(null)
  const mapViewRef = useRef(null)
  const [desc, setDesc] = useState('')
  const [userReviews, setUserReviews] = useState([]) // State for storing user review elements
  const [reviews, setReviews] = useState([]) // State for storing actual user review data

  // sets display name, gets numbers from uid if anonymous
  const displayName = (route.params?.displayName || 'WePee User ' + route.params?.uid.replace(/\D/g, ''))

  const [bathroomData, setBathroomData] = useState()
  const [coordinate, setCoordinate] = useState({ latitude: 37.78825, longitude: -122.4324 })
  const [tagsSection, setTagsSection] = useState()

  const [showDialog, setShowDialog] = useState(false)
  // will be object {id: RatingIdInReviewsCollection, stars: Number}
  const [userRating, setUserRating] = useState()

  const [stars, setStars] = useState(3)
  const [dbDocument, setDbDocument] = useState()

  const snapPoints = useMemo(() => ['30%', '60%', '85%'], [])

  const [region, setRegion] = useState(route.params?.region)
  // State to store current mapType
  const [mapType, setMapType] = useState(route.params?.mapType)

  // Only on initial render, fetch necessary data
  useEffect(() => {
    fetchBathroomData(route.params?.bathroomId)
    fetchBathroomReviewData(route.params?.bathroomId)
    getUserRatingIfAny(route.params?.bathroomId)
    getUserId()
  }, [])

  // Update displayed reviews as they're updated
  useEffect(() => {
    if (reviews.length > 0) {
        displayUserReviews(reviews)
    }
  }, [reviews])

  // Fetch user's review data from firestore database
  const fetchBathroomReviewData = async (bathroomId) => {
    try {
      const snap = await firestore().collection('reviews').where('bathroom_id', '==', bathroomId).get()
      if (!snap.empty) {
        cleanupAndSetFirebaseUserReviews(snap.docs)
      } else {
        // setReviews(false)
      }
    } catch (error) {
      console.log(error)
    }
  }

  // cleans firebase reviews (metadata is removed)
  const cleanupAndSetFirebaseUserReviews = async (junkyArray) => {
    const cleanedData = await Promise.all(junkyArray.map(async (review) => {
      const { user_name, bathroom_name, bathroom_id, id, stars, description } = review._data
      let bath_name = bathroom_name
      let username = user_name
      if (!bath_name) { // if bathroom name is undefined
        bath_name = await getBathroomNameFromId(bathroom_id)
        await updateBathroomNameInReview(id, bath_name) // updates the bathroom's name in a review, if it isnt there
      }
      if (!username) {
        const randomNumber = Math.floor(Math.random() * 900) + 100
        username = 'WePee User ' + randomNumber
      }
      return { user_name: username, bath_name, id, bathroom_id, stars, description }
    }))
    setReviews(cleanedData)
    displayUserReviews(cleanedData)
  }

  // get uid
  // if no user uid = deviceId
  // get uid
  // if no user uid, then use uid = deviceId
  const getUserId = async () => {
    let uid = await DeviceInfo.getUniqueId()
    return new Promise(resolve => {
      if (auth().currentUser) uid = auth().currentUser.uid
      resolve(uid)
    })
  }

  const fetchBathroomData = async (bathroomId) => {
    try {
      const doc = firestore().collection('bathrooms').doc(bathroomId)
      setDbDocument(doc)
      const snap = await doc.get()
      if (snap.exists) {
        if (typeof snap.data().rating === 'number') setBathroomData({ ...snap.data(), rating: [0, 0, 0, 0, 0] })
        else setBathroomData(snap.data())
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

  const getUserRatingIfAny = async (bathroomId) => {
    try {
      const uid = await getUserId()
      const snap = await firestore().collection('reviews')
        .where('uid', '==', uid)
        .where('bathroom_id', '==', bathroomId)
        .get()
      if (!snap.empty && snap.docs.length > 0) {
        const data = await snap.docs[0].data()
        setUserRating(data)
        setStars(data.stars)
        setDesc(data.description || '')
      }
    } catch (error) {
      console.log(error)
    }
  }

  const getRating = function (data) {
    if (!data) {
      return 5
    }
    let totalSum = 0
    let numRatings = 0
    for (let i = 0; i < data.rating.length; i++) {
      totalSum += (i + 1) * data.rating[i]
      numRatings += data.rating[i]
    }
    return [(totalSum > 0 ? Number((totalSum / numRatings).toFixed(1)) : 0), numRatings]
  }

  // New data MUST be inserted in the order { user_name, bathroom_name, bathroom_id, id, stars, description } !!!!
  const updateRating = async () => {
    // update user previous rating if any
    // else save new rating into reviews collection
    if (userRating && (userRating.stars !== stars || userRating.desc !== desc)) { // if user rating exists and they've changed stars/desc
      bathroomData.rating[userRating.stars - 1]--
      await firestore().collection('reviews').doc(userRating.id).update({ stars, description: desc, user_name: displayName })
      setUserRating({...userRating, stars, description: desc })
      const updatedReviews = reviews.map(o => o.id === userRating.id ? { ...o, user_name: displayName, stars, description: desc } : o) // Update user reviews with updated rating/review
      setReviews(updatedReviews)
    } else {
      const id = firestore().collection('reviews').doc().id
      const uid = await getUserId()
      await firestore().collection('reviews').doc(id).set({
        uid,
        bathroom_id: route.params?.bathroomId,
        bathroom_name: route.params?.bathroomName, // now saves bathroom name, more efficient for profile page
        user_name: displayName, // Save the user name!
        description: desc,
        id,
        stars
      })
      setUserRating({ id, stars, description: desc })
      const reviewAdded = reviews.concat({
        user_name: displayName,
        bath_name: route.params?.bathroomName,
        bathroom_id: route.params?.bathroomId,
        description: desc,
        id,
        stars
      }) // Add new user review to current userReviews
      setReviews(reviewAdded)
    }

    bathroomData.rating[stars - 1]++
    await dbDocument.update({
      rating: bathroomData.rating
    })

    // dismiss the review dialog
    toggleDialog()

    // show alert on succesfull review
    Alert.alert(
      'Thank you!',
      'Your review has been saved',
      [
        {
          text: 'OK',
          style: 'cancel'
        }
      ]
    )
    console.log('rating updated!')
  }

  function displayUserReviews (reviewData) {
    const data = reviewData.map((review) => (
      <View key={review.id} style={[styles.userReview]}>
        <View style={{ flexDirection: 'row' }}>
          <Text style={[styles.txt, { fontSize: 19, fontWeight: 'bold' }]}>{review.user_name}</Text>
          <AirbnbRating
            isDisabled
            showRating={false}
            size={25}
            count={5}
            defaultRating={review.stars}
            ratingContainerStyle={{ marginTop: 0, marginLeft: 'auto' }}
          />
        </View>
        <View>
          <Text style={[styles.txt, { fontWeight: 'bold' }]}>Description: </Text>
          <Text style={[styles.txt]}>{review.description || 'No Review...'}</Text>
        </View>
      </View>
    ))

    // If a bathroom has no tags, just display "None!"
    if (data.length === 0) {
      setUserReviews(
        <View>
          <Text style={{ fontSize: 15, color: 'black' }}>None!</Text>
        </View>
      )
    } else {
      setUserReviews(data)
    }
  }

  function displayTags (bathroomData) {
    const data = tags
      .filter((tag) => bathroomData[tag.db_name])
      .map((tag) => (
        <View
          key={tag.key}
          style={{
            borderRadius: 20,
            elevation: 5,
            backgroundColor: 'white',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 8,
            marginLeft: 5,
            marginTop: 5
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Icon
              name={tag.icon}
              type={tag.iconType || 'font-awesome-5'}
              color='white'
              size={20}
              containerStyle={{
                width: 32,
                height: 32,
                backgroundColor: tag.iconColor,
                borderRadius: 5,
                padding: 5,
                justifyContent: 'center'
              }}
            />
            <Text
              style={{
                fontSize: 15,
                marginHorizontal: 10,
                color: 'black',
                fontWeight: 'bold'
              }}
            >
              {tag.name}
            </Text>
          </View>
        </View>
      ))

    // If a bathroom has no tags, just display "None!"
    if (data.length === 0) {
      setTagsSection(
        <View style={{}}>
          <Text style={{ fontSize: 15, color: 'black' }}>None!</Text>
        </View>
      )
    } else {
      setTagsSection(data)
    }
  }

  const toggleDialog = () => setShowDialog(!showDialog)

  // callbacks
  const handleSheetChanges = useCallback(index => {
    // console.log('handleSheetChanges', index);
  }, [])

  return (
    <View style={{ backgroundColor: 'white' }}>
      <SafeAreaView>
        <View style={{ height: '100%' }}>
          <MapView
            ref={mapViewRef}
            style={{ width: '100%', height: '100%' }}
            mapType={mapType.toLowerCase()}
            initialRegion={region}
            showsUserLocation
            showsMyLocationButton={false}
            region={region}
            onRegionChange={() => {}}
            onPress={() => { bottomSheetRef.current.close() }}
          >
            <Marker
              key={1}
              coordinate={coordinate}
              title={bathroomData?.name}
              description={bathroomData?.description}
            />
          </MapView>

          <MapTypeDropdown
            style={[styles.mapTypeDropdown, { width: 110 }]}
            mapType={mapType} setMapType={setMapType}
          />

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
          style={{ marginBottom: 0, backgroundColor: '#FAFAFA', color: '#FAFAFA' }}
          enablePanDownToClose
        >
          <ScrollView>
            <View style={{ flex: 1, alignItems: 'center', backgroundColor: '#FAFAFA' }}>
              <View style={{ width: '100%', alignItems: 'center', padding: 15 }}>
                <Text style={[styles.txt, { fontWeight: 'bold', fontSize: 23 }]}>
                  {bathroomData?.name}
                </Text>

                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
                  <Text style={[styles.txt]}>
                    {getRating(bathroomData)[0]}
                  </Text>

                  <AirbnbRating
                    isDisabled
                    showRating={false}
                    size={20}
                    count={5}
                    defaultRating={getRating(bathroomData)[0]}
                    ratingContainerStyle={{ marginTop: 0 }}
                  />

                  <Text style={[styles.txt]}>
                    ({getRating(bathroomData)[1]} reviews)
                  </Text>
                </View>

                <View style={{ flexDirection: 'column', marginTop: 12, marginRight: 'auto', marginLeft: 'auto' }}>
                  <Text style={{ fontSize: 10, color: 'black' }}>
                    Description:
                  </Text>
                  <Text style={[styles.txt]}>
                    {bathroomData?.description || 'No description :('}
                  </Text>
                </View>

                <TouchableOpacity style={[styles.leaveReview]} onPress={toggleDialog}>
                  <Text style={[styles.txt, { fontWeight: 'bold', fontSize: 15, color: '#3C99DC' }]}>
                    {userRating ? 'View/Edit Review' : 'Leave a Review'}
                  </Text>
                </TouchableOpacity>

                <Dialog
                  isVisible={showDialog}
                  onBackdropPress={toggleDialog}
                >

                  <View style={{ alignItems: 'center' }}>
                    <Dialog.Title title={userRating ? 'YOUR PREVIOUS REVIEW' : 'LEAVE REVIEW'} />
                    <Text style={[styles.txt, { fontSize: 20 }]}>
                      {userRating ? 'Edit Review' : 'Leave review'}
                    </Text>

                    <AirbnbRating
                      showRating
                      size={35}
                      count={5}
                      defaultRating={stars}
                      starContainerStyle={{ alignSelf: 'center' }}
                      ratingContainerStyle={{ marginBottom: 10 }}
                      onFinishRating={val => setStars(val)}
                    />

                    <Input
                      value={desc}
                      placeholder='Your review...'
                      onChangeText={val => setDesc(val)}
                      defaultValue={desc}
                      multiline
                      verticalAlign='top'
                      containerStyle={{ height: 120 }}
                      inputContainerStyle={{
                        backgroundColor: 'lightgrey',
                        height: '100%',
                        paddingHorizontal: 10,
                        paddingVertical: 5,
                        borderBottomColor: 'lightgrey',
                        borderRadius: 5
                      }}
                    />

                  </View>

                  <Dialog.Actions>
                    <Dialog.Button
                      title={userRating ? 'UPDATE' : 'CONFIRM'}
                      onPress={updateRating}
                    />
                    <Dialog.Button title='CANCEL' onPress={toggleDialog} />
                  </Dialog.Actions>
                </Dialog>

              </View>

              <View style={{ width: '100%' }}>
                <Text style={[styles.txt, { fontWeight: 'bold', fontSize: 18, marginLeft: 15, marginTop: 5 }]}>
                  Features:
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', marginTop: 5, marginLeft: 15 }}>
                  {tagsSection}
                </View>
              </View>

              <View style={{ width: '100%' }}>
                <Text style={[styles.txt, { fontWeight: 'bold', fontSize: 18, marginLeft: 15, marginTop: 5 }]}>
                  Reviews:
                </Text>

                <View>
                  {userReviews}
                </View>

              </View>

            </View>
          </ScrollView>

        </BottomSheet>

      </SafeAreaView>
    </View>
  )
}

export default BathroomDetailsScreen

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
  leaveReview: {
    height: 35,
    marginLeft: 20,
    marginRight: 20,
    borderRadius: 100,
    padding: 5,
    marginTop: 20,
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    elevation: 5
  },
  bathroomLocationButton: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    top: '1%',
    right: '1%',
    height: 50,
    width: 50,
    opacity: 0.8,
    padding: 5,
    borderRadius: 100,
    backgroundColor: 'gray'
  },
  mapTypeDropdown: {
    height: 36,
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    top: '1%',
    left: '1%',
    borderRadius: 100,
    backgroundColor: 'white',
    marginLeft: 3,
    marginRight: 3,
    elevation: 2
  },
  userReview: {
    width: '95%',
    marginLeft: 'auto',
    marginRight: 'auto',
    borderRadius: 5,
    backgroundColor: 'white',
    // flexDirection: 'row',
    padding: 10,
    marginVertical: 3,
    elevation: 1
  }
})

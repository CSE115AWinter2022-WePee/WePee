import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import firestore from '@react-native-firebase/firestore'
import { AirbnbRating } from '@rneui/themed'
import auth from '@react-native-firebase/auth'
import { getBathroomNameFromId, updateBathroomNameInReview } from '../modules/getAndSetBathroomNameFromId'

import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Image,
  ImageBackground,
  TouchableOpacity
} from 'react-native'

import {
  FlatList
} from 'react-native-gesture-handler'

const ProfileScreen = ({ navigation, route }) => {
  const [userReviews, setUserReviews] = useState()
  const [averageUserReview, setAverageUserReview] = useState()
  const [noReviews, setNoReviews] = useState()
  // sets display name, gets numbers from uid if anonymous
  const displayName = (route.params?.displayName || 'WePee User ' + route.params?.uid.replace(/\D/g, ''))
  const uid = route.params?.uid // set userid, should not change

  // On initial render only, fetch all bathroom data
  useEffect(() => {
    fetchBathroomData()
  }, [])

  // Update user's avergae reviews whenever userReviews changes
  useEffect(() => {
    calcAverageReview()
  }, [userReviews])

  // cleans firebase reviews (metadata is removed)
  const cleanupAndSetFirebaseUserReviews = async (junkyArray) => {
    const cleanedData = await Promise.all(junkyArray.map(async (review) => {
      const { bathroom_name, bathroom_id, id, stars, description } = review._data
      let name = bathroom_name
      if (!name) { // if bathroom name is undefined
        name = await getBathroomNameFromId(bathroom_id)
        await updateBathroomNameInReview(id, name) // updates the bathroom's name in a review, if it isnt there
      }
      return { name, id, bathroom_id, stars, description }
    }))
    setUserReviews(cleanedData)
    // console.log(cleanedData)
  }

  const calcAverageReview = () => {
    if (userReviews) {
      let totalStars = 0
      for (const review of userReviews) {
        totalStars += review.stars
      }

      setAverageUserReview((totalStars / userReviews.length).toFixed(1))
    }
  }

  // Fetch user's review data from firestore database
  const fetchBathroomData = async () => {
    try {
      const snap = await firestore().collection('reviews').where('uid', '==', uid).get()
      if (!snap.empty) {
        cleanupAndSetFirebaseUserReviews(snap.docs)
      } else {
        setNoReviews(true)
      }
    } catch (error) {
      console.log(error)
    }
  }

  const signInOutFunc = async () => {
    try {
      await auth().signOut()
      console.log('User signed out!')
    } catch (error) {
      console.log(error)
    }
  }

  const LogoutButton = () => (
    <TouchableOpacity
      onPress={signInOutFunc}
      style={[styles.logoutButton, { color: 'red' }]}
    >
      <Text style={[styles.txt, { color: 'white' }, { fontWeight: 'bold', fontSize: 18 }]}>
        {!route.params?.isAnonymous ? 'Log Out' : 'Log In'}
      </Text>
    </TouchableOpacity>
  )

  const ProfilePic = ({}) => {
    return (
      <Image
        style={[styles.profilePic]}
        source={{
          uri: route.params?.photoURL || 'https://lh3.googleusercontent.com/-XdUIqdMkCWA/AAAAAAAAAAI/AAAAAAAAAAA/4252rscbv5M/photo.jpg'
        }}
      />
    )
  }

  const DisplayName = ({}) => {
    return (
      <View style={[styles.displayName]}>
        <View>
          <Text style={[styles.txt, { fontSize: 18, fontWeight: 'bold' }]}>{displayName}</Text>
        </View>
      </View>
    )
  }

  const Spacer = ({}) => {
    return (
      <View
        style={{
          height: 30,
          top: 50,
          backgroundColor: 'blue'
        }}
      />
    )
  }

  const ReviewStats = () => {
    return (
      <View
        style={[styles.reviewStats]}
      >

        <View style={styles.stats}>
          <Text style={[styles.txt, { fontWeight: 'bold', marginBottom: 5 }]}>Reviews</Text>
          <Text style={[styles.txt, { fontWeight: 'bold', color: 'gray', fontSize: 16 }]}>{userReviews?.length || 'None!'}</Text>
        </View>

        <View style={{ height: '80%', width: 1, backgroundColor: 'gray' }} />

        <View style={styles.stats}>
          <Text style={[styles.txt, { fontWeight: 'bold', marginBottom: 5 }]}>Avg. Review</Text>
          <Text style={[styles.txt, { fontWeight: 'bold', color: 'gray', fontSize: 16 }]}>{averageUserReview ? averageUserReview + ' / 5' : 'None!'}</Text>
        </View>

        <View style={{ height: '80%', width: 1, backgroundColor: 'gray' }} />

        <View style={styles.stats}>
          <Text style={[styles.txt, { fontWeight: 'bold', marginBottom: 5 }]}>Days Peeing</Text>
          <Text style={[styles.txt, { fontWeight: 'bold', color: 'gray', fontSize: 16 }]}>{route.params?.daysInApp.toFixed(0) || 'None!'}</Text>
        </View>

      </View>
    )
  }

  const HeadView = () => {
    return (
      <>
        <ProfilePic />
        <DisplayName />
        <ReviewStats />
      </>

    )
  }

  const Item = ({ item }) => {
    switch (item.id) {
      case 'profilePic':
        return <ProfilePic />
      case 'displayName':
        return <DisplayName />
      case 'logoutButton':
        return <LogoutButton />
      case 'spacer':
        return <Spacer />
      case 'reviewStats':
        return <ReviewStats />
      default: // default is a user review
        return (
          <TouchableOpacity
            style={[styles.userReview]}
            onPress={() => navigation.navigate('Details', { bathroomId: item.bathroom_id, bathroomName: item.bathroom_name, uid: route.params?.uid, region: route.params?.region, mapType: route.params?.mapType })}
          >
            <View style={{ flexDirection: 'row' }}>
              <Text style={[styles.txt, { fontSize: 19, fontWeight: 'bold' }]}>{item.name}</Text>
              <AirbnbRating
                isDisabled
                showRating={false}
                size={25}
                count={5}
                defaultRating={item.stars}
                ratingContainerStyle={{ marginTop: 0, marginLeft: 'auto' }}
              />
            </View>

            <View>
              <Text style={[styles.txt, { fontWeight: 'bold' }]}>Description: </Text>
              <Text style={[styles.txt]}>{item.description || 'No Review...'}</Text>
            </View>
          </TouchableOpacity>
        )
    }
  }

  // Loading screen
  if (!averageUserReview && !route.params?.isAnonymous && !noReviews) {
    return (
      <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <ImageBackground
          source={require('../assets/wepee.png')}
          style={{ opacity: 0.7 }}
        >
          <View style={{ justifyContent: 'center', alignItems: 'center', height: 150, width: 150 }}>
            <Text style={{ fontSize: 30, fontWeight: 'bold', color: '#3C99DC', opacity: 1 }}>
              WePee
            </Text>
          </View>
        </ImageBackground>
        <Text style={{ color: 'black' }}>
          Loading profile data...
        </Text>
      </View>

    )
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, alignItems: 'center', padding: 0 }}>
        <FlatList
          data={userReviews || []}
          renderItem={({ item, index }) => <Item item={item} index={index} />}
          ListHeaderComponent={HeadView}
          keyExtractor={item => item.id}
          horizontal={false}
          style={{ width: '100%', marginBottom: 60 }}
          showsVerticalScrollIndicator={false}
        />

        <TouchableOpacity
          onPress={signInOutFunc}
          style={[styles.logoutButton, { color: 'red' }]}
        >
          <Text style={[styles.txt, { color: 'white' }, { fontWeight: 'bold', fontSize: 18 }]}>
            {!route.params?.isAnonymous ? 'Log Out' : 'Log In'}
          </Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  )
}

export default ProfileScreen

const styles = StyleSheet.create({
  txt: {
    color: 'black',
    fontSize: 15
  },
  displayName: {
    width: '100%',
    marginTop: 15,
    // marginBottom: 5,
    alignItems: 'center'
  },
  reviewStats: {
    height: 60,
    marginLeft: 10,
    marginRight: 10,
    borderRadius: 5,
    marginBottom: 50,
    top: 20,
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    elevation: 2
  },
  stats: {
    justifyContent: 'center',
    marginLeft: 10,
    marginRight: 10,
    alignItems: 'center'
  },
  spacer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    width: 10,
    backgroundColor: '#3C99DC'
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
  },
  logoutButton: {
    position: 'absolute',
    width: '90%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 'auto',
    backgroundColor: '#3C99DC',
    padding: 8,
    borderRadius: 10,
    bottom: 5
  },
  profilePic: {
    width: 120,
    height: 120,
    borderRadius: 100,
    borderColor: 'white',
    borderWidth: 1,
    flexDirection: 'row',
    marginTop: 15,
    marginLeft: 'auto',
    marginRight: 'auto'
  }
})

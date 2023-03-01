import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import firestore from '@react-native-firebase/firestore'
import { AirbnbRating } from '@rneui/themed'
import auth from '@react-native-firebase/auth'
import { genericFlatListSeparator } from '../modules/flatListSeparator'

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

const ProfileScreen = ({ route }) => {
  const [userReviews, setUserReviews] = useState()
  const [averageUserReview, setAverageUserReview] = useState()
  const [noReviews, setNoReviews] = useState()
  const uid = route.params?.uid // set userid, should not change

  // On initial render only, fetch all bathroom data
  useEffect(() => {
    fetchBathroomData()
  }, [])

  // Update user's avergae reviews whenever userReviews changes
  useEffect(() => {
    calcAverageReview()
  }, [userReviews])

  // Grabs a bathroom's name given a bathroom_id
  const getBathroomNameFromId = async (bathroom_id) => {
    try {
      const snap = await firestore().collection('bathrooms')
                          .where("id", "==", bathroom_id)
                          .get()
      if (!snap.empty) {
          return(snap.docs[0].data().name);
      }
    } catch (error) {
        console.log(error)
    }
  }


  // Updates name field in a review
  const updateBathroomNameInReview = async (review_id, name) => {
    try {
      await firestore().collection('reviews').doc(review_id).update({bathroom_name: name}); // update with name if it wasnt there
    } catch (error) {
        console.log(error)
    }
  }

  const cleanupAndSetFirebaseUserReviews = async (junkyArray) => {
    const cleanedData = await Promise.all(junkyArray.map(async (review) => {
      const { bathroom_name, bathroom_id, id, stars } = review._data;
      let name = bathroom_name;
      let key = id;
      if (!name) { // if bathroom name is undefined
        name = await getBathroomNameFromId(bathroom_id);
        await updateBathroomNameInReview(id, name);  // updates the bathroom's name in a review, if it isnt there
      }
      return { key, name, id, bathroom_id, stars };
    }));
    setUserReviews(cleanedData);
    console.log(cleanedData)
  }

  const calcAverageReview = () => {
    if(userReviews){
      let totalStars = 0;
      for(const review of userReviews){
        totalStars += review.stars;
      }

      setAverageUserReview((totalStars/userReviews.length).toFixed(1))
    }
  }

  // Fetch user's review data from firestore database
  const fetchBathroomData = async () => {
    try {
      const snap = await firestore().collection('reviews').where("uid", "==", uid).get()
      if (!snap.empty) {
        cleanupAndSetFirebaseUserReviews(snap.docs)
      } else {
        setNoReviews(true)
      }

    } catch (error) {
      console.log(error)
    }
  }

  const LogoutButton = () => {
    return (<TouchableOpacity
                  onPress={() => auth()
                    .signOut()
                    .then(() => console.log('User signed out!'))}
                  style= {[styles.logoutButton, {color: 'red'}]}
                >
                  <Text style={[styles.txt, {color: 'white'}, {fontWeight: 'bold'}]}>Log Out</Text>
                </TouchableOpacity>)
  }

  const ProfilePic = ({}) => {
    return (
      <Image
        style={{ width: 160, height: 160, borderRadius: 100, flexDirection:'row', marginTop: 40, marginLeft:'auto', marginRight: 'auto'}}
        source={{
          uri: route.params?.photoURL || "https://lh3.googleusercontent.com/-XdUIqdMkCWA/AAAAAAAAAAI/AAAAAAAAAAA/4252rscbv5M/photo.jpg",
        }}
      />
    );
  };

  const Spacer = ({}) => {
    return (
      <View
        style={{
          height: 30,
          top: 50,
          backgroundColor: 'blue',
        }}
      />
    );
  }

  const ReviewStats = () => {
    return (
      <View
        style={{
          height: 60,
          marginLeft: 20,
          marginRight: 20,
          borderRadius: 100,
          marginBottom: 70,
          top: 50,
          backgroundColor: 'lightgray',
          flexDirection: 'row',
          alignItems: "center",
          justifyContent: "space-evenly",
        }}
      >
        <View style={{flexDirection: "column", justifyContent: "center", marginLeft: 10, marginRight: 10, alignItems: "center"}}>
          <Text style={[styles.txt, {fontWeight: 'bold'}]}>Reviews:</Text>
          <Text style={[styles.txt, {fontWeight: 'bold'}]}>{userReviews?.length || "None!"}</Text>
        </View>

        <View style={{height: '80%', width: 1, backgroundColor: 'gray'}} />

        <View style={{flexDirection: "column", justifyContent: "center", marginLeft: 10, marginRight: 10, alignItems: "center"}}>
          <Text style={[styles.txt, {fontWeight: 'bold'}]}>Avg. Review:</Text>
          <Text style={[styles.txt, {fontWeight: 'bold'}]}>{averageUserReview? averageUserReview + "/5": "None!" }</Text>
        </View>

        <View style={{height: '80%', width: 1, backgroundColor: 'gray'}} />

        <View style={{flexDirection: "column", justifyContent: "center", marginLeft: 10, marginRight: 10, alignItems: "center"}}>
          <Text style={[styles.txt, {fontWeight: 'bold'}]}>Days Peeing:</Text>
          <Text style={[styles.txt, {fontWeight: 'bold'}]}>{route.params?.daysInApp.toFixed(0) || "None!"}</Text>
        </View>
      </View>
    );
  }

  const wholePage = [
    {
      key: 0,
      id: "logoutButton"
    },
    {
      key: 1,
      id: "profilePic"
    },
    {
      key: 2,
      id: "reviewStats"
    },
    ...(userReviews ? userReviews : [])
            ]


  const Item = ({item}) => {
    switch (item.id) {
      case "profilePic":
        return <ProfilePic />;
      case "logoutButton":
        return <LogoutButton />;
      case "spacer":
        return <Spacer />;
      case "reviewStats":
        return <ReviewStats />;
      default: // default is a user review
        return (
          <View style={{
            width: '100%',
            backgroundColor: 'white',
            flexDirection: 'row',
            padding: 10,
            marginVertical: 5
          }}>
            <View>
              <Text style={[styles.txt, { fontSize: 18, fontWeight: 'bold' }]}>{item.name}</Text>
              <Text style={[styles.txt, {marginLeft: 15}]}>Your rating: </Text>
            </View>
            <AirbnbRating 
              isDisabled={true} 
              showRating={false}
              size={25}
              count={5}
              defaultRating={item.stars} 
              ratingContainerStyle={{ marginTop:0, marginLeft: 'auto'}}/>
          </View>
        );
    }
  }

  // Loading screen
  if(!averageUserReview && !route.params?.isAnonymous && !noReviews){
      return (
        <View style={{flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
          <ImageBackground
            source={require('../assets/wepee.png')}
            style={{opacity: .7}}>
            <View style={{justifyContent: 'center',alignItems:'center', height: 150, width: 150}}>
              <Text style={{ fontSize: 30, fontWeight: 'bold', color: '#3C99DC', opacity: 1}}>
                  WePee
              </Text>
            </View>
          </ImageBackground>
          <Text style={{color: 'black'}}>
            Loading profile data...
          </Text>
        </View>
        
      )
  }
  return (
    <SafeAreaView style={{flex: 1}}>
      <View style={{ flex: 1, alignItems: 'center', padding: 0 }}>
        <FlatList
          data={wholePage}
          renderItem={({ item }) => <Item item={item} />}
          keyExtractor={item => item.key}
          horizontal = {false}
          style={{width: '100%', marginBottom: 20}}
          showsVerticalScrollIndicator={false}
        />
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
  spacer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    width: 10,
    backgroundColor: '#3C99DC'
  },
  logoutButton: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 'auto',
    backgroundColor:'#3C99DC',
    padding: 8,
    borderBottomLeftRadius: 8
  }
})

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import firestore from '@react-native-firebase/firestore'

import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Image
} from 'react-native'

import {
  FlatList
} from 'react-native-gesture-handler'

const ProfileScreen = ({ route }) => {
  const [userReviews, setUserReviews] = useState()
  const uid = route.params?.uid // set userid, should not change

  // On initial render only, fetch all bathroom data
  useEffect(() => {
    fetchBathroomData()
  }, [])

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
      if (!name) { // if bathroom name is undefined
        name = await getBathroomNameFromId(bathroom_id);
        await updateBathroomNameInReview(id, name);  // updates the bathroom's name in a review, if it isnt there
      }
      return { name, id, bathroom_id, stars };
    }));
    setUserReviews(cleanedData);
  }
  // Fetch user's review data from firestore database
  const fetchBathroomData = async () => {
    try {
      const snap = await firestore().collection('reviews').where("uid", "==", uid).get()
      if (!snap.empty) {
        //console.log("cleanedUp snap.docs: " + cleanupFirebaseUserReviews(snap.docs))
        //console.log("cleanedUp snap.docs: " + JSON.stringify(cleanupFirebaseUserReviews(snap.docs)));
        //setUserReviews(snap.docs)
        cleanupAndSetFirebaseUserReviews(snap.docs)
      }

    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    console.log(userReviews)
  }, [userReviews])

  const ProfilePic = ({}) => {
    return (
      <Image
        style={{ width: 160, height: 160, borderRadius: 100, borderWidth: 2, top: 40 }}
        source={{
          uri: route.params?.photoURL || "https://lh3.googleusercontent.com/-XdUIqdMkCWA/AAAAAAAAAAI/AAAAAAAAAAA/4252rscbv5M/photo.jpg",
        }}
      />
    );
  };

  const wholePage = [
    {
      key: 0,
      id: "profilePic"
    },
    {
      key: 1,
      id: "profilePic"
    },
    {
      key: 2,
      id: "profilePic"
    },
    {
      key: 3,
      id: "profilePic"
    },
    {
      key: 4,
      id: "profilePic"
    },
    {
      key: 5,
      id: "profilePic"
    },
    {
      key: 6,
      id: "profilePic"
    },
    //...userReviews
            ]

  const Item =({item}) => {
    switch (item.id) {
      case "profilePic":
        return <ProfilePic />;
      default:
        return (
          <View>
            <Text>{item?.text || "not found"}</Text>
            <Text>{`Rating: ${item?.rating || "none"}/5`}</Text>
          </View>
        );
    }
  }

  return (
    <View style={{ backgroundColor: 'white' }}>
      <SafeAreaView>
        <View style={{ alignItems: 'center' }}>
          <FlatList
              data={wholePage}
              renderItem={({ item }) => <Item item={item} />}
              keyExtractor={item => item.key}
              style={{height: '100%', position: 'absolute'}}
              showsVerticalScrollIndicator={false}
            />
          <View style={{ height: '100%' }}>
            
          </View>
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

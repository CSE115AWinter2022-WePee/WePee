
import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import MapView, { Marker } from 'react-native-maps'
import BottomSheet from '@gorhom/bottom-sheet'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { lightColors, SearchBar, Icon } from '@rneui/themed'
import { getCurrentLocation } from '../modules/getLocation'
import firestore from '@react-native-firebase/firestore'
import auth from '@react-native-firebase/auth'
import { tags } from '../modules/tags'

import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity
} from 'react-native'

import {
  FlatList
} from 'react-native-gesture-handler'
import { Button } from '@rneui/base'

const Mapview = ({ navigation, route }) => {
  // state to hold location, default is false. setCoordinate(a) sets `coordinate` to `a`
  const [coordinate, setCoordinate] = useState()
  // state for search text in search box
  const [searchTxt, setSearchTxt] = useState('')
  // state to hold all bathrooms loaded from database
  const [allBathrooms, setAllBathrooms] = useState([])
  // state to hold filtered bathrooms
  const [bathrooms, setBathrooms] = useState([])
  // Ref to hold reference to `bottomSheet` element that liosts all the bathrooms in the mapview
  const bottomSheetRef = useRef(null)
  // Ref to hold mapview element reference
  const mapViewRef = useRef(null)

  // States to determine if tag is active or not
  const [cleanliness, setCleanliness] = useState(false)
  const [free, setFree] = useState(false)
  const [accessibility, setAccessibility] = useState(false)
  const [changingStation, setChangingStation] = useState(false)
  const [condomsSale, setCondomsSale] = useState(false)
  const [periodProducts, setPeriodProducts] = useState(false)
  const [unisex, setUnisex] = useState(false)
  const [urinal, setUrinal] = useState(false)

  // bottom sheet snap points
  const snapPoints = useMemo(() => ['30%', '60%'], [])

  // set map default region state variable
  const [region, setRegion] = useState(null)

  // states to hold when app data fully fetched on initial render
  const [located, setLocated] = useState(false)
  const [loaded, setLoaded] = useState(false)

  // Copy tags and add states
  const mTags = [
    {
      ...tags[0],
      state: [cleanliness, setCleanliness]
    },
    {
      ...tags[1],
      state: [free, setFree]
    },
    {
      ...tags[2],
      state: [accessibility, setAccessibility]
    },
    {
      ...tags[3],
      state: [changingStation, setChangingStation]

    },
    {
      ...tags[4],
      state: [condomsSale, setCondomsSale]
    },
    {
      ...tags[5],
      state: [periodProducts, setPeriodProducts]
    },
    {
      ...tags[6],
      state: [unisex, setUnisex]

    },
    {
      ...tags[7],
      state: [urinal, setUrinal]
    }

  ]

  // Upon any changes to `route.params` (parameters passed in navigation route) and upon initial render,
  // call _getLocation(), to have it set location and region state vars
  // and fetch bathroom data from database
  useEffect(() => {
    _getLocation()
    fetchBathrooms()
  }, [route.params])

  // Grab bathrooms from database
  const fetchBathrooms = async () => {
    try {
      const snap = await firestore().collection('bathrooms').get()
      if (!snap.empty) {
        setBathrooms(snap.docs)
        setAllBathrooms(snap.docs)
        setLoaded(true)
      }
    } catch (error) {
      console.log(error)
    }
  }

  // Separates the flatList, is a single pixel line
  const flatListSeparator = () => (<View
    style={{
      height: 1,
      backgroundColor: '#CED0CE',
      marginLeft: '5%',
      marginRight: '5%'
    }}
                                   />
  )

  // Msthod to fetch current user location
  // and cache the current user location
  const _getLocation = () => {
    getCurrentLocation()
      .then(({ coordinates, region }) => {
        setCoordinate(coordinates)
        setRegion(region)
        // cache location data
        AsyncStorage.setItem('coordinates', JSON.stringify(coordinates))
        AsyncStorage.setItem('region', JSON.stringify(region))
        setLocated(true)
      })
      .catch(message => console.log(message))
  }

  // Runs when a tag is pressed
  const onTagPress = (tag, index) => {
    console.log('called onTag pressed')
    const newState = !tag.state[0]
    // Change the tags state
    tag.state[1](newState)

    // If no tags selected update bathrooms else run filter func with selected tags
    const searchedTags = getSelectedTags(tag, newState)
    searchedTags.length === 0 ? setBathrooms(allBathrooms) : filterBathrooms(searchedTags)
  }

  const getSelectedTags = (tag, add) => {
    // get previously selected tags
    const data = mTags.filter(tag => {
      if (tag.state[0]) return tag
      else return false
    })

    // check if current selected shoud be added to previously selected tags
    add ? data.push(tag) : data.splice(data.indexOf(tag), 1)

    console.log('selected tags ', JSON.stringify(data))
    return data
  }

  // Filters bathrooms/changes the `bathrooms` state variable based on the tags in searchedTags
  const filterBathrooms = (searchedTags) => {
    const newBathrooms = []

    // runs for every bathroom, checking their qualities against the tags
    for (const bath of allBathrooms) {
      let hasAllTags = true
      for (const tag of searchedTags) { // for each tag
        if (bath.data()[tag.db_name] !== true) {
          // don't add bathroom
          hasAllTags = false
          break
        }
      }

      // if the bath has all the tags, add it
      if (hasAllTags) {
        newBathrooms.push(bath)
      }
    }

    // set bathrooms state, triggers rerender of markers and flatlist
    setBathrooms(newBathrooms)
  }

  // Searches case-insensitively through bathroom names for search text `txt` appaearing anywhere in the bathroom name
  function updateSearchFunc (txt) {
    setSearchTxt(txt)
    setBathrooms(allBathrooms.filter(e => txt.length > 0 ? RegExp(txt.toLowerCase()).test(e.data().name.toLowerCase()) : true))
  }

  // Runs when goToUser button is pressed
  const goToUser = async () => {
    await _getLocation() // update user location
    mapViewRef.current.animateToRegion(region, 1000)
  }

  // Placehplder for handling stylesheet changes
  const handleSheetChanges = useCallback(index => {
    // console.log('handleSheetChanges', index);
  }, [])

  // Create map markers for bathrooms with valid longitude && latitude data
  const bathroomMarkers = bathrooms
    .filter(snap => snap.data().latitude && snap.data().longitude)
    .map(snap => (
      <Marker
        key={snap.id}
        coordinate={{
          latitude: snap.data().latitude,
          longitude: snap.data().longitude
        }}
        title={snap.data().name || ''}
        description={snap.data().description || ''}
      />
    ))

  // 1º lat ~ 69 mi
  // 1º long ~ 54.6 mi
  // at 38º N latitude (Stockton, CA)
  // https://www.usgs.gov/faqs/how-much-distance-does-degree-minute-and-second-cover-your-maps#:~:text=One%2Ddegree%20of%20longitude%20equals,one%20second%20equals%2080%20feet.
  // Computes the stright line distance to bathroom, and rounds to 2 decimal places using the method detailed above
  const getDistance = (latitude, longitude) => {
    return ((((coordinate.latitude - latitude) * 69) ** 2 + ((coordinate.longitude - longitude) * 54.6) ** 2) ** 0.5).toFixed(2)
  }

  // Custom component for each bathroom list item
  // in the bathroom list (bottomSheet)
  const Item = ({ props, index, id }) => (
    <TouchableOpacity
      style={{
        width: '100%',
        backgroundColor: 'white',
        justifyContent: 'center',
        padding: 10,
        marginVertical: 5
      }}
      onPress={() => navigation.navigate('Details', { bathroomId: id, region, uid: route.params?.uid })}
    >
      <View style={{ flex: 1, alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={[styles.txt, { fontSize: 16, fontWeight: 'bold' }]}>{props.name}</Text>
        <Text style={[styles.txt]}>{getDistance(props.latitude, props.longitude)} mi.</Text>
      </View>
    </TouchableOpacity>
  )

  // Custom component for each tag filter
  const TagItem = ({ tag, index }) => (
    <View key={tag.key}>
      <TouchableOpacity
        onPress={() => onTagPress(tag, index)}
        style={tag.state[0] ? styles.tagButtonPressed : styles.tagButtonNotPressed}
      >
        <Icon
          name={tag.icon}
          type={tag.iconType || 'font-awesome-5'}
          color='white'
          size={10}
          containerStyle={{
            width: 15,
            height: 15,
            backgroundColor: tag.iconColor,
            borderRadius: 3,
            padding: 0,
            marginRight: 4,
            justifyContent: 'center'
          }}
        />
        <Text style={styles.tagButtonText}>{tag.name}</Text>
      </TouchableOpacity>
    </View>
  )

  // Render loading text while no user location available,
  // otherwise render the default mapview with the current user location and all UI componenents
  if (!located || !loaded) {
    return (
      <Text>
        Loading current user location...
      </Text>
    )
  }
  return (
    <View style={{ backgroundColor: 'white' }}>
      <SafeAreaView>
        <View style={{ height: '100%' }}>

          <View style={{ alignItems: 'center' }}>

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 30, fontWeight: 'bold', color: '#3C99DC' }}>
                WePee
              </Text>
              <View style={styles.logoutButton}>
                <Button
                  onPress={() => auth()
                    .signOut()
                    .then(() => console.log('User signed out!'))}
                  title='Logout'
                />
              </View>
            </View>

            <View style={{
              height: 60,
              flexDirection: 'row',
              justifyContent: 'flex-start',
              alignItems: 'center',
              marginLeft: 6,
              marginRight: 10
            }}
            >
              {/* <TouchableOpacity style={{width:40, height:40, borderRadius:20, justifyContent:'center'}} onPress={() => dougsTestFunc()}>
                                <Icon name='sliders' type='font-awesome' size={25} color='darkgray' />
                            </TouchableOpacity> */}
              <SearchBar
                placeholder='Looking for a bathroom?'
                onChangeText={updateSearchFunc}
                showCancel
                style={{ color: 'black', fontSize: 16, fontWeight: 'bold' }}
                inputContainerStyle={{ borderRadius: 23 }}
                containerStyle={{ flex: 1, backgroundColor: lightColors.white, borderTopColor: 'white' }}
                value={searchTxt}
              />

              <TouchableOpacity style={{ width: 40, height: 40, borderRadius: 20, justifyContent: 'center' }} onPress={() => navigation.navigate('Add', { region })}>
                <Icon name='plus' type='font-awesome' size={20} color='#3C99DC' />
              </TouchableOpacity>

            </View>

            <MapView
              style={{ width: '100%', height: '100%' }}
              ref={mapViewRef}
              mapType='standard'
              initialRegion={region}
              showsUserLocation
              showsMyLocationButton={false}
              region={region}
              onPress={() => { bottomSheetRef.current.close() }}
              onRegionChange={() => {}}
            >
              {bathroomMarkers}
            </MapView>

            <FlatList
                            // Hprizontal tag filter list
              data={mTags}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={({ item, index }) => <TagItem tag={item} index={index} />}
              keyExtractor={item => item.key}
              style={{ width: '100%', height: 40, position: 'absolute', top: 108 }}
            />

            <TouchableOpacity // Show list button
              onPress={() => bottomSheetRef.current.snapToIndex(0)}
              style={styles.showListButton}
            >

              <Icon name='list' type='material' size={30} color='white' containerStyle={{ marginRight: 3 }} />
              <Text style={{ fontSize: 14, fontWeight: 'bold', color: 'white' }}>View List</Text>
            </TouchableOpacity>

            <TouchableOpacity
                            // Animate to user button
              onPress={() => { goToUser() }}
              style={styles.userLocationButton}
            >
              <Icon name='person-pin' type='material' size={40} color='lightblue' />
            </TouchableOpacity>

          </View>

        </View>

        <BottomSheet
                    // Bathrooms list
          ref={bottomSheetRef}
          index={0}
          snapPoints={snapPoints}
          onChange={handleSheetChanges}
          enablePanDownToClose
        >
          <View style={{ flex: 1, alignItems: 'center', padding: 0 }}>
            <FlatList
              data={bathrooms}
              ItemSeparatorComponent={flatListSeparator}
              renderItem={({ item, index }) => <Item props={item.data()} index={index} id={item.id} />}
              keyExtractor={item => item.id}
              style={{ width: '100%', marginBottom: 20 }}
            />
          </View>
        </BottomSheet>

      </SafeAreaView>

    </View>

  )
}

export default Mapview

// Define styles for rendered componenets
// Styes reference: https://stackoverflow.com/a/34317028
const styles = StyleSheet.create({
  txt: {
    fontSize: 14,
    color: 'black'
  },
  tagButtonNotPressed: {
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 100,
    backgroundColor: 'white',
    marginLeft: 3,
    marginRight: 3
  },
  tagButtonPressed: {
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 100,
    backgroundColor: 'gray',
    marginLeft: 3,
    marginRight: 3
  },
  tagButtonText: {
    color: 'black'
    // fontWeight: 'bold',
    // lineHeight: 15,
  },
  showListButton: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    bottom: 115,
    right: 15,
    height: 50,
    width: 130,
    opacity: 0.8,
    padding: 5,
    borderRadius: 100,
    backgroundColor: '#3C99DC'
  },
  userLocationButton: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    top: 156,
    right: 15,
    height: 50,
    width: 50,
    opacity: 0.8,
    padding: 5,
    borderRadius: 100,
    backgroundColor: 'gray'
  },
  logoutButton: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 50
  }
})

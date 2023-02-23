import firestore from '@react-native-firebase/firestore'

firestore()
  .collection('bathrooms')
  .get()
  .then(querySnapshot => {
    // console.log('Total users: ', querySnapshot.size);

    querySnapshot.forEach(documentSnapshot => {
      // console.log('User ID: ', documentSnapshot.id, documentSnapshot.data());
    })
  })
// console.log(usersCollection);

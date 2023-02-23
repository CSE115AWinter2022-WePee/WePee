import auth from '@react-native-firebase/auth';
import { GoogleSignin} from '@react-native-google-signin/google-signin';
GoogleSignin.configure({
    webClientId: "334150569935-5en1jop1li7gdod5q6ninn8d49esptbs.apps.googleusercontent.com"
});


export const anonymousLogin = () => {
    auth()
    .signInAnonymously()
    .then(() => {
        console.log('User signed in anonymously');
    })
    .catch(error => {
        if (error.code === 'auth/operation-not-allowed') {
            console.log('Enable anonymous in your firebase console.');
        }
        console.error(error);
    });
}

// Somewhere in your code
export async function onGoogleButtonPress() {
    // Check if your device supports Google Play
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    // Get the users ID token
    const { idToken } = await GoogleSignin.signIn();
  
    // Create a Google credential with the token
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);
  
    // Sign-in the user with the credential
    return auth().signInWithCredential(googleCredential);
  }
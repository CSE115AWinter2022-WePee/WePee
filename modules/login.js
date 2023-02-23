import auth from '@react-native-firebase/auth';

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
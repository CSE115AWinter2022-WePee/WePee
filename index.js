/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import Mapview from './screens/mapview';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => Mapview);

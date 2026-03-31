/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { getMessaging } from '@react-native-firebase/messaging';
import { Provider } from "react-redux";
import { store } from './src/store/store';

getMessaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('Background message:', remoteMessage);
});

const RNRedux = () => (
    <Provider store={store}>
        <App />
    </Provider>
)
AppRegistry.registerComponent(appName, () => RNRedux);

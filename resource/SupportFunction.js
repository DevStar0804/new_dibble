import {
  apiUrl,
  key_recent_search,
  key_screen_comeback,
  LandingScreenName,
  rc_success,
  rc_token_expire,
  rq_get_product,
} from './BaseValue';
import AsyncStorage from '@react-native-community/async-storage';
import NetInfo from '@react-native-community/netinfo';
import getLanguage from './LanguageSupport';
import moment from 'moment';

export function makeAPostRequest(
  requestObject,
  showLoadingBarFunction,
  closeLoadingBarFunction,
  callback,
) {
  showLoadingBarFunction();
  console.log(requestObject);
  NetInfo.fetch().then((state) => {
    console.log('Connection type', state.type);
    console.log('Is connected?', state.isConnected);
    if (state.isConnected) {
      fetch(apiUrl, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestObject),
      })
        .then((response) => response.json())
        .then((responseJson) => {
          console.log(responseJson);
          closeLoadingBarFunction();
          if (responseJson.rc == rc_success) {
            callback(true, responseJson);
          } else if (responseJson.rc == rc_token_expire) {
            callback(false, rc_token_expire);
          } else {
            callback(false, responseJson.message);
          }
        })
        .catch((error) => {
          console.log(error);
          closeLoadingBarFunction();
          callback(false, String.valueOf(error));
        });
    } else {
      closeLoadingBarFunction();
      alert(getLanguage().networkError);
    }
  });
}

export function getTimeDiff (momentCurrent, momentInFuture, timeSourceFormat) {
  var ms = moment(momentInFuture,timeSourceFormat).diff(moment(momentCurrent,timeSourceFormat));
  let returnString = "";
  if (ms <= 0) {
    return "00:00";
  } else {
    var d = moment.duration(ms);
    if (d.asHours() > 24) {
      returnString = Math.floor(d.asHours()).toFixed(0)+ ":" + moment(ms).format("mm");
    } else {
      returnString = moment(ms).format("HH:mm");
    }
  }
  console.log(returnString);
   return returnString;
}

export function savePreviousScreen(screenName) {
  AsyncStorage.setItem(key_screen_comeback, screenName);
}

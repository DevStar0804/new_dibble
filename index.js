/**
 * @format
 */

import {
  AppRegistry,
  I18nManager,
  Platform,
  SafeAreaView,
  Animated,
  StatusBar,
} from 'react-native';
import * as React from 'react';
import {name as appName} from './app.json';
import 'react-native-gesture-handler';
import {
  SplashScreenName,
  CategoryScreenName,
  SearchResultScreenName,
  ProductDetailScreenName,
  LandingScreenName,
  PhoneInputScreenName,
  PhoneRegistrationScreenName,
  SmsVerificationScreenName,
  isForceRTL,
  OrderSummaryScreenName,
  CategoriesListScreenName,
  ShippingInfoScreenName,
  MyAddressesScreenName,
  MainScreenName,
  WebviewScreenName,
  MainAppName,
  RecentSearchScreenName,
  MyCartScreenName,
  LandingStackName,
  LandingPhoneInputScreenName,
  DefaultErrorDialogName,
  AddCardScreenName,
  OrderHistoryScreenName,
  OrderDetailsScreenName,
  PersonalZoneScreenName,
  key_restart_for_rtl,
  AddAddressesScreenName,
  SettingScreenName,
  PaymentMethodScreenName,
  c_status_bar_background,
  EmailValidateScreenName,
  ActiveOrderDetailsScreenName,
  ActiveOrderFeedbackScreenName,
  BlankScreenName,
  pn_updateOrderStatus,
  key_screen_should_open,
} from './resource/BaseValue';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import MySplashScreen from './screen/ScreenSpash';
import CategoryScreen from './screen/ScreenCategory';
import SearchResultScreen from './screen/ScreenSearchResult';
import ProductDetailScreen from './screen/ScreenProductDetail';
import LandingScreen from './screen/ScreenLanding';
import PhoneInputScreen from './screen/ScreenPhoneInput';
import PhoneRegistrationScreen from './screen/ScreenPhoneRegistration';
import SmsVerificationScreen from './screen/ScreenSmsVerification';
import OrderSummaryScreen from './screen/ScreenOrderSummary';
import FooterBar from './screen/FooterBar';
import CategoriesListScreen from './screen/ScreenCategoriesList';
import ShippingInfoScreen from './screen/ScreenShippingInfo';
import MainScreen from './screen/ScreenMain';
import WebviewScreen from './screen/ScreenWebview';
import RecentSearchScreen from './screen/ScreenRecentSearch';
import MyCartScreen from './screen/ScreenMyCart';
import LandingPhoneInputScreen from './screen/ScreenLandingPhoneInput';
import DefaultErrorDialog from './screen/DialogDefaultError';
import AddCardScreen from './screen/ScreenAddCard';
import {Provider as StoreProvider} from 'react-redux';
import store from './screen/redux/store';
import OrderHistoryScreen from './screen/ScreenOrderHistory';
import OrderDetailsScreen from './screen/ScreenOrderDetails';
import PersonalZoneScreen from './screen/ScreenPersonalZone';
import RNRestart from 'react-native-restart';
import AsyncStorage from '@react-native-community/async-storage';
import MyAddressesScreen from './screen/ScreenMyAddresses';
import AddAddressesScreen from './screen/ScreenAddAddresses';
import SettingScreen from './screen/ScreenSetting';
import PaymentMethodScreen from './screen/ScreenPaymentMethod';
import EmailValidateScreen from './screen/ScreenEmailValidate';
import BlankScreen from './screen/ScreenBlank';
import ActiveOrderDetailsScreen from './screen/ScreenActiveOrderDetails';
import ActiveOrderFeedbackScreen from './screen/ScreenActiveOrderFeedback';
import '@react-native-firebase/app';
import '@react-native-firebase/auth';
import messaging from '@react-native-firebase/messaging';
import auth from '@react-native-firebase/auth';
import PushNotification from 'react-native-push-notification';
import RNBootSplash from "react-native-bootsplash";

const Tab = createMaterialTopTabNavigator();
const Stack = createStackNavigator();
console.disableYellowBox = true;

function RootApp() {
  React.useEffect(() => {
    // if (Platform.OS == "ios") {
    //   SplashScreen.hide();
    // }
    RNBootSplash.hide({ fade: true });
  });

  if (I18nManager.isRTL || isForceRTL) {
    I18nManager.forceRTL(true);
    AsyncStorage.getItem(key_restart_for_rtl).then((isRestarted) => {
      console.log('isRestarted:' + isRestarted);
      if (isRestarted == null) {
        AsyncStorage.setItem(key_restart_for_rtl, '1').then(() => {
          console.log('call restart before:');
          RNRestart.Restart();
          console.log('call restart after:');
        });
      } else {
        console.log('isRestarted: here');
      }
    });
  } else {
    I18nManager.forceRTL(false);
  }
  return (
    <StoreProvider store={store}>
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: 'space-between',
          flexDirection: 'column',
          paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
        }}>
        <StatusBar
          translucent
          backgroundColor={c_status_bar_background}
          barStyle="dark-content"
        />
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
            }}
            headerMode="screen"
            initialRouteName={
              Platform.OS == 'ios' ? MainAppName : SplashScreenName
            }>
            <Stack.Screen
              name={SplashScreenName}
              component={MySplashScreen}
              options={{
                title: SplashScreenName,
                cardStyleInterpolator: forSlide,
              }}
            />
            <Stack.Screen
              name={MainAppName}
              component={MainApp}
              options={{
                title: MainAppName,
                cardStyleInterpolator: forSlide,
              }}
            />
            <Stack.Screen
              name={SearchResultScreenName}
              component={SearchResultScreen}
              options={{
                title: SearchResultScreenName,
                cardStyleInterpolator: forSlide,
              }}
            />
            <Stack.Screen
              name={WebviewScreenName}
              component={WebviewScreen}
              options={{
                cardStyleInterpolator: forSlide,
              }}
            />
            <Stack.Screen
              name={CategoryScreenName}
              component={CategoryScreen}
              options={{
                cardStyleInterpolator: forSlide,
              }}
            />
            <Stack.Screen
              name={ProductDetailScreenName}
              component={ProductDetailScreen}
              options={{
                cardStyleInterpolator: forSlide,
              }}
            />
            <Stack.Screen
              name={OrderSummaryScreenName}
              component={OrderSummaryScreen}
              options={{
                cardStyleInterpolator: forSlide,
              }}
            />
            <Stack.Screen name={LandingScreenName} component={LandingScreen} />
            <Stack.Screen
              name={PhoneInputScreenName}
              component={PhoneInputScreen}
              options={{
                cardStyleInterpolator: forSlide,
              }}
            />
            <Stack.Screen
              name={PhoneRegistrationScreenName}
              component={PhoneRegistrationScreen}
              options={{
                cardStyleInterpolator: forSlide,
              }}
            />
            <Stack.Screen
              name={LandingStackName}
              component={LandingStack}
              options={{
                cardStyleInterpolator: forSlide,
              }}
            />
            <Stack.Screen
              name={AddCardScreenName}
              component={AddCardScreen}
              options={{
                cardStyleInterpolator: forSlide,
              }}
            />
            <Stack.Screen
              name={OrderHistoryScreenName}
              component={OrderHistoryScreen}
              options={{
                cardStyleInterpolator: forSlide,
              }}
            />
            <Stack.Screen
              name={OrderDetailsScreenName}
              component={OrderDetailsScreen}
              options={{
                cardStyleInterpolator: forSlide,
              }}
            />
            <Stack.Screen
              name={DefaultErrorDialogName}
              component={DefaultErrorDialog}
              options={modalOptions}
            />
            <Stack.Screen
              name={AddAddressesScreenName}
              component={AddAddressesScreen}
              options={{
                cardStyleInterpolator: forSlide,
              }}
            />
            <Stack.Screen
              name={SettingScreenName}
              component={SettingScreen}
              options={{
                cardStyleInterpolator: forSlide,
              }}
            />
            <Stack.Screen
              name={EmailValidateScreenName}
              component={EmailValidateScreen}
              options={{
                cardStyleInterpolator: forSlide,
              }}
            />
            <Stack.Screen
              name={ActiveOrderDetailsScreenName}
              component={ActiveOrderDetailsScreen}
              options={{
                cardStyleInterpolator: forSlide,
              }}
            />
            <Stack.Screen
              name={ActiveOrderFeedbackScreenName}
              component={ActiveOrderFeedbackScreen}
              options={{
                cardStyleInterpolator: forSlide,
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaView>
    </StoreProvider>
  );
}

const fadeAnimation = ({current}) => ({
  cardStyle: {
    opacity: current.progress,
  },
});

const modalOptions = {
  headerShown: false,
  cardStyle: {backgroundColor: 'rgba(0,0,0,0.5)'},
  cardOverlayEnabled: true,
  cardStyleInterpolator: fadeAnimation,
};

const forSlide = ({current, next, inverted, layouts: {screen}}) => {
  const progress = Animated.add(
    current.progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    }),
    next
      ? next.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 1],
          extrapolate: 'clamp',
        })
      : 0,
  );

  return {
    cardStyle: {
      transform: [
        {
          translateX: Animated.multiply(
            progress.interpolate({
              inputRange: [0, 1, 2],
              outputRange: [
                screen.width, // Focused, but offscreen in the beginning
                0, // Fully focused
                screen.width * -0.3, // Fully unfocused
              ],
              extrapolate: 'clamp',
            }),
            inverted,
          ),
        },
      ],
    },
  };
};

function LandingStack() {
  if (I18nManager.isRTL || isForceRTL) {
    I18nManager.forceRTL(true);
  } else {
    I18nManager.forceRTL(false);
  }
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName={LandingPhoneInputScreenName}>
      <Stack.Screen
        name={LandingPhoneInputScreenName}
        component={LandingPhoneInputScreen}
        options={{
          cardStyleInterpolator: forSlide,
        }}
      />
      <Stack.Screen
        name={SmsVerificationScreenName}
        component={SmsVerificationScreen}
        options={{
          cardStyleInterpolator: forSlide,
        }}
      />
    </Stack.Navigator>
  );
}

function MainApp() {
  I18nManager.allowRTL(true);
  if (I18nManager.isRTL || isForceRTL) {
    I18nManager.forceRTL(true);
  } else {
    I18nManager.forceRTL(false);
  }
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
      }}
      tabBarPosition="bottom"
      swipeEnabled={false}
      backBehavior="history"
      lazy={true}
      initialRouteName={MainScreenName}
      tabBar={(props) => <FooterBar {...props} />}>
      <Tab.Screen name={MainScreenName} component={MainScreen} />
      {/*<Tab.Screen name={MyCartScreenName} component={MyCartScreen} />*/}
      <Tab.Screen
        name={CategoriesListScreenName}
        component={CategoriesListScreen}
        options={{
          cardStyleInterpolator: forSlide,
        }}
      />
      <Tab.Screen
        name={MyCartScreenName}
        component={MyCartScreen}
        options={{
          cardStyleInterpolator: forSlide,
        }}
      />
      <Tab.Screen
        name={PersonalZoneScreenName}
        component={PersonalZoneScreen}
        options={{
          cardStyleInterpolator: forSlide,
        }}
      />
      <Tab.Screen
        name={ShippingInfoScreenName}
        component={ShippingInfoScreen}
        options={{
          cardStyleInterpolator: forSlide,
        }}
      />
      <Tab.Screen
        name={MyAddressesScreenName}
        component={MyAddressesScreen}
        options={{
          cardStyleInterpolator: forSlide,
        }}
      />
      <Tab.Screen
        name={PaymentMethodScreenName}
        component={PaymentMethodScreen}
        options={{
          cardStyleInterpolator: forSlide,
        }}
      />
      <Tab.Screen
        name={BlankScreenName}
        component={BlankScreen}
        options={{
          cardStyleInterpolator: forSlide,
        }}
      />
      <Tab.Screen
        name={RecentSearchScreenName}
        component={RecentSearchScreen}
        options={{
          cardStyleInterpolator: forSlide,
        }}
      />
    </Tab.Navigator>
  );
}

messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('setBackgroundMessageHandler FCM message arrived!', JSON.stringify(remoteMessage));
  await AsyncStorage.setItem(key_screen_should_open, JSON.stringify(remoteMessage))
});

// just call from background ? why?
// messaging().onNotificationOpenedApp (async remoteMessage => {
//   console.log("onNotificationOpenedApp");
//   await AsyncStorage.setItem(key_screen_should_open, JSON.stringify(remoteMessage.data))
// })

export default RootApp;
AppRegistry.registerComponent(appName, () => RootApp);


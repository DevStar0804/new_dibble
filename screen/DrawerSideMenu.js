/*eslint prettier/prettier:0*/
/**
 * @format
 * @flow
 */

import * as React from 'react';
import {
    View, TouchableOpacity,
    Text, ScrollView,
    Image, StyleSheet,
    Dimensions, TextInput, Alert, Platform, NativeModules,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import {
    c_active_dot,
    c_dark_line, c_dark_line_opacity,
    c_dark_text,
    c_inactive_dot,
    c_text_green,
    CategoryScreenName, isForceRTL, key_user_info, LandingScreenName,
} from '../resource/BaseValue';
import {
    DrawerContentScrollView,
    DrawerItemList,
    DrawerItem
} from '@react-navigation/drawer';
import AsyncStorage from '@react-native-community/async-storage';
import getLanguage from '../resource/LanguageSupport';
import {globalStyle} from '../resource/style/GlobalStyle';

export default class CustomDrawerSideMenu  extends React.Component  {

    constructor (props) {
        super(props);
        this.state = ({
            userInfo:{

            }
        })
    }

    componentDidMount () {
        this.loadUserInfo();
    }

    loadUserInfo = async  () => {
        try {
            const value = await AsyncStorage.getItem(key_user_info)
            if(value != null) {
                // value previously stored
                const jsonValue = JSON.parse(value);
                console.log(jsonValue);
                let allState = this.state;
                allState.userInfo = jsonValue;
                this.setState(allState);
            } else {

            }
        } catch(e) {
            // error reading value

        }
    }

    render () {
        let greetingText = langObj.goodMorning;
        let curHour = new Date().getHours();
        if (curHour > 12 && curHour < 18){
            greetingText = langObj.goodAfternoon;
        } else if (curHour > 18) {
            greetingText = langObj.goodEvening;
        }
        return (
            <DrawerContentScrollView>
                <View style={{flex:1, flexDirection:'column', padding:5}}>
                    <TouchableOpacity
                        onPress={()=>{
                            this.props.navigation.closeDrawer();
                        }}
                        style={{alignSelf:'flex-end'}}>
                        <FastImage
                            source={langObj.isRTL ? require("../image/icon_arrow_blue_left.png"): require("../image/icon_arrow_blue_right.png")}
                            resizeMode="contain"
                            style={{
                                width:screenWidth*0.05*(70/139),
                                height:screenWidth*0.05
                            }}
                        />
                    </TouchableOpacity>
                    <FastImage
                        source={require("../image/avatar_demo.png")}
                        resizeMode="cover"
                        style={{
                            width:screenWidth*0.3,
                            height:screenWidth*0.3,
                            borderRadius: screenWidth*0.15,
                            alignSelf:'center'
                        }}
                    />
                    <View style={{flexDirection:'row', alignItems:'center', justifyContent:'center'}}>
                        <Text style={[globalStyle.textBasicBoldStyle,mStyle.textGreeting,{marginStart:5}]}>{greetingText}</Text>
                        <Text style={[globalStyle.textBasicBoldStyle,mStyle.textGreeting]}>, </Text>
                        <Text style={[globalStyle.textBasicStyle,mStyle.textLabel]}>{this.state.userInfo.firstName}</Text>
                    </View>
                    <Text style={[globalStyle.textBasicBoldStyle, mStyle.textLabel,{marginTop:10, alignSelf:'flex-start'}]}>{langObj.itemYouLiked}</Text>
                    <ScrollView
                        horizontal={true}
                        showsVerticalScrollIndicator={false}
                        style={{marginTop:20}}>
                        <View style={{
                            borderRadius:10,
                            padding:1,
                            margin: 2,
                            shadowColor: "#3e3e3e",
                            shadowOffset: {
                                width: 0,
                                height: 0,
                            },
                            shadowOpacity: 0.1,
                            shadowRadius: 1,
                            elevation: 20}}>
                            <FastImage
                                source={require("../image/img_like_item_no.png")}
                                resizeMode="cover"
                                style={{
                                    width:screenWidth*0.4*(1166/1447),
                                    height:screenWidth*0.4,
                                    borderRadius: 10,
                                }}
                            />
                        </View>
                        <Text style={[globalStyle.textBasicStyle, mStyle.textMessage,{marginStart:5, marginEnd:5}]}>{langObj.likeItemListIntro}</Text>
                    </ScrollView>
                    <Text style={[globalStyle.textBasicBoldStyle, mStyle.textLabel,{marginTop:10, alignSelf:'flex-start'}]}>{langObj.setting}</Text>
                    <TouchableOpacity style={{flexDirection:'row', alignItems:"center",paddingTop:10, paddingBottom:10}}>
                        <Text style={[globalStyle.textBasicBoldStyle, mStyle.textLabel]}>{langObj.orderHistory}</Text>
                        <View style={{flex:1}}/>
                        <FastImage
                            source={langObj.isRTL ? require("../image/icon_arrow_blue_left.png"): require("../image/icon_arrow_blue_right.png")}
                            resizeMode="contain"
                            style={{
                                width:screenWidth*0.05*(70/139),
                                height:screenWidth*0.05
                            }}
                        />
                    </TouchableOpacity>
                    <View style={[mStyle.line]}/>
                    <TouchableOpacity style={{flexDirection:'row', alignItems:"center",paddingTop:10, paddingBottom:10}}>
                        <Text style={[globalStyle.textBasicBoldStyle, mStyle.textLabel]}>{langObj.myAddress}</Text>
                        <View style={{flex:1}}/>
                        <FastImage
                            source={langObj.isRTL ? require("../image/icon_arrow_blue_left.png"): require("../image/icon_arrow_blue_right.png")}
                            resizeMode="contain"
                            style={{
                                width:screenWidth*0.05*(70/139),
                                height:screenWidth*0.05
                            }}
                        />
                    </TouchableOpacity>
                    <View style={[mStyle.line]}/>
                    <TouchableOpacity style={{flexDirection:'row', alignItems:"center",paddingTop:10, paddingBottom:10}}>
                        <Text style={[globalStyle.textBasicBoldStyle, mStyle.textLabel]}>{langObj.paymentOptions}</Text>
                        <View style={{flex:1}}/>
                        <FastImage
                            source={langObj.isRTL ? require("../image/icon_arrow_blue_left.png"): require("../image/icon_arrow_blue_right.png")}
                            resizeMode="contain"
                            style={{
                                width:screenWidth*0.05*(70/139),
                                height:screenWidth*0.05
                            }}
                        />
                    </TouchableOpacity>
                    <View style={[mStyle.line]}/>
                    <TouchableOpacity style={{flexDirection:'row', alignItems:"center",paddingTop:10, paddingBottom:10}}>
                        <Text style={[globalStyle.textBasicBoldStyle, mStyle.textLabel]}>{langObj.chatWithClientService}</Text>
                        <View style={{flex:1}}/>
                        <FastImage
                            source={langObj.isRTL ? require("../image/icon_arrow_blue_left.png"): require("../image/icon_arrow_blue_right.png")}
                            resizeMode="contain"
                            style={{
                                width:screenWidth*0.05*(70/139),
                                height:screenWidth*0.05
                            }}
                        />
                    </TouchableOpacity>
                    <View style={[mStyle.line]}/>
                    <TouchableOpacity style={{flexDirection:'row', alignItems:"center",paddingTop:10, paddingBottom:10}}>
                        <Text style={[globalStyle.textBasicBoldStyle, mStyle.textLabel]}>{langObj.moreSetting}</Text>
                        <View style={{flex:1}}/>
                        <FastImage
                            source={langObj.isRTL ? require("../image/icon_arrow_blue_left.png"): require("../image/icon_arrow_blue_right.png")}
                            resizeMode="contain"
                            style={{
                                width:screenWidth*0.05*(70/139),
                                height:screenWidth*0.05
                            }}
                        />
                    </TouchableOpacity>
                </View>
            </DrawerContentScrollView>
        )
    }
}

let langObj = getLanguage();
const screenWidth = Math.round(Dimensions.get('window').width);
const screenHeight = Math.round(Dimensions.get('window').height);
const mStyle = StyleSheet.create({
    textGreeting : {
        fontSize: 14,
        color:c_text_green
    },
    textLabel: {
        fontSize: 14,
        color:"#000000"
    },
    textMessage: {
        fontSize: 13,
        color:c_dark_text
    },
    line:{
        width: '100%',
        height: 1,
        backgroundColor:c_dark_line_opacity
    }
})

/*eslint prettier/prettier:0*/
/**
 * @format
 * @flow
 */

import * as React from 'react';
import {
    View, TouchableOpacity, Dimensions, StyleSheet, Image, Text, Keyboard
} from 'react-native';
import getLanguage from '../resource/LanguageSupport';
import {
    CategoriesListScreenName,
    key_user_info, LandingStackName,
    MainScreenName,
    MyCartScreenName, OrderHistoryScreenName, PersonalZoneScreenName,
} from '../resource/BaseValue';
import {globalStyle} from '../resource/style/GlobalStyle';
import moment from 'moment';
import AsyncStorage from '@react-native-community/async-storage';


export default function FooterBar({ state, descriptors, navigation }) {
    const focusedOptions = descriptors[state.routes[state.index].key].options;
    let routeName = state.routes[state.index].name;
    let selectPos = 0;
    if (routeName == MainScreenName) {
        selectPos = 0;
    } else if (routeName == CategoriesListScreenName) {
        selectPos = 1;
    } else if (routeName == MyCartScreenName) {
        selectPos = 2;
    } else if (routeName == PersonalZoneScreenName) {
        selectPos = 3;
    } else {
        selectPos = 4;
    }
    let isVisible = true;
    if (focusedOptions.tabBarVisible === false) {
        // return (<View style={{backgroundColor:"#000000"}}></View>);
        isVisible = false;
    }
    return (
        <View>
            <View style={[mStyle.footerContainer, {marginBottom: isVisible?0:-1000}]}>
                <TouchableOpacity
                    onPress={()=>{
                        Keyboard.dismiss();
                        navigation.jumpTo(MainScreenName);
                    }}
                    style={[mStyle.footerItem]}>
                    <Image
                        source={selectPos == 0? require("../image/icon_footer_homepage.png") : require("../image/icon_footer_homepage_unselected.png")}
                        resizeMode="contain"
                        style={[mStyle.footerImage]}
                    />
                    <Text style={[globalStyle.textBasicBoldStyle, mStyle.footerText]}>{langObj.footerHomePage}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={()=>{
                        Keyboard.dismiss();
                        navigation.jumpTo(CategoriesListScreenName);
                    }}
                    style={[mStyle.footerItem]}>
                    <Image
                        source={selectPos == 1? require("../image/icon_footer_categories.png") : require("../image/icon_footer_categories_unselected.png")}
                        resizeMode="contain"
                        style={[mStyle.footerImage]}
                    />
                    <Text style={[globalStyle.textBasicBoldStyle, mStyle.footerText]}>{langObj.footerCategories}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={()=>{
                        Keyboard.dismiss();
                        navigation.jumpTo(MyCartScreenName, {
                            refreshValue: moment().format('YYYY-MM-DD hh:mm:ss a')
                        });
                    }}
                    style={[mStyle.footerItem]}>
                    <Image
                        source={selectPos == 2? require("../image/icon_footer_mycart.png") : require("../image/icon_footer_mycart_unselected.png")}
                        resizeMode="contain"
                        style={[mStyle.footerImage]}
                    />
                    <Text style={[globalStyle.textBasicBoldStyle, mStyle.footerText]}>{langObj.footerMyCart}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={()=>{
                        Keyboard.dismiss();
                        AsyncStorage.getItem(key_user_info).then((value)=>{
                            if (value != null && value != "") {
                                let userInfo = JSON.parse(value);
                                if (userInfo.token != null && userInfo.token != "") {
                                    navigation.navigate(PersonalZoneScreenName, {
                                        "refresh": Date.parse(new Date())
                                    });
                                } else {
                                    navigation.navigate(LandingStackName);
                                }
                            } else {
                                navigation.navigate(LandingStackName);
                            }
                        })
                    }}
                    style={[mStyle.footerItem]}>
                    <Image
                        source={selectPos == 3? require("../image/icon_footer_private.png") : require("../image/icon_footer_private_unselected.png")}
                        resizeMode="contain"
                        style={[mStyle.footerImage]}
                    />
                    <Text style={[globalStyle.textBasicBoldStyle, mStyle.footerText]}>{langObj.footerPrivate}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

let langObj = getLanguage();
const screenWidth = Math.round(Dimensions.get('window').width);
const mStyle = StyleSheet.create({
    footerContainer: {
        width:screenWidth,
        backgroundColor:"#fff",
        borderTopWidth:0.5,
        borderTopColor:"#fff",
        flexDirection:'row',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 0,
    },
    footerItem : {
        flexDirection:'column',
        flex:1,
        alignItems:'center',
        justifyContent: 'center',
        padding: 5,
    },
    footerImage: {
        width:screenWidth*0.1,
        height:screenWidth*0.1,
    },
    footerText: {
        fontSize:13,
        color:'#000000',
        textAlign:'center',
    }

})

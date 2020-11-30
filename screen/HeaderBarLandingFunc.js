/*eslint prettier/prettier:0*/
/**
 * @format
 * @flow
 */

import * as React from 'react';
import {
    View, TouchableOpacity, Dimensions, StyleSheet, Image, Text, TextInput,
} from 'react-native';
import getLanguage from '../resource/LanguageSupport';
import {
    c_bg_search_box_dark,
    c_dark_line_opacity,
    c_dark_text,
    c_text_green,
    CategoriesListScreenName,
    greyHasOpacity,
    HomeScreenName, MainScreenName, RecentSearchScreenName, SearchResultScreenName,
} from '../resource/BaseValue';
import {globalStyle} from '../resource/style/GlobalStyle';
import { useNavigation } from '@react-navigation/native';
import {headerHookSearchTextPos, headerHookTypePos} from '../resource/Config';
import FastImage from 'react-native-fast-image';

export default function  HeaderBarLandingFunc ()  {
    const navigation = useNavigation();
    const state = React.useState();
    return (
        <View style={[{width:screenWidth, margin:0,flexDirection:'row',alignItems:'center',
            backgroundColor:"#ffffff"}]}>
            <TouchableOpacity
                style={{padding: 10}}
                onPress={()=>{
                    navigation.goBack();
                }}>
                <FastImage
                    source={langObj.isRTL ? require("../image/icon_arrow_grey_right.png"): require("../image/icon_arrow_grey_left.png")}
                    resizeMode="contain"
                    style={{
                        width:screenWidth*0.05,
                        height:screenWidth*0.05}}
                />
            </TouchableOpacity>
            <View style={{flex:1}}/>
            <View style={{flexDirection: 'row', alignItems:'center',justifyContent:'center'}}>
                <Text style={[globalStyle.textBasicBoldStyle, {fontWeight:'bold'}]}>{langObj.appName}</Text>
                <FastImage
                    source={require("../image/icon_logo.png")}
                    resizeMode="contain"
                    style={{
                        width:screenWidth*0.05,
                        height:screenWidth*0.05*(312/298),marginStart:5}}
                />
            </View>
            <View style={{flex:1}}/>
            <TouchableOpacity
                style={{padding: 10}}
                onPress={()=>{

                }}>
                <FastImage
                    source={require('../image/icon_footer_mycart.png')}
                    resizeMode="contain"
                    style={{
                        width:screenWidth*0.07,
                        height:screenWidth*0.07}}
                />
            </TouchableOpacity>
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
        borderTopColor:greyHasOpacity,
        flexDirection:'row',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
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

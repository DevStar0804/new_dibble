/*eslint prettier/prettier:0*/
/**
 * @format
 * @flow
 */

import * as React from 'react';
import {
    View, TouchableOpacity, Dimensions, StyleSheet, Image, Text, TextInput,
} from 'react-native';
import getLanguage, {getDesignDimension} from '../resource/LanguageSupport';
import {
    AddAddressesScreenName,
    AddCardScreenName,
    c_bg_search_box_dark,
    c_cursor_textInput,
    c_grey_darker,
    c_main_orange, c_red,
    CategoriesListScreenName, EmailValidateScreenName,
    greyHasOpacity,
    LandingPhoneInputScreenName,
    MainScreenName, MyAddressesScreenName,
    MyCartScreenName, OrderDetailsScreenName,
    OrderHistoryScreenName,
    OrderSummaryScreenName, PaymentMethodScreenName, PersonalZoneScreenName,
    PhoneRegistrationScreenName,
    ProductDetailScreenName,
    RecentSearchScreenName,
    SearchResultScreenName, SettingScreenName,
    ShippingInfoScreenName,
    SmsVerificationScreenName,
} from '../resource/BaseValue';
import {globalStyle} from '../resource/style/GlobalStyle';
import moment from 'moment';
import {headerHookSearchTextPos} from '../resource/Config';
import { useSelector, useDispatch} from 'react-redux';
import { create } from 'react-native-pixel-perfect';
import FastImage from 'react-native-fast-image';
import HeaderLogoComponents from './comp/HeaderLogo';

export default function  SearchHeaderBarFunc ({ title, navigation })  {
        const [searchText, setSearchText] = React.useState(headerHookSearchTextPos);
        const dispatch = useDispatch();
        let amountState = useSelector(state => state, []);
        const inputEl = React.useRef();
        const perfectSize = create(getDesignDimension());
        if (inputEl != null && inputEl.current != null) {
            setTimeout(()=>{
                // inputEl.current.focus();
            },100);
        }
        if (title == RecentSearchScreenName) {
            return (
                <View style={[globalStyle.header,{width:screenWidth, paddingStart:5, paddingEnd:5,flexDirection:'column',alignItems:'center',
                    backgroundColor:"#ffffff"}]}>
                   <HeaderLogoComponents />
                    <View style={{flexDirection:'row', alignItems: 'center'}}>
                        <TouchableOpacity
                            style={{paddingTop: 10, paddingBottom:10, paddingStart:10, paddingEnd:15}}
                            onPress={()=>{
                                navigation.goBack();
                                setTimeout(()=>{
                                    inputEl.current.blur();
                                },100)
                            }}>
                            <Image
                                source={langObj.isRTL ? require("../image/icon_arrow_right_black.png"): require("../image/icon_arrow_left_black.png")}
                                resizeMode="contain"
                                style={{
                                    width:screenWidth*0.03,
                                    height:screenWidth*0.03*(139/70)}}
                            />
                        </TouchableOpacity>
                        <View style={{flexDirection:'row', alignItems:'center', flex:1, marginTop:10, marginBottom:10, marginEnd:10,
                            backgroundColor:c_bg_search_box_dark, borderRadius:10, paddingStart:10, paddingEnd:10}}>
                            <TextInput
                                ref={inputEl}
                                style={[globalStyle.textSearch,{textAlign:'right'}]}
                                value={searchText}
                                selectionColor={c_cursor_textInput}
                                autoFocus={true}
                                onFocus={()=>{
                                    // navigation.navigate(RecentSearchScreenName);
                                }}
                                onSubmitEditing={()=>{
                                    if (searchText != "") {
                                        navigation.navigate(SearchResultScreenName, {
                                            searchText: searchText
                                        })
                                    }
                                }}
                                onChangeText={(text)=>{
                                    setSearchText(text);
                                }}
                                placeholder={langObj.searchTextInMain}
                            />
                        </View>
                    </View>
                </View>
            );
        } else if (title == MainScreenName || title == CategoriesListScreenName){
            return (
                <View style={[globalStyle.header,{width:screenWidth, paddingStart:5, paddingEnd:5,flexDirection:'column',alignItems:'center',
                    backgroundColor:"#ffffff"}]}>
                    <HeaderLogoComponents />
                    <View style={{flexDirection:'row'}}>
                        <View style={{flexDirection:'row', alignItems:'center', justifyContent: 'center', flex:1, margin:5,
                            backgroundColor:c_bg_search_box_dark, borderRadius:10, paddingStart:10, paddingEnd:10}}>
                            <TouchableOpacity
                                onPress={()=>{
                                    navigation.navigate(RecentSearchScreenName, {
                                        refreshValue: moment().format('YYYY-MM-DD hh:mm:ss a')
                                    });
                                }}
                                style={[globalStyle.textSearch,{alignItems:'center', justifyContent: 'center', flexDirection:'row'}]}>
                                <Text style={[{alignItems:'center',textAlign:'center',textAlignVertical: 'center', fontSize: 15, color:c_grey_darker}]}>{langObj.searchTextInMain}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={()=>{
                                    navigation.navigate(RecentSearchScreenName, {
                                        refreshValue: moment().format('YYYY-MM-DD hh:mm:ss a')
                                    });
                                }}>
                                <Image
                                    source={require("../image/icon_search_static.png")}
                                    resizeMode="contain"
                                    style={{
                                        width:perfectSize(60),
                                        height:perfectSize(55),marginEnd:5}}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            );
        } else if (title == ProductDetailScreenName
            || title == OrderSummaryScreenName
            || title == PhoneRegistrationScreenName
            || title == AddCardScreenName
            || title == LandingPhoneInputScreenName
            || title == SmsVerificationScreenName
            || title == ShippingInfoScreenName
            || title == EmailValidateScreenName) {
            return (
                <View style={[globalStyle.header,{width:screenWidth, flexDirection:'row', alignItems:'center', backgroundColor:"#fff"}]}>
                    <TouchableOpacity
                        style={{padding: 10}}
                        onPress={()=>{
                            navigation.goBack(null);
                        }}>
                        <Image
                            source={langObj.isRTL ? require("../image/icon_arrow_grey_right.png"): require("../image/icon_arrow_grey_left.png")}
                            resizeMode="contain"
                            style={{
                                width:screenWidth*0.05,
                                height:screenWidth*0.05}}
                        />
                    </TouchableOpacity>
                    <View style={{flex:1}}/>
                    <View style={{flexDirection: 'row', alignItems:'center',justifyContent:'center'}}>
                        <HeaderLogoComponents />
                    </View>
                    <View style={{flex:1}}/>
                    <View style={[mStyle.cartAmountContainer]}>
                        <Text style={[globalStyle.textBasicStyle, mStyle.textCartAmount]}>{amountState.length > 0 ? amountState[0]['amount'] : 0}</Text>
                    </View>
                    <TouchableOpacity
                        style={{padding: 10}}
                        onPress={()=>{
                            navigation.navigate(MyCartScreenName, {
                                refreshValue: moment().format('YYYY-MM-DD hh:mm:ss a')
                            });
                        }}>
                        <Image
                            source={require('../image/icon_footer_mycart.png')}
                            resizeMode="contain"
                            style={{
                                width:screenWidth*0.07,
                                height:screenWidth*0.07}}
                        />
                    </TouchableOpacity>
                </View>
            );
        } else if (title == MyCartScreenName
                    || title == OrderHistoryScreenName
                    || title == OrderDetailsScreenName
                    || title == PersonalZoneScreenName
                    || title == MyAddressesScreenName
                    || title == AddAddressesScreenName
                    || title == SettingScreenName
                    || title == PaymentMethodScreenName) {
            return (
                <View style={[globalStyle.header,{width:screenWidth, flexDirection:'row', alignItems:'center', backgroundColor:"#fff"}]}>
                    <TouchableOpacity
                        style={{padding: 10}}
                        onPress={()=>{
                            navigation.goBack(null);
                        }}>
                        <Image
                            source={langObj.isRTL ? require("../image/icon_arrow_grey_right.png"): require("../image/icon_arrow_grey_left.png")}
                            resizeMode="contain"
                            style={{
                                width:screenWidth*0.05,
                                height:screenWidth*0.05}}
                        />
                    </TouchableOpacity>
                    <View style={{flex:1}}/>
                    <View style={{flexDirection: 'row', alignItems:'center',justifyContent:'center'}}>
                        <HeaderLogoComponents />
                    </View>
                    <View style={{flex:1}}/>
                    <View style={{width:screenWidth*0.07,}}/>
                </View>
            );
        }
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
    },
    cartAmountContainer : {
        width:screenWidth*0.04,
        height:screenWidth*0.04,
        borderRadius: screenWidth*0.02,
        backgroundColor: c_main_orange,
        marginEnd:-screenWidth*0.05,
        marginTop:10,
        alignSelf:"flex-start"
    },
    textCartAmount: {
        fontSize: 12,
        color:'#000000',
        textAlign: 'center',
        width:'100%',
        lineHeight:screenWidth*0.04
    }

})

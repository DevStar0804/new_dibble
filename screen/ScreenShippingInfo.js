/*eslint prettier/prettier:0*/
/**
 * @format
 * @flow
 */

import * as React from 'react';
import {
    View, Text,
    Image, StyleSheet, Keyboard,
    Dimensions, TouchableOpacity, ActivityIndicator, I18nManager, FlatList, Modal,
} from 'react-native';
import {
    c_grey_darker,
    c_grey_light,
    c_loading_icon,
    c_main_background,
    c_main_orange,
    greyHasOpacity, key_screen_comeback,
    key_user_info,
    LandingPhoneInputScreenName, LandingStackName,
    MyCartScreenName, OrderSummaryScreenName, rc_token_expire, rq_get_addresses,
    ShippingInfoScreenName,
} from '../resource/BaseValue';
import AsyncStorage from '@react-native-community/async-storage';
import getLanguage from '../resource/LanguageSupport';
import {globalStyle} from '../resource/style/GlobalStyle';
import SearchHeaderBarFunc from './SearchHeaderBarFunc';
import moment from 'moment';
import {makeAPostRequest} from '../resource/SupportFunction';
import FastImage from 'react-native-fast-image';

export default class ShippingInfoScreen extends React.Component {
    constructor (props) {
        super(props);
        this.state = ({
            indicatorSizeW: 0,
            indicatorSizeH: 0,
            indicatorDisplay: false,
            shippingAddress:"זאב ז׳בוטינסקי 73, רמת גן"
        })
    }


    componentDidMount (){
        Keyboard.dismiss()
        this.loadUserInfo();
    }

    componentWillReceiveProps(){
        console.log("componentWillReceiveProps");
        console.log(this.props);
        setTimeout(()=>{
            // if (this.props.route != null
            //     && this.props.route.params != null) {
            //     let allState = this.state;
            //     if (this.props.route.params.orderId != null) {
            //         allState.orderId = this.props.route.params.orderId;
            //     }
            //     if (this.props.route.params.previousScreen != null && this.props.route.params.previousScreen != "") {
            //         if (this.props.route.params.previousScreen == AddCardScreenName) {
            //             this.loadMyCard();
            //         } else if (this.props.route.params.previousScreen == AddAddressesScreenName) {
            //             this.loadMyAddresses();
            //         }
            //     } else {
            //         this.setState(allState, ()=>{
            //             this.loadActiveOrder();
            //         });
            //     }
            // }
            this.loadDefaultAddress();
        }, 500);
    }



    loadUserInfo = async  () => {
        try {
            const value = await AsyncStorage.getItem(key_user_info)
            if(value != null) {
                // value previously stored
                const jsonValue = JSON.parse(value);
                let allState = this.state;
                allState.userInfo = jsonValue;
                this.setState(allState, ()=>{
                    this.loadDefaultAddress();
                });
            } else {

            }
        } catch(e) {
            // error reading value
        }
    }
    loadDefaultAddress = async () => {
        let dataObj = {
            request: rq_get_addresses,
            token: this.state.userInfo.token,
        }
        makeAPostRequest(dataObj,
            ()=>this._showLoadingBox(),
            ()=>this._closeLoadingBox(),
            (isSuccess, dataResponse)=>{
                if (isSuccess) {
                    let allState = this.state;
                    for (let i = 0; i < dataResponse.addresses.length; i++){
                        if (dataResponse.addresses[i]['is_default'] == 1) {
                            allState.shippingAddress = dataResponse.addresses[i]['address'];
                        }
                    }
                    this.setState(allState);
                } else {
                    if (dataResponse == rc_token_expire) {
                        AsyncStorage.setItem(key_screen_comeback, OrderSummaryScreenName);
                        this.props.navigation.navigate(LandingStackName, {
                            previousScreen: OrderSummaryScreenName
                        });
                    } else {
                        alert(dataResponse);
                    }
                }
            })
    }

    _showLoadingBox () {
        var allState = this.state;
        allState.indicatorSizeW = screenWidth;
        allState.indicatorSizeH = screenHeight;
        allState.indicatorDisplay = true;
        this.setState(allState);
    }

    _closeLoadingBox () {
        var allState = this.state;
        allState.indicatorSizeW = 0;
        allState.indicatorSizeH = 0;
        allState.indicatorDisplay = false;
        this.setState (allState);
    }

    comeToShippingAddressSelect = () =>{

    }


    render () {
        return (
            <View style={{flex:1, flexDirection:"column", backgroundColor:c_main_background}}>
                <SearchHeaderBarFunc navigation={this.props.navigation} title={ShippingInfoScreenName} />
                <TouchableOpacity style={[mStyle.titleContainer]}>
                    <Text style={[globalStyle.textBasicBoldStyle,mStyle.titleContainerText]}>{langObj.freeShippingIn24Hours}</Text>
                </TouchableOpacity>
                <View style={{flexDirection:'row', marginStart:20, marginEnd: 20, marginTop: 10}}>
                    <View style={{flexDirection:'row', alignItems: "center", borderBottomColor:c_main_orange, borderBottomWidth:5, paddingBottom:5}}>
                        <Text style={[globalStyle.textBasicBoldStyle,mStyle.textTitle]}>{langObj.shipping}</Text>
                        <FastImage
                            source={I18nManager.isRTL || langObj.isRTL ? require("../image/icon_arrow_left_black_d2.png") : require("../image/icon_arrow_right_black_d2.png")}
                            resizeMode="contain"
                            style={{
                                width:screenWidth*0.08,
                                height:screenWidth*0.08* (108/156),marginStart:5}}
                        />
                    </View>
                    <View style={{flex:1}}/>
                    <FastImage
                        source={require("../image/icon_ship_car_1.png")}
                        resizeMode="contain"
                        style={{
                            width:screenWidth*0.1,
                            height:screenWidth*0.1}}
                    />
                </View>
                <TouchableOpacity
                    onPress={()=>{
                        this.comeToShippingAddressSelect();
                        this.props.navigation.navigate(OrderSummaryScreenName,{
                            refreshValue: moment().format('YYYY-MM-DD hh:mm:ss a'),
                            isPickupSelected:false
                        });
                    }}
                    style={[mStyle.itemContainer]}>
                    <View
                        // source={require("../image/icon_logo.png")}
                        // resizeMode="contain"
                        style={{
                            width:screenWidth*0.15, height:screenWidth*0.15*(312/298),
                            alignItems:'center', justifyContent: 'center'}}>
                        <FastImage
                            source={require("../image/icon_ship_car_2.png")}
                            resizeMode="contain"
                            style={{
                                width:screenWidth*0.1,
                                height:screenWidth*0.1}}
                        />
                    </View>
                    <View style={{flexDirection:'column', flex:1, marginEnd:5}}>
                        <Text style={[globalStyle.textBasicBoldStyle,mStyle.textTitle]}>{langObj.deliveryUpTo24Hours}</Text>
                        <View style={{flexDirection:'row', alignItems:'center', flex:1}}>
                            <FastImage
                                source={require("../image/icon_pin_location.png")}
                                resizeMode="contain"
                                style={{
                                    width:screenWidth*0.02,
                                    height:screenWidth*0.02*(54/36)}}
                            />
                            <Text style={[globalStyle.textBasicStyle,mStyle.textValue]}>{this.state.shippingAddress}</Text>
                        </View>
                    </View>
                    <TouchableOpacity>
                        <FastImage
                            source={I18nManager.isRTL || langObj.isRTL ? require("../image/icon_arrow_left_black.png") : require("../image/icon_arrow_right_black.png")}
                            resizeMode="contain"
                            style={{
                                width:screenWidth*0.05,
                                height:screenWidth*0.05}}
                        />
                    </TouchableOpacity>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={()=>{
                        this.comeToShippingAddressSelect();
                        this.props.navigation.navigate(OrderSummaryScreenName,{
                            refreshValue: moment().format('YYYY-MM-DD hh:mm:ss a'),
                            isPickupSelected:true
                        });
                    }}
                    style={[mStyle.itemContainer]}>
                    <View
                        // source={require("../image/icon_logo_grayscale.png")}
                        // resizeMode="contain"
                        style={{
                            width:screenWidth*0.15, height:screenWidth*0.15*(312/298),
                            alignItems:'center', justifyContent: 'center'}}>
                        <FastImage
                            source={require("../image/icon_house.png")}
                            resizeMode="contain"
                            style={{
                                width:screenWidth*0.1,
                                height:screenWidth*0.1}}
                        />
                    </View>
                    <View style={{flexDirection:'column', flex:1, marginEnd:5}}>
                        <Text style={[globalStyle.textBasicBoldStyle,mStyle.textTitle]}>{langObj.pickup}</Text>
                        <View style={{flexDirection:'row', alignItems:'center'}}>
                            <FastImage
                                source={require("../image/icon_pin_location.png")}
                                resizeMode="contain"
                                style={{
                                    width:screenWidth*0.02,
                                    height:screenWidth*0.02*(54/36)}}
                            />
                            <Text style={[globalStyle.textBasicStyle,mStyle.textValue]}>{langObj.orderBeReadyIn} 30 {langObj.minutes}</Text>
                        </View>
                    </View>
                    <TouchableOpacity>
                        <FastImage
                            source={I18nManager.isRTL || langObj.isRTL ? require("../image/icon_arrow_left_black.png") : require("../image/icon_arrow_right_black.png")}
                            resizeMode="contain"
                            style={{
                                width:screenWidth*0.05,
                                height:screenWidth*0.05}}
                        />
                    </TouchableOpacity>
                </TouchableOpacity>
                <View style={[mStyle.itemContainer]}>
                    <View
                        // source={require("../image/icon_logo_grayscale.png")}
                        // resizeMode="contain"
                        style={{
                            width:screenWidth*0.15, height:screenWidth*0.15*(312/298),
                            alignItems:'center', justifyContent: 'center'}}>
                        <FastImage
                            source={require("../image/icon_clock.png")}
                            resizeMode="contain"
                            style={{
                                width:screenWidth*0.1,
                                height:screenWidth*0.1}}
                        />
                    </View>
                    <View style={{flexDirection:'column', flex:1, marginEnd:5}}>
                        <Text style={[globalStyle.textBasicBoldStyle,mStyle.textTitle]}>{langObj.scheduleDelivery}</Text>
                        <View style={{flexDirection:'row', alignItems:'center'}}>
                            <FastImage
                                source={require("../image/icon_pin_location.png")}
                                resizeMode="contain"
                                style={{
                                    width:screenWidth*0.02,
                                    height:screenWidth*0.02*(54/36)}}
                            />
                            <Text style={[globalStyle.textBasicStyle,mStyle.textValue]}>{langObj.chooseDayTimeForYou}</Text>
                        </View>
                    </View>
                    <TouchableOpacity>
                        <FastImage
                            source={I18nManager.isRTL || langObj.isRTL ? require("../image/icon_arrow_left_black.png") : require("../image/icon_arrow_right_black.png")}
                            resizeMode="contain"
                            style={{
                                width:screenWidth*0.05,
                                height:screenWidth*0.05}}
                        />
                    </TouchableOpacity>
                </View>
                <View style={{flex:1}}/>
                <View style={{width:this.state.indicatorSizeW, height:this.state.indicatorSizeH, backgroundColor: greyHasOpacity,
                    flexDirection:"column",alignItems:"center", justifyContent:"center", position:"absolute",top:0,left:0}}>
                    <ActivityIndicator animating={this.state.indicatorDisplay} size="large" color={c_loading_icon} />
                </View>
            </View>
        );
    }
}

let langObj = getLanguage();
const screenWidth = Math.round(Dimensions.get('window').width);
const screenHeight = Math.round(Dimensions.get('window').height);
const mStyle = StyleSheet.create({
    titleContainer: {
        fontSize:14,
        flexDirection:'row',
        textAlign:'center',
        alignItems: "center",
        justifyContent: "center",
        marginTop:10,
        marginStart:20,
        marginEnd:20,
        padding: 10,
        backgroundColor: c_grey_light,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    titleContainerText:{
        color:"#000000",
        fontSize:14,
    },
    textTitle:{
      fontSize:22
    },
    textValue: {
        fontSize:12,
        marginStart:5
    },
    buttonDarker: {
        alignSelf:'stretch',
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'center',
        padding:15,
        backgroundColor:"#000000",
        borderRadius:10,
        marginStart:20,
        marginEnd:20,
        marginTop:10,
        marginBottom:10
    },
    itemContainer: {
        flexDirection:'row',
        width: screenWidth-40,
        height:screenWidth*0.2,
        alignItems:'center',
        padding:10,
        marginTop:20,
        marginStart:20,
        marginEnd: 20,
        backgroundColor:'#ffffff',
        borderRadius:10,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    checkItems: {
        width:screenWidth*0.06,
        height: screenWidth*0.06,
        borderRadius: screenWidth*0.05,
        borderColor:c_main_orange,
        borderWidth:1,
        margin:5
    },
    checkedItems: {
        width:screenWidth*0.06,
        height: screenWidth*0.06,
        borderRadius: screenWidth*0.05,
        borderColor:c_main_orange,
        borderWidth:7,
        margin:5
    },
})

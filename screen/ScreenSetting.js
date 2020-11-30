/*eslint prettier/prettier:0*/
/**
 * @format
 * @flow
 */

import * as React from 'react';
import {
    View, Text, ScrollView, Image, StyleSheet,Switch,
    Dimensions, TouchableOpacity, ActivityIndicator, I18nManager
} from 'react-native';
import {
    c_grey_darker,
    c_loading_icon,
    c_main_background,
    c_main_orange,
    c_red,
    c_switch_ball_disable,
    c_switch_ball_enable,
    c_switch_thumb,
    greyHasOpacity,
    key_screen_comeback,
    key_user_info,
    LandingPhoneInputScreenName,
    LandingStackName,
    MainScreenName,
    PhoneInputScreenName,
    rc_token_expire,
    rq_client_get_my_app_settings,
    rq_client_set_my_app_settings,
    SettingScreenName,
} from '../resource/BaseValue';
import AsyncStorage from '@react-native-community/async-storage';
import getLanguage from '../resource/LanguageSupport';
import {globalStyle} from '../resource/style/GlobalStyle';
import SearchHeaderBarFunc from './SearchHeaderBarFunc';
import DeviceInfo from 'react-native-device-info';
import moment from 'moment';
import 'moment/locale/he'
import {makeAPostRequest} from '../resource/SupportFunction';
moment.locale('he');
import FastImage from 'react-native-fast-image';

export default class SettingScreen extends React.Component {
    constructor (props) {
        super(props);
        this.flatlist = React.createRef();
        this.state = ({
            isRefresh: true,
            indicatorSizeW: 0,
            indicatorSizeH: 0,
            indicatorDisplay: false,
            settings:{
                receive_marketing_content: 1,
                receive_invoice_by_mail: 1,
                receive_sale_alerts:1,
                receive_cart_reminders:1,
                receive_order_status_alerts: 1,
            }
        })
    }


    componentDidMount (){
        this.loadUserInfo();
    }

    componentWillReceiveProps(nextProps: Props, nextContext: *): * {

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
                    this.loadUserSetting();
                });
            } else {

            }
        } catch(e) {
            // error reading value
        }
    }

    loadUserSetting = async () =>{
        if (this.state.userInfo.token != null && this.state.userInfo.token != "") {
            let data = {
                request : rq_client_get_my_app_settings,
                token : this.state.userInfo.token
            }

            makeAPostRequest(data,
                ()=>this._showLoadingBox(),
                ()=>this._closeLoadingBox(),
                (isSuccess, dataResponse)=>{
                    if (isSuccess) {
                        let allState = this.state;
                        allState.settings = dataResponse;
                        this.setState(allState);
                    } else {
                        if (dataResponse == rc_token_expire) {
                            AsyncStorage.setItem(key_screen_comeback, SettingScreenName);
                            this.props.navigation.navigate(LandingStackName,{
                                previousScreen: SettingScreenName
                            });
                        } else {
                            alert (dataResponse);
                        }
                    }
                })
        } else {
            AsyncStorage.setItem(key_screen_comeback, SettingScreenName);
            this.props.navigation.navigate(LandingStackName,{
                previousScreen: SettingScreenName
            });
        }
    }

    setUserSetting = async  () => {
        if (this.state.userInfo.token != null && this.state.userInfo.token != "") {
            let data = {
                request : rq_client_set_my_app_settings,
                token : this.state.userInfo.token
            }
            if (this.state.settings.receive_marketing_content == 1) {
                data.receive_marketing_content = true;
            } else {
                data.receive_marketing_content = false;
            }
            if (this.state.settings.receive_invoice_by_mail == 1) {
                data.receive_invoice_by_mail = true;
            } else {
                data.receive_invoice_by_mail = false;
            }
            if (this.state.settings.receive_sale_alerts == 1) {
                data.receive_sale_alerts = true;
            } else {
                data.receive_sale_alerts = false;
            }
            if (this.state.settings.receive_cart_reminders == 1) {
                data.receive_cart_reminders = true;
            } else {
                data.receive_cart_reminders = false;
            }
            if (this.state.settings.receive_order_status_alerts == 1) {
                data.receive_order_status_alerts = true;
            } else {
                data.receive_order_status_alerts = false;
            }

            makeAPostRequest(data,
                ()=>function(){},
                ()=>function(){},
                (isSuccess, dataResponse)=>{
                    if (isSuccess) {

                    } else {
                        if (dataResponse == rc_token_expire) {
                            AsyncStorage.setItem(key_screen_comeback, SettingScreenName);
                            this.props.navigation.navigate(LandingStackName,{
                                previousScreen: SettingScreenName
                            });
                        } else {
                            alert (dataResponse);
                        }
                    }
                })
        } else {
            AsyncStorage.setItem(key_screen_comeback, SettingScreenName);
            this.props.navigation.navigate(LandingStackName,{
                previousScreen: SettingScreenName
            });
        }
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


    render () {
        return (
            <View style={{flex:1, flexDirection:"column", height:screenHeight ,backgroundColor:c_main_background}}>
                <SearchHeaderBarFunc navigation={this.props.navigation} title={SettingScreenName}/>
                <ScrollView style={{flex:1,width:screenWidth, paddingTop:10, paddingBottom:20}}>
                    <View style={[globalStyle.sectionTitleContainer, {alignItems: 'center'}]}>
                        <View style={{flexDirection:'row', alignItems: "center", borderBottomColor:c_main_orange, borderBottomWidth:5, paddingBottom:5}}>
                            <Text style={[globalStyle.textBasicBoldStyle,globalStyle.textSection]}>{langObj.setting}</Text>
                            <FastImage
                                source={I18nManager.isRTL || langObj.isRTL ? require("../image/icon_arrow_left_black_d2.png") : require("../image/icon_arrow_right_black_d2.png")}
                                resizeMode="contain"
                                style={{
                                    width:screenWidth*0.08,
                                    height:screenWidth*0.08* (108/156),marginStart:5}}
                            />
                        </View>
                        <View style={{flex:1}}/>
                    </View>
                    <TouchableOpacity style={[mStyle.buttonContainer]}>
                        <View style={{flex:1, flexDirection: 'column'}}>
                            <Text style={[globalStyle.textBasicBoldStyle,mStyle.textTitle]}>{langObj.locationSetting}</Text>
                            <Text style={[globalStyle.textBasicStyle,mStyle.textDescription]}>{langObj.importantSettingOfApp}</Text>
                        </View>
                        <FastImage
                            source={I18nManager.isRTL || langObj.isRTL ? require("../image/icon_arrow_left_black.png") : require("../image/icon_arrow_right_black.png")}
                            resizeMode="contain"
                            style={{
                                width:screenWidth*0.05,
                                height:screenWidth*0.05}}
                        />
                    </TouchableOpacity>
                    <View style={[mStyle.sectionContainer]}>
                        <Text style={[globalStyle.textBasicBoldStyle, mStyle.textTitle]}>{langObj.marketingContentMessage}</Text>
                        <Switch
                            trackColor={{ false: c_switch_thumb, true: c_switch_thumb }}
                            thumbColor={this.state.settings.receive_marketing_content == 1? c_switch_ball_enable : c_switch_ball_disable}
                            ios_backgroundColor={c_switch_thumb}
                            onValueChange={()=>{
                                let allState = this.state;
                                if (allState.settings.receive_marketing_content == 1) {
                                    allState.settings.receive_marketing_content = 0;
                                } else {
                                    allState.settings.receive_marketing_content = 1;
                                }
                                this.setState(allState, ()=>{
                                    this.setUserSetting();
                                });
                            }}
                            value={this.state.settings.receive_marketing_content == 1}
                        />
                    </View>
                    <View style={[mStyle.sectionContainer]}>
                        <Text style={[globalStyle.textBasicBoldStyle, mStyle.textTitle]}>{langObj.sendReceiptByEmail}</Text>
                        <Switch
                            trackColor={{ false: c_switch_thumb, true: c_switch_thumb }}
                            thumbColor={this.state.settings.receive_invoice_by_mail == 1? c_switch_ball_enable : c_switch_ball_disable}
                            ios_backgroundColor={c_switch_thumb}
                            onValueChange={()=>{
                                let allState = this.state;
                                if (allState.settings.receive_invoice_by_mail == 1) {
                                    allState.settings.receive_invoice_by_mail = 0;
                                } else {
                                    allState.settings.receive_invoice_by_mail = 1;
                                }
                                this.setState(allState, ()=>{
                                    this.setUserSetting();
                                });
                            }}
                            value={this.state.settings.receive_invoice_by_mail == 1}
                        />
                    </View>

                    <View style={[globalStyle.sectionTitleContainer, {alignItems: 'center', marginTop: 40}]}>
                        <View style={{flexDirection:'row', alignItems: "center", borderBottomColor:c_main_orange, borderBottomWidth:5, paddingBottom:5}}>
                            <Text style={[globalStyle.textBasicBoldStyle,globalStyle.textSection]}>{langObj.alert}</Text>
                            <FastImage
                                source={I18nManager.isRTL || langObj.isRTL ? require("../image/icon_arrow_left_black_d2.png") : require("../image/icon_arrow_right_black_d2.png")}
                                resizeMode="contain"
                                style={{
                                    width:screenWidth*0.08,
                                    height:screenWidth*0.08* (108/156),marginStart:5}}
                            />
                        </View>
                        <View style={{flex:1}}/>
                    </View>
                    <View style={[mStyle.sectionContainer]}>
                        <Text style={[globalStyle.textBasicBoldStyle, mStyle.textTitle]}>{langObj.promotions}</Text>
                        <Switch
                            trackColor={{ false: c_switch_thumb, true: c_switch_thumb }}
                            thumbColor={this.state.settings.receive_sale_alerts == 1? c_switch_ball_enable : c_switch_ball_disable}
                            ios_backgroundColor={c_switch_thumb}
                            onValueChange={()=>{
                                let allState = this.state;
                                if (allState.settings.receive_sale_alerts == 1) {
                                    allState.settings.receive_sale_alerts = 0;
                                } else {
                                    allState.settings.receive_sale_alerts = 1;
                                }
                                this.setState(allState, ()=>{
                                    this.setUserSetting();
                                });
                            }}
                            value={this.state.settings.receive_sale_alerts == 1}
                        />
                    </View>
                    <View style={[mStyle.sectionContainer]}>
                        <Text style={[globalStyle.textBasicBoldStyle, mStyle.textTitle]}>{langObj.reminderForShoppingCart}</Text>
                        <Switch
                            trackColor={{ false: c_switch_thumb, true: c_switch_thumb }}
                            thumbColor={this.state.settings.receive_cart_reminders==1? c_switch_ball_enable : c_switch_ball_disable}
                            ios_backgroundColor={c_switch_thumb}
                            onValueChange={()=>{
                                let allState = this.state;
                                if (allState.settings.receive_cart_reminders == 1) {
                                    allState.settings.receive_cart_reminders = 0;
                                } else {
                                    allState.settings.receive_cart_reminders = 1;
                                }
                                this.setState(allState, ()=>{
                                    this.setUserSetting();
                                });
                            }}
                            value={this.state.settings.receive_cart_reminders == 1}
                        />
                    </View>
                    <View style={[mStyle.sectionContainer]}>
                        <Text style={[globalStyle.textBasicBoldStyle, mStyle.textTitle]}>{langObj.orderStatus}</Text>
                        <Switch
                            trackColor={{ false: c_switch_thumb, true: c_switch_thumb }}
                            thumbColor={this.state.settings.receive_order_status_alerts==1? c_switch_ball_enable : c_switch_ball_disable}
                            ios_backgroundColor={c_switch_thumb}
                            onValueChange={()=>{
                                let allState = this.state;
                                if (allState.settings.receive_order_status_alerts == 1) {
                                    allState.settings.receive_order_status_alerts = 0;
                                } else {
                                    allState.settings.receive_order_status_alerts = 1;
                                }
                                this.setState(allState, ()=>{
                                    this.setUserSetting();
                                });
                            }}
                            value={this.state.settings.receive_order_status_alerts == 1}
                        />
                    </View>

                    <View style={[globalStyle.sectionTitleContainer, {alignItems: 'center', marginTop: 40}]}>
                        <View style={{flexDirection:'row', alignItems: "center", borderBottomColor:c_main_orange, borderBottomWidth:5, paddingBottom:5}}>
                            <Text style={[globalStyle.textBasicBoldStyle,globalStyle.textSection]}>{langObj.termOfService}</Text>
                            <FastImage
                                source={I18nManager.isRTL || langObj.isRTL ? require("../image/icon_arrow_left_black_d2.png") : require("../image/icon_arrow_right_black_d2.png")}
                                resizeMode="contain"
                                style={{
                                    width:screenWidth*0.08,
                                    height:screenWidth*0.08* (108/156),marginStart:5}}
                            />
                        </View>
                        <View style={{flex:1}}/>
                    </View>
                    <TouchableOpacity style={[mStyle.buttonContainer]}>
                        <View style={{flex:1, flexDirection: 'column'}}>
                            <Text style={[globalStyle.textBasicBoldStyle,mStyle.textTitle]}>{langObj.termOfService}</Text>
                            <Text style={[globalStyle.textBasicStyle,mStyle.textDescription]}>{langObj.allTermOfUseOfApp}</Text>
                        </View>
                        <FastImage
                            source={I18nManager.isRTL || langObj.isRTL ? require("../image/icon_arrow_left_black.png") : require("../image/icon_arrow_right_black.png")}
                            resizeMode="contain"
                            style={{
                                width:screenWidth*0.05,
                                height:screenWidth*0.05}}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={()=>{
                            let userInfo = {
                                token:""
                            };
                            AsyncStorage.setItem(key_user_info, JSON.stringify(userInfo))
                            .then(()=>{
                                setTimeout(()=>{
                                    this.props.navigation.navigate(LandingStackName);
                                }, 1000)
                            });
                        }}
                        style={[mStyle.buttonContainer, {backgroundColor: c_red}]}>
                        <View style={{flex:1, flexDirection: 'column'}}>
                            <Text style={[globalStyle.textBasicBoldStyle,mStyle.textTitle, {color:"#ffffff"}]}>{langObj.output}</Text>
                            <Text style={[globalStyle.textBasicStyle,mStyle.textDescription, {color:"#ffffff"}]}>{langObj.logout}</Text>
                        </View>
                        <FastImage
                            source={I18nManager.isRTL || langObj.isRTL ? require("../image/icon_arrow_left_white.png") : require("../image/icon_arrow_right_white.png")}
                            resizeMode="contain"
                            style={{
                                width:screenWidth*0.05,
                                height:screenWidth*0.05}}
                        />
                    </TouchableOpacity>

                    <Text style={[mStyle.textBasicStyle, {textAlign:'center', marginTop:15, marginBottom:5, writingDirection:'ltr'}]}>{DeviceInfo.getVersion() + "." + DeviceInfo.getBuildNumber()}</Text>
                    <View style={{height: 20}}/>
                </ScrollView>
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
    buttonContainer:{
        width:screenWidth-40,
        marginStart:20,
        marginTop:20,
        borderRadius:10,
        backgroundColor:"#ffffff",
        paddingStart:10,
        paddingEnd:10,
        paddingTop:20,
        paddingBottom:20,
        flexDirection:'row',
        alignItems:"center",
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    textTitle:{
        fontSize:22,
        color:"#000000",
        flex:1
    },
    textDescription: {
        fontSize:14,
        color:c_grey_darker
    },
    sectionContainer: {
        flexDirection: "row",
        alignItems: 'center',
        paddingStart:20,
        paddingEnd:20,
        paddingTop:10,
        marginTop: 10,
        marginStart: 10
    }

})

/*eslint prettier/prettier:0*/
/**
 * @format
 * @flow
 */

import * as React from 'react';
import {
    View, Text, KeyboardAvoidingView, Image, TextInput, Keyboard,
    Dimensions, ActivityIndicator,TouchableOpacity, StyleSheet, Platform, Alert
} from 'react-native';
import {
    c_text_green,
    key_user_info,
    greyHasOpacity,
    c_loading_icon,
    PhoneRegistrationScreenName,
    c_dark_line,
    rq_login_with_phone,
    apiUrl,
    rc_success,
    rq_verify_sms_code,
    rq_send_sms_code,
    key_screen_comeback,
    MainScreenName,
    c_cursor_textInput,
    c_grey_light,
    LandingPhoneInputScreenName, SmsVerificationScreenName, key_resend_password_time, userTypeClient,
} from '../resource/BaseValue';
import * as RNLocalize from "react-native-localize";
import AsyncStorage from '@react-native-community/async-storage';
import getLanguage from '../resource/LanguageSupport';
import {globalStyle} from '../resource/style/GlobalStyle';
import HeaderBarLandingFunc from './HeaderBarLandingFunc';
import SearchHeaderBarFunc from './SearchHeaderBarFunc';
import Intercom from 'react-native-intercom';
import FastImage from 'react-native-fast-image';
import {makeAPostRequest} from '../resource/SupportFunction';

export default class SmsVerificationScreen extends React.Component {
    constructor (props) {
        super(props);
        this.code1 = React.createRef();
        this.code2 = React.createRef();
        this.code3 = React.createRef();
        this.code4 = React.createRef();
        this.code5 = React.createRef();
        this.state = ({
            indicatorSizeW: 0,
            indicatorSizeH: 0,
            indicatorDisplay: false,
            userPhone:"",
            userCountryCode: "",
            isCode1Focus:false,
            isCode2Focus:false,
            isCode3Focus:false,
            isCode4Focus:false,
            isCode5Focus:false,
            code1:"",
            code2:"",
            code3:"",
            code4:"",
            code5:"",
            countDownTime:0,
        })
    }



    componentDidMount (){
        console.log(RNLocalize.getLocales());
        RNLocalize.addEventListener("change", () => {
            // do localization related stuff…
        });
        let allState = this.state;
        allState.userPhone = this.props.route.params.userPhone;
        allState.userCountryCode = this.props.route.params.userCountryCode;
        allState.code1 = "";
        allState.code2 = "";
        allState.code3 = "";
        allState.code4 = "";
        allState.code5 = "";
        this.setState(allState, ()=>{
            setTimeout(()=>{
                this.code1.current.focus();
            }, 500)
        });
    }

    componentWillReceiveProps(nextProps: Props, nextContext: *): * {
        if (this.props.route != null && this.props.route.params != null){
            setTimeout(()=>{
                let allState = this.state;
                allState.userPhone = this.props.route.params.userPhone;
                allState.userCountryCode = this.props.route.params.userCountryCode;
                allState.code1 = "";
                allState.code2 = "";
                allState.code3 = "";
                allState.code4 = "";
                allState.code5 = "";
                this.setState(allState, ()=>{
                    this.code1.current.focus();
                });
            },500)
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

    verifyCode = async () =>{
        if (this.state.code1 != "" && this.state.code2 != "" && this.state.code3 != ""
            && this.state.code4 != "" && this.state.code5 != "") {
            this._showLoadingBox();
            let verifyCode = this.state.code1 + this.state.code2 + this.state.code3
                + this.state.code4 + this.state.code5;
            let dataObj = {
                request: rq_verify_sms_code,
                phone_num: this.state.userCountryCode+this.state.userPhone,
                verification_code: verifyCode,
            }
            console.log(dataObj);
            makeAPostRequest(dataObj,
                ()=>this._showLoadingBox(),
                ()=>this._closeLoadingBox(),
                (isSuccess, responseJson)=>{
                    if (isSuccess){
                        if (responseJson.is_registered) {
                            this.loginWithPhone(responseJson.auth_key);
                        } else {
                            this.props.navigation.navigate(PhoneRegistrationScreenName, {
                                userPhone: this.state.userPhone,
                                userCountryCode: this.state.userCountryCode,
                                authKey : responseJson.auth_key
                            })
                        }
                    } else {
                        alert (responseJson);
                    }
                })
        }
    }

    loginWithPhone = async (authKey) =>{
        this._showLoadingBox();
        let dataObj = {
            request: rq_login_with_phone,
            auth_key: authKey,
        }
        console.log(dataObj);
        makeAPostRequest(dataObj,
            ()=>this._showLoadingBox(),
            ()=>this._closeLoadingBox(),
            (isSuccess, responseJson)=>{
                if (isSuccess){
                    if (responseJson.type == userTypeClient){
                        this.saveUserInfo(responseJson);
                    } else {
                        Alert.alert(
                            langObj.appName,
                            langObj.errorUserTypeNotRight,
                            [
                                { text: "OK", onPress: () => {
                                        this.props.navigation.goBack();
                                    } 
                                }
                            ]
                        )
                    }
                } else {
                    alert (responseJson);
                }
            })
    }

    saveUserInfo = async (dataJson) =>{
        Keyboard.dismiss();
        try {
            let userInfo = {
                token: dataJson.token,
                type: dataJson.type,
                firstName: dataJson.first_name,
                lastName: dataJson.last_name,
                phoneNumber: this.state.userPhone
            };
            AsyncStorage.setItem(key_user_info, JSON.stringify(userInfo))
                .then(()=>{
                    // this.props.navigation.jumpTo(HomeScreenName, {
                    //     showSideMenu:true
                    // })
                    this.comeToNextScreen();
                });
        } catch (e) {
            alert (e);
        }
    }

    comeToNextScreen = async () => {
        try {
            const value = await AsyncStorage.getItem(key_screen_comeback);
            if(value != null) {
                // value previously stored
                if (value != "") {
                    this.props.navigation.navigate(value, {
                        "refresh": Date.parse(new Date())
                    });
                } else {
                    this.props.navigation.navigate(MainScreenName, {
                        refreshScreen: Date.parse(new Date())
                    });
                }
            } else {
                this.props.navigation.navigate(MainScreenName, {
                    refreshScreen: Date.parse(new Date())
                });
            }
            AsyncStorage.setItem(key_screen_comeback, "");
        } catch(e) {
            // error reading value
            this.props.navigation.navigate(MainScreenName, {
                refreshScreen: Date.parse(new Date())
            });
        }
    }

    sendSmsCodeAgain = async () => {
        let sendTime = await AsyncStorage.getItem(key_resend_password_time);
        if (sendTime != null && sendTime != "" && parseInt(sendTime) > 4) {
            alert (langObj.overMaxResendCode);
        } else {
            if (this.state.countDownTime <= 0) {
                this._showLoadingBox()
                let dataObj = {
                    request: rq_send_sms_code,
                    phone_num: this.state.userCountryCode+this.state.userPhone,
                }
                console.log(dataObj);
                makeAPostRequest(dataObj,
                    ()=>this._showLoadingBox(),
                    ()=>this._closeLoadingBox(),
                    (isSuccess, responseJson)=>{
                        if (isSuccess){
                            this.saveResendCodeCount();
                            this.setState({
                                countDownTime : 60
                            }, ()=>{
                                this.countDown();
                            })
                        } else {
                            alert (responseJson);
                        }
                    })
            }
        }
    }

    saveResendCodeCount = async () =>{
        let sendTime = await AsyncStorage.getItem(key_resend_password_time);
        if (sendTime != null && sendTime != "") {
            console.log("sendTime: " + sendTime);
            AsyncStorage.setItem(key_resend_password_time, (parseInt(sendTime) + 1) + "");
        } else {
            AsyncStorage.setItem(key_resend_password_time, "1");
        }
    }

    countDown = ()=>{
        if (this.state.countDownTime > 0) {
            setTimeout(()=>{
                this.setState({
                    countDownTime : this.state.countDownTime-1
                }, ()=>{
                    this.countDown();
                })
            }, 1000)
        }
    }


    render () {
        return (
            <KeyboardAvoidingView
                behavior={Platform.OS == "ios" ? "padding" : "height"}
                style={{flex:1, flexDirection:"column", height:screenHeight}}>
                <SearchHeaderBarFunc navigation={this.props.navigation} title={SmsVerificationScreenName} />
                <View style={{flexDirection:"column", alignItems:"center", justifyContent:'flex-start', flex:1}}>
                    <View style={[globalStyle.sectionTitleCenterContainer, {width:screenWidth*0.6}]}>
                        <Text style={[globalStyle.textSectionCenter]}>{langObj.verificationCode}</Text>
                    </View>
                    <Text style={[globalStyle.textBasicStyle, mStyle.textDescription, {alignSelf: 'center'}]}>{langObj.codeHaveBeenSentTo + " " + this.state.userPhone}</Text>
                    <View style={{flex:1}}/>
                    <View style={{flexDirection:'row-reverse', marginTop: 20, marginBottom: 20}}>
                        <View style={{flex:1}}/>
                        <TextInput
                            selectTextOnFocus
                            ref={this.code1}
                            selectionColor={c_cursor_textInput}
                            onChangeText={(text) => {
                                console.log("code 1 text input: " + text);
                                if (text.length == 5) {
                                    this.setState({
                                        code1:text.substring(0,1),
                                        code2:text.substring(1,2),
                                        code3:text.substring(2,3),
                                        code4:text.substring(3,4),
                                        code5:text.substring(4,5),
                                    }, ()=>{
                                        this.code5.current.focus();
                                        this.verifyCode();
                                    })
                                } else {
                                    if (text != "") {
                                        this.setState({code1:text});
                                        this.code2.current.focus();
                                    }
                                }
                            }}
                            style={[globalStyle.textBasicBoldStyle, mStyle.textVerificationCode,
                                {borderColor: this.state.isCode1Focus || this.state.code1 !="" ? c_text_green : c_dark_line}]}
                            onFocus={()=>{
                                this.setState({isCode1Focus: true})
                            }}
                            onBlur={()=>{
                                this.setState({isCode1Focus: false})
                            }}
                            onKeyPress={({ nativeEvent }) => {
                                if (nativeEvent.key === 'Backspace') {
                                    this.setState({code1: ""});
                                }
                            }}
                            keyboardType={'numeric'}
                            // maxLength={1}
                            autoFocus={false}
                            value={this.state.code1}
                        />
                        <TextInput
                            selectTextOnFocus
                            ref={this.code2}
                            selectionColor={c_cursor_textInput}
                            onChangeText={(text) => {
                                if (text != "") {
                                    this.setState({code2: text});
                                    this.code3.current.focus();
                                }
                            }}
                            style={[globalStyle.textBasicBoldStyle, mStyle.textVerificationCode,
                                {borderColor: this.state.isCode2Focus || this.state.code2 !="" ? c_text_green : c_dark_line}]}
                            onFocus={()=>{
                                this.setState({isCode2Focus: true})
                            }}
                            onBlur={()=>{
                                this.setState({isCode2Focus: false})
                            }}
                            onKeyPress={({ nativeEvent }) => {
                                if (nativeEvent.key === 'Backspace') {
                                    this.setState({code2: ""});
                                    this.code1.current.focus();
                                }
                            }}
                            keyboardType={'numeric'}
                            maxLength={1}
                            autoFocus={false}
                            value={this.state.code2}
                        />
                        <TextInput
                            selectTextOnFocus
                            ref={this.code3}
                            selectionColor={c_cursor_textInput}
                            onChangeText={(text) => {
                                if (text != "") {
                                    this.setState({code3: text});
                                    this.code4.current.focus();
                                }
                            }}
                            style={[globalStyle.textBasicBoldStyle, mStyle.textVerificationCode,
                                {borderColor: this.state.isCode3Focus || this.state.code3 !="" ? c_text_green : c_dark_line}]}
                            onFocus={()=>{
                                this.setState({isCode3Focus: true})
                            }}
                            onBlur={()=>{
                                this.setState({isCode3Focus: false})
                            }}
                            onKeyPress={({ nativeEvent }) => {
                                if (nativeEvent.key === 'Backspace') {
                                    this.setState({code3: ""});
                                    this.code2.current.focus();
                                }
                            }}
                            keyboardType={'numeric'}
                            maxLength={1}
                            autoFocus={false}
                            value={this.state.code3}
                        />
                        <TextInput
                            selectTextOnFocus
                            ref={this.code4}
                            selectionColor={c_cursor_textInput}
                            onChangeText={(text) => {
                                if (text != "") {
                                    this.setState({code4: text});
                                    this.code5.current.focus();
                                }
                            }}
                            style={[globalStyle.textBasicBoldStyle, mStyle.textVerificationCode,
                                {borderColor: this.state.isCode4Focus || this.state.code4 !="" ? c_text_green : c_dark_line}]}
                            onFocus={()=>{
                                this.setState({isCode4Focus: true})
                            }}
                            onBlur={()=>{
                                this.setState({isCode4Focus: false})
                            }}
                            onKeyPress={({ nativeEvent }) => {
                                if (nativeEvent.key === 'Backspace') {
                                    this.setState({code4: ""});
                                    this.code3.current.focus();
                                }
                            }}
                            keyboardType={'numeric'}
                            maxLength={1}
                            autoFocus={false}
                            value={this.state.code4}
                        />
                        <TextInput
                            selectTextOnFocus
                            ref={this.code5}
                            selectionColor={c_cursor_textInput}
                            onChangeText={(text) => {
                                if (text != "") {
                                    this.setState({code5: text}, () => {
                                        this.verifyCode();
                                    });
                                }
                            }}
                            style={[globalStyle.textBasicBoldStyle, mStyle.textVerificationCode,
                                {borderColor: this.state.isCode5Focus || this.state.code5 !="" ? c_text_green : c_dark_line}]}
                            onFocus={()=>{
                                this.setState({isCode5Focus: true})
                            }}
                            onBlur={()=>{
                                this.setState({isCode5Focus: false})
                            }}
                            onKeyPress={({ nativeEvent }) => {
                                if (nativeEvent.key === 'Backspace') {
                                    this.setState({code5: ""});
                                    this.code4.current.focus();
                                }
                            }}
                            keyboardType={'numeric'}
                            maxLength={1}
                            autoFocus={false}
                            value={this.state.code5}
                        />
                        <View style={{flex:1}}/>
                    </View>
                    <View style={{flexDirection: 'row', alignItems: 'center',  width:screenWidth}}>
                        <View style={{flex:1, alignItems: 'flex-start', marginStart:10}}>
                            <TouchableOpacity
                                onPress={()=>{
                                    Intercom.registerUnidentifiedUser().then(()=>{
                                        Intercom.displayMessageComposer()
                                    });
                                }}
                                style={{flexDirection: 'column', alignItems: 'center'}}>
                                <FastImage
                                    source={require("../image/icon_chat_circle.png")}
                                    resizeMode="contain"
                                    style={{
                                        width:screenWidth*0.12,
                                        height:screenWidth*0.12,
                                    }}
                                />
                                <Text style={[globalStyle.textBasicStyle, mStyle.textDescription,{marginTop: 0}]}>{langObj.chat}</Text>
                            </TouchableOpacity>
                        </View>
                        <Text style={[globalStyle.textBasicStyle, mStyle.textDescription]}>{langObj.codeNotArrived}</Text>
                        <TouchableOpacity
                            onPress={()=>{
                                this.sendSmsCodeAgain();
                            }}
                            style={{marginStart:5, borderBottomWidth:1, borderBottomColor: "#000000"}}>
                            <Text style={[globalStyle.textBasicStyle, mStyle.textDescription, {fontWeight:'bold'}]}>{this.state.countDownTime == 0 ? langObj.sendAgain:this.state.countDownTime}</Text>
                        </TouchableOpacity>
                        <View style={{flex:1}}/>
                    </View>
                    <View style={{flex:1}}/>
                    <TouchableOpacity
                        onPress={()=> {

                        }}
                        style={[globalStyle.buttonBlack, {marginTop: 20}]}>
                        <Text style={[globalStyle.textBasicBoldStyle, {fontSize:20, color:'white'}]}>{langObj.approve}</Text>
                    </TouchableOpacity>
                </View>
                <View style={{height:Platform.OS == "ios" ?40 :30}}/>
                <View style={{width:this.state.indicatorSizeW, height:this.state.indicatorSizeH, backgroundColor: greyHasOpacity,
                    flexDirection:"column",alignItems:"center", justifyContent:"center", position:"absolute"}}>
                    <ActivityIndicator animating={this.state.indicatorDisplay} size="large" color={c_loading_icon} />
                </View>
            </KeyboardAvoidingView>
        );
    }
}
let langObj = getLanguage();
const screenWidth = Math.round(Dimensions.get('window').width);
const screenHeight = Math.round(Dimensions.get('window').height);
const mStyle = StyleSheet.create({
    textDescription : {
        fontSize: 20,
        marginTop: 20,
    },
    textVerificationCode : {
        fontSize:24,
        textAlign: 'center',
        color:'#000000',
        borderRadius: 5,
        backgroundColor: "#ffffff",
        width:screenWidth*(1/7),
        height:screenWidth*(5/28),
        marginStart:5,
        marginEnd:5,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    }
})

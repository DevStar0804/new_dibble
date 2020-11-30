/*eslint prettier/prettier:0*/
/**
 * @format
 * @flow
 */

import * as React from 'react';
import {
    View,
    Text,
    Image,
    TextInput,
    Dimensions,
    ActivityIndicator,
    Alert,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    Keyboard,
    ScrollView,
    NativeModules,
    I18nManager,
} from 'react-native';
import {
    c_text_green,
    HomeScreenName,
    key_user_info,
    greyHasOpacity,
    c_loading_icon,
    c_bg_blue,
    c_bg_grey,
    c_label_grey,
    SearchResultScreenName,
    c_dark_line,
    c_dark_line_opacity,
    c_inactive_dot,
    PhoneRegistrationScreenName,
    SmsVerificationScreenName,
    rq_verify_sms_code,
    apiUrl,
    rc_success,
    rq_login_with_phone,
    rq_register_with_phone,
    isForceRTL,
    key_screen_comeback,
    MainScreenName,
    c_main_orange,
    c_grey_darker,
    c_text_grey,
    c_main_background, c_grey_light, c_cursor_textInput, c_red, EmailValidateScreenName,
} from '../resource/BaseValue';
import * as RNLocalize from "react-native-localize";
import { Switch } from 'react-native-switch';
import RNFloatingInput from '../comp/FloatingInput';
import AsyncStorage from '@react-native-community/async-storage';
import getLanguage from '../resource/LanguageSupport';
import {globalStyle} from '../resource/style/GlobalStyle';
import HeaderBarLandingFunc from './HeaderBarLandingFunc';
import SearchHeaderBarFunc from './SearchHeaderBarFunc';
import {getBackgroundColor} from 'react-native/Libraries/LogBox/UI/LogBoxStyle';
import FastImage from 'react-native-fast-image';
import { makeAPostRequest } from '../resource/SupportFunction';
import { inputHebrewRegExp, inputEmailRegExp } from '../resource/Config';

export default class PhoneRegistrationScreen extends React.Component {
    constructor (props) {
        super(props);
        this.firstNameInput = React.createRef();
        this.lastNameInput = React.createRef();
        this.emailInput = React.createRef();
        this.state = ({
            indicatorSizeW: 0,
            indicatorSizeH: 0,
            indicatorDisplay: false,
            userPhone:"",
            userCountryCode: "",
            firstName:"",
            lastName:"",
            email:"",
            isBusinessAccount:false,
            isReadTerm:false,
            canContinue: false,
            authKey:"",
            showInputError:false,
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
        allState.authKey = this.props.route.params.authKey;
        this.setState(allState, ()=>{
            this.firstNameInput.current.focus();
        });
    }

    componentWillReceiveProps(nextProps: Props, nextContext: *): * {
        if (this.props.route != null && this.props.route.params != null){
            setTimeout(()=>{
                let allState = this.state;
                allState.userPhone = this.props.route.params.userPhone;
                allState.userCountryCode = this.props.route.params.userCountryCode;
                allState.authKey = this.props.route.params.authKey;
                this.setState(allState);
            },500)
        }
    }

    checkEmailValid = (text) => {
        console.log(inputEmailRegExp.test(text));
        if (inputEmailRegExp.test(text) === false) {
          alert (langObj.emailIsNotRight);
          return false;
        } else {
          console.log("Email is Correct");
          return true;
        }
    }

    checkHebrewValid = (text) => {
        console.log(text);
        if (inputHebrewRegExp.test(text) === false) {
          alert (langObj.firstNameAndLastNameShouldBeHebrew);
          return false;
        } else {
          console.log("Email is Correct");
          return true;
        }
    }

    checkInvalidate = () =>{
        if (this.state.firstName != "" && this.state.lastName != ""
               && this.state.userPhone != ""
                && this.state.email != "" && this.state.isReadTerm){
            this.setState({canContinue: true});
        } else {
            this.setState({canContinue: false});
        }
    }

    registerWithPhone = async  () => {
        if (this.state.authKey != "") {
            this._showLoadingBox();
            let dataObj = {
                request: rq_register_with_phone,
                auth_key: this.state.authKey,
                first_name: this.state.firstName,
                last_name: this.state.lastName,
                email: this.state.email,
                is_business_acount: this.state.isBusinessAccount
            }
            console.log(dataObj);
            makeAPostRequest(dataObj,
                ()=>this._showLoadingBox(),
                ()=>this._closeLoadingBox(),
                (isSuccess, responseJson)=>{
                    if (isSuccess){
                        this.saveUserInfo(responseJson);
                    } else {
                        alert (responseJson);
                    }
                });
        }
    }

    saveUserInfo = async (dataJson) =>{
        Keyboard.dismiss();
        try {
            let userInfo = {
                token: dataJson.token,
                firstName: this.state.firstName,
                lastName: this.state.lastName,
                email: this.state.email,
                phoneNumber: this.state.userPhone
                // token:""
            };
            AsyncStorage.setItem(key_user_info, JSON.stringify(userInfo))
                .then(()=>{
                    // this.props.navigation.jumpTo(HomeScreenName, {
                    //     showSideMenu:true
                    // })
                    this.comeToNextScreen();
                });
        } catch (e) {
            this.props.navigation.jumpTo(HomeScreenName);
        }
    }

    comeToNextScreen = async () => {
        try {
            const value = await AsyncStorage.getItem(key_screen_comeback)
            if(value != null) {
                // value previously stored
                if (value != "") {
                    this.props.navigation.navigate(value, {
                        "refresh": Date.parse(new Date())
                    });
                } else {
                    this.props.navigation.navigate(EmailValidateScreenName, {
                        email: this.state.email
                    });
                }
            } else {
                this.props.navigation.navigate(EmailValidateScreenName, {
                    email: this.state.email
                });
            }
            AsyncStorage.setItem(key_screen_comeback, "");
        } catch(e) {
            // error reading value
            this.props.navigation.navigate(EmailValidateScreenName, {
                email: this.state.email
            });
            AsyncStorage.setItem(key_screen_comeback, "");
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
            <View style={{flex:1, flexDirection:"column", backgroundColor:'#ffffff'}}>
                <SearchHeaderBarFunc navigation={this.props.navigation} title={PhoneRegistrationScreenName}/>
                <ScrollView style={{backgroundColor:c_grey_light}}>
                    <View style={[globalStyle.sectionTitleContainer]}>
                        <View style={{flexDirection:'row', alignItems: "center", borderBottomColor:c_main_orange, borderBottomWidth:5, paddingBottom:5}}>
                            <Text style={[globalStyle.textBasicBoldStyle,globalStyle.textSection]}>{langObj.yourDetails}</Text>
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
                    <View style={{backgroundColor:"#ffffff", borderRadius:10, margin:20, paddingTop:10, paddingBottom:10, flexDirection: 'column'}}>
                        <View style={[mStyle.inputContainer]}>
                            <TextInput
                                ref={this.firstNameInput}
                                returnKeyType='next'
                                onSubmitEditing={()=>{
                                    this.lastNameInput.current.focus();
                                }}
                                style={[globalStyle.textBasicBoldStyle, mStyle.textInputContent]}
                                value={this.state.firstName}
                                selectionColor={c_cursor_textInput}
                                onChangeText={(text)=>{
                                    this.setState({firstName: text}, ()=>this.checkInvalidate());
                                }}/>
                        </View>
                        <Text style={[globalStyle.textBasicStyle, mStyle.textLabel]}>{langObj.firstName}</Text>
                        <Text style={[globalStyle.textBasicStyle, mStyle.textLabel, {color:c_red, display: this.state.firstName=="" && this.state.showInputError? "flex":"none"}]}>{langObj.mandatoryField}</Text>

                        <View style={[mStyle.inputContainer]}>
                            <TextInput
                                ref={this.lastNameInput}
                                returnKeyType='next'
                                onSubmitEditing={()=>{
                                    this.emailInput.current.focus();
                                }}
                                style={[globalStyle.textBasicBoldStyle, mStyle.textInputContent]}
                                value={this.state.lastName}
                                selectionColor={c_cursor_textInput}
                                onChangeText={(text)=>{
                                    this.setState({lastName: text}, ()=>this.checkInvalidate());
                                }}/>
                        </View>
                        <Text style={[globalStyle.textBasicStyle, mStyle.textLabel]}>{langObj.lastName}</Text>
                        <Text style={[globalStyle.textBasicStyle, mStyle.textLabel, {color:c_red, display: this.state.lastName=="" && this.state.showInputError? "flex":"none"}]}>{langObj.mandatoryField}</Text>
                        <View style={[mStyle.inputContainer]}>
                            <TextInput
                                ref={this.emailInput}
                                returnKeyType='next'
                                onSubmitEditing={()=>{

                                }}
                                style={[globalStyle.textBasicBoldStyle, mStyle.textInputContent]}
                                value={this.state.email}
                                keyboardType="email-address"
                                selectionColor={c_cursor_textInput}
                                onChangeText={(text)=>{
                                    this.setState({email: text}, ()=>this.checkInvalidate());
                                }}/>
                        </View>
                        <Text style={[globalStyle.textBasicStyle, mStyle.textLabel]}>{langObj.registerEmailDescription}</Text>
                        <Text style={[globalStyle.textBasicStyle, mStyle.textLabel, {color:c_red, display: this.state.email=="" && this.state.showInputError? "flex":"none"}]}>{langObj.mandatoryField}</Text>

                        <View style={[mStyle.inputContainer]}>
                            <Text style={[globalStyle.textBasicBoldStyle, mStyle.textInputContent]}>
                                {this.state.userPhone}
                            </Text>
                        </View>
                        <Text style={[globalStyle.textBasicStyle, mStyle.textLabel]}>{langObj.registerPhoneDescription}</Text>
                        <View style={{flexDirection: 'row', alignItems:'center'}}>
                            <Text style={[globalStyle.textBasicStyle, mStyle.textLabel, {marginEnd: 3}]}>{langObj.wantToChangePhone}</Text>
                            <TouchableOpacity
                                onPress={()=>{

                                }}
                                style={{borderBottomColor: c_main_orange, borderBottomWidth: 1}}>
                                <Text style={[globalStyle.textBasicStyle, mStyle.textHyperLink, {color: c_main_orange}]}>{langObj.clickHere}</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={[globalStyle.textBasicBoldStyle, mStyle.textSection]}>{langObj.customerType}</Text>
                        <View style={{flexDirection: 'row', marginStart:20, marginTop:10}}>
                            <TouchableOpacity
                                onPress={()=>{
                                    this.setState({
                                        isBusinessAccount: true
                                    }, ()=>this.checkInvalidate())
                                }}
                                style={{flexDirection: 'row', flex:1, alignItems:'center'}}>
                                <View style={[this.state.isBusinessAccount ? mStyle.checkedItems : mStyle.checkItems]}></View>
                                <Text style={[globalStyle.textBasicStyle, mStyle.textLabel, {marginStart: 5}]}>{langObj.customerTypeBusiness}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={()=>{
                                    this.setState({
                                        isBusinessAccount: false
                                    }, ()=>this.checkInvalidate())
                                }}
                                style={{flexDirection: 'row', flex:1, alignItems:'center'}}>
                                <View style={[!this.state.isBusinessAccount ? mStyle.checkedItems : mStyle.checkItems]}></View>
                                <Text style={[globalStyle.textBasicStyle, mStyle.textLabel, {marginStart: 5}]}>{langObj.customerTypePrivate}</Text>
                            </TouchableOpacity>
                        </View>
                        <Text style={[globalStyle.textBasicStyle, mStyle.textLabel]}>{langObj.customerTypeExplain}</Text>
                        <View style={{flexDirection: 'row', margin:20, alignItems:"center"}}>
                            <TouchableOpacity
                                onPress={()=>{
                                    let allState = this.state;
                                    allState.isReadTerm = ! allState.isReadTerm;
                                    this.setState(allState, ()=>this.checkInvalidate());
                                }}>
                                <FastImage
                                    source={this.state.isReadTerm ? require("../image/icon_checked_black.png") : require("../image/icon_checked_not_yellow.png")}
                                    resizeMode="contain"
                                    style={{
                                        width:screenWidth*0.08,
                                        height:screenWidth*0.08}}
                                />
                            </TouchableOpacity>
                            <Text style={[globalStyle.textBasicStyle, mStyle.textHyperLink, {color: !this.state.isReadTerm && this.state.showInputError ? c_red: c_text_grey }]}>{langObj.readAndApproveThe}</Text>
                            <TouchableOpacity
                                onPress={()=>{

                                }}
                                style={{borderBottomWidth:1, borderBottomColor: !this.state.isReadTerm  && this.state.showInputError ? c_red : c_text_grey}}>
                                <Text style={[globalStyle.textBasicStyle, mStyle.textHyperLink,{color: !this.state.isReadTerm  && this.state.showInputError ? c_red : c_text_grey}]}>{langObj.termOfService}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <TouchableOpacity
                        onPress={()=> {
                            if (this.state.canContinue) {
                                if (this.checkEmailValid(this.state.email)) {
                                    if (this.checkHebrewValid(this.state.firstName) && this.checkHebrewValid(this.state.lastName)) {
                                        this.registerWithPhone();
                                    }                                    
                                }
                            } else {
                                // alert(langObj.allFieldMandatory);
                                this.setState({showInputError:true});
                            }
                        }}
                        style={[globalStyle.buttonBlack, {backgroundColor: this.state.canContinue ? "#000000" : c_grey_darker }]}>
                        <Text style={[globalStyle.textBasicBoldStyle, {fontSize:20, color:'white'}]}>{langObj.approve}</Text>
                    </TouchableOpacity>
                </ScrollView>
                <View style={{width:this.state.indicatorSizeW, height:this.state.indicatorSizeH, backgroundColor: greyHasOpacity,
                    flexDirection:"column",alignItems:"center", justifyContent:"center", position:"absolute"}}>
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
    inputContainer : {
        flexDirection: 'row',
        width:screenWidth*0.7,
        marginStart: 20,
        marginTop: 10,
        marginBottom:5,
        borderBottomColor: c_grey_darker,
        borderBottomWidth:1,
    },
    textInputContent: {
        fontSize:18,
        lineHeight:20,
        color:c_text_grey,
        fontWeight:'bold',
        width:screenWidth*0.7,
        textAlign: I18nManager.isRTL || isForceRTL? "right" : "left"
    },
    textLabel: {
        marginStart:20,
        marginEnd:20,
        fontSize:16,
        color: c_text_grey
    },
    textHyperLink: {
        fontSize:16,
        marginEnd:3,
        color: c_text_grey,
        fontWeight:'bold'
    },
    textSection: {
        marginTop: 30,
        marginStart:20,
        fontSize:20,
        color: c_text_grey
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
    }
})

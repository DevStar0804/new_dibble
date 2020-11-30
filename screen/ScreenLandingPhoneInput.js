/*eslint prettier/prettier:0*/
/**
 * @format
 * @flow
 */

import * as React from 'react';
import {
    View, Text, TextInput,ScrollView,KeyboardAvoidingView,Platform,
    Dimensions, ActivityIndicator, TouchableOpacity, StyleSheet
} from 'react-native';
import {
    greyHasOpacity, c_loading_icon, c_main_orange, c_grey_light,
    rq_send_sms_code, SmsVerificationScreenName, c_cursor_textInput, LandingPhoneInputScreenName,
} from '../resource/BaseValue';
import * as RNLocalize from "react-native-localize";
import getLanguage from '../resource/LanguageSupport';
import {globalStyle} from '../resource/style/GlobalStyle';
import {makeAPostRequest, savePreviousScreen} from '../resource/SupportFunction';
import HeaderBarLandingFunc from './HeaderBarLandingFunc';
import SearchHeaderBarFunc from './SearchHeaderBarFunc';
import FastImage from 'react-native-fast-image';

export default class LandingPhoneInputScreen extends React.Component {
    constructor (props) {
        super(props);
        this.state = ({
            indicatorSizeW: 0,
            indicatorSizeH: 0,
            indicatorDisplay: false,
            showInputError:false,
            phoneNumber:""
        })
    }



    componentDidMount (){
        console.log(RNLocalize.getLocales());
        RNLocalize.addEventListener("change", () => {
            // do localization related stuff…
        });
        // if (this.props.route != null && this.props.route.params != null && this.props.route.params.previousScreen != null) {
        //     this.savePreviousScreen(this.props.route.params.previousScreen);
        // } else {
        //     this.savePreviousScreen("");
        // }
    }

    componentWillReceiveProps(nextProps: Props, nextContext: *): * {
        // setTimeout(()=>{
        //     if (this.props.route != null
        //         && this.props.route.params != null
        //         && this.props.route.params.previousScreen != null) {
        //         this.savePreviousScreen(this.props.route.params.previousScreen);
        //     }
        // }, 500);
    }

    // savePreviousScreen = async (screenName) => {
    //     console.log(key_screen_comeback + " " + screenName);
    //     AsyncStorage.setItem(key_screen_comeback, screenName);
    // }

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

    sendSmsCode = async  () => {
        this._showLoadingBox();
        let dataObj = {
            request: rq_send_sms_code,
            phone_num: this.state.phoneNumber,
        }
        console.log(dataObj);
        makeAPostRequest(
            dataObj,
            ()=>{this._showLoadingBox()},
            ()=>{this._closeLoadingBox()},
            (isSuccess, responseData)=>{
                if (isSuccess){
                    this.props.navigation.navigate(SmsVerificationScreenName, {
                        userPhone: this.state.phoneNumber,
                        userCountryCode: this.state.countryPhoneCode,
                    })
                } else {
                    alert(responseData)
                }
            }
        )
    }


    render () {
        return (
            <KeyboardAvoidingView
                behavior={Platform.OS == "ios" ? "padding" : "height"}
                style={{flex:1, flexDirection:"column", backgroundColor:c_grey_light}}>
                <SearchHeaderBarFunc navigation={this.props.navigation} title={LandingPhoneInputScreenName} />
                <View style={{flexDirection:"column", alignItems:"center", justifyContent:'flex-start', flex:1}}>
                    <View style={[globalStyle.sectionTitleCenterContainer]}>
                        <Text style={[globalStyle.textSectionCenter]}>{langObj.registerOrLogin}</Text>
                    </View>
                    <Text style={[globalStyle.textBasicStyle, mStyle.textDescription]}>{langObj.enterYourMobileNumber}</Text>
                    <View style={{flex:1}}></View>
                    <View style={{borderBottomWidth:2, borderBottomColor:c_main_orange, paddingBottom:10, width:screenWidth*0.8}}>
                        <TextInput
                            numberOfLines={1}
                            keyboardType="numeric"
                            selectionColor={c_cursor_textInput}
                            value={this.state.phoneNumber}
                            style={[globalStyle.textBasicBoldStyle, mStyle.inputPhone]}
                            onChangeText = {(text)=>{
                                if (text != "" && this.state.showInputError) {
                                    let allState = this.state;
                                    allState.showInputError = false;
                                    allState.phoneNumber = text;
                                    this.setState(allState);
                                } else {
                                    this.setState({phoneNumber: text})
                                }
                            }}
                            placeholder={langObj.yourPhoneNumber}
                        />
                    </View>
                    <Text style={[globalStyle.textBasicStyle, mStyle.textDescription,{marginTop: 10, color:'red'}]}>
                        {this.state.showInputError ? langObj.onlyNumberAllow : ""}
                    </Text>
                    <View style={{flex:1}}/>
                </View>
                <TouchableOpacity
                    onPress={()=> {
                        if (this.state.phoneNumber != "") {
                            this.sendSmsCode();
                        } else {
                            // alert (langObj.allFieldMandatory);
                            this.setState({showInputError: true})
                        }
                    }}
                    style={[globalStyle.buttonBlack]}>
                    <Text style={[globalStyle.textBasicBoldStyle, {fontSize:20, color:'white'}]}>{langObj.approve}</Text>
                </TouchableOpacity>
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
    textDescription: {
        marginTop: 20,
        alignSelf:'center',
        fontSize:20
    },
    inputPhone: {
        marginTop: 30,
        fontSize: 18,
        textAlign:'center'
    }
})

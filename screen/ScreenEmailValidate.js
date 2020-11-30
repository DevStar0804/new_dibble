/*eslint prettier/prettier:0*/
/**
 * @format
 * @flow
 */

import * as React from 'react';
import {
    View, Text, Platform, Dimensions, ActivityIndicator, TouchableOpacity, StyleSheet, Image,
} from 'react-native';
import {
    greyHasOpacity,
    c_loading_icon,
    c_grey_light,
    EmailValidateScreenName,
    rq_set_address_as_default,
    rc_token_expire,
    key_screen_comeback,
    MyAddressesScreenName,
    LandingStackName, rq_send_email_code, c_grey_darker,
} from '../resource/BaseValue';
import * as RNLocalize from "react-native-localize";
import getLanguage from '../resource/LanguageSupport';
import {globalStyle} from '../resource/style/GlobalStyle';
import SearchHeaderBarFunc from './SearchHeaderBarFunc';
import { Linking } from 'react-native'
import {makeAPostRequest} from '../resource/SupportFunction';
import AsyncStorage from '@react-native-community/async-storage';
import FastImage from 'react-native-fast-image';
import Intercom from 'react-native-intercom';
import { openInbox } from 'react-native-email-link'

export default class EmailValidateScreen extends React.Component {
    constructor (props) {
        super(props);
        this.state = ({
            indicatorSizeW: 0,
            indicatorSizeH: 0,
            indicatorDisplay: false,
            email:"",
            isCountDown:false,
            resendTime:0,
            countDownTime:60
        })
    }



    componentDidMount (){
        console.log(RNLocalize.getLocales());
        RNLocalize.addEventListener("change", () => {
            // do localization related stuff…
        });
        if (this.props.route != null && this.props.route.params != null && this.props.route.params.email != null) {
            this.setState({email:this.props.route.params.email})
        }
    }

    componentWillReceiveProps(nextProps: Props, nextContext: *): * {
        if (this.props.route != null && this.props.route.params != null && this.props.route.params.email != null) {
            setTimeout(()=>{
                this.setState({email:this.props.route.params.email})
            },500)
        }
    }

    resendEmailCode = async  () => {
        if (this.state.resendTime < 5 && !this.state.isCountDown) {
            let dataObj = {
                request: rq_send_email_code,
                email: this.state.email,
            }
            makeAPostRequest(dataObj,
                ()=>this._showLoadingBox(),
                ()=>this._closeLoadingBox(),
                (isSuccess, dataResponse)=>{
                    if (isSuccess) {
                        this.setState({
                            isCountDown:true
                        }, ()=>{this.countDown()})
                    } else {
                        alert(dataResponse);
                    }
                })
        } else {
            alert (langObj.overMaxResendEmail);
        }
    }

    countDown =  () => {
        if (this.state.countDownTime == 0) {
            this.setState({
                isCountDown:false,
                resendTime:this.state.resendTime + 1,
                countDownTime:60
            })
        } else {
            this.setState(
                {countDownTime: this.state.countDownTime-1},
                ()=>{setTimeout(()=>{this.countDown();},1000)}
                )
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
            <View
                style={{flex:1, flexDirection:"column", backgroundColor:c_grey_light}}>
                <SearchHeaderBarFunc navigation={this.props.navigation} title={EmailValidateScreenName} />
                <View style={{flex:1}}/>
                <FastImage
                    source={require("../image/icon_mail_validate.png")}
                    resizeMode="contain"
                    style={{
                        width:screenWidth*0.2,
                        height:screenWidth*0.2*(90/141), alignSelf: 'center'}}
                />
                <View style={{flexDirection:"column", alignItems:"center", justifyContent:'flex-start', marginTop:screenHeight*0.05}}>
                    <View style={[globalStyle.sectionTitleCenterContainer, {width:screenWidth*0.6}]}>
                        <Text style={[globalStyle.textSectionCenter]}>{langObj.verificationEmail}</Text>
                    </View>
                </View>
                <Text style={[globalStyle.textBasicStyle,mStyle.textDescription,{marginTop: 10, fontSize: 18}]}>{langObj.weSentEmail + " " + this.state.email}</Text>
                <Text style={[globalStyle.textBasicStyle,mStyle.textDescription,{marginTop: 5, fontSize: 18}]}>{langObj.weSentEmailExplain}</Text>
                <View style={{flex:1, flexDirection:'column', alignItems:'flex-start', justifyContent:'center'}}>
                    <TouchableOpacity
                        onPress={()=>{
                            Intercom.registerUnidentifiedUser().then(()=>{
                                Intercom.displayMessageComposer()
                            });
                        }}
                        style={{flexDirection: 'column', alignItems: 'center', marginStart:30}}>
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
                <View style={{flexDirection:'row', alignItems:'center', justifyContent:'center', marginBottom:10}}>
                    <Text style={[globalStyle.textBasicStyle, mStyle.textDescription]}>{langObj.emailNotArrive}</Text>
                    <TouchableOpacity
                        onPress={()=>{
                            this.resendEmailCode();
                        }}
                        style={{marginStart:5, borderBottomWidth:1, borderBottomColor: "#000000"}}>
                        <Text style={[globalStyle.textBasicStyle, mStyle.textDescription, {fontWeight:'bold',fontSize: 18}]}>{langObj.sendAgain}</Text>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity
                    onPress={()=> {
                        if (!this.state.isCountDown) {
                            // if (Platform.OS === 'android') {
                            //     Linking.openURL('mailto:')
                            // } else {
                            //     Linking.openURL('message:0');
                            // }
                            console.log("openInbox");
                            openInbox();
                        }
                    }}
                    style={[globalStyle.buttonBlack, {backgroundColor: this.state.isCountDown?c_grey_darker:"#000000"}]}>
                    <Text style={[globalStyle.textBasicBoldStyle, {fontSize:20, color:'white'}]}>{this.state.isCountDown?this.state.countDownTime:langObj.toMailbox}</Text>
                </TouchableOpacity>
                <View style={{height:Platform.OS == "ios" ?40 :30}}/>
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

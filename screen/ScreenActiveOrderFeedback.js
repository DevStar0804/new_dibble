/**
 * @format
 * @prettier
 */

import * as React from 'react';
import {
    View, Text, Image, StyleSheet, TextInput, Dimensions, KeyboardAvoidingView,
    TouchableOpacity, ActivityIndicator, I18nManager, FlatList,
} from 'react-native';
import {
    c_bg_search_box_dark,
    c_cursor_textInput,
    c_dark_line, c_dark_text, c_grey_darker, c_grey_light,
    c_loading_icon, c_main_background, c_main_orange, c_text_greeting, c_text_grey, greyHasOpacity, isForceRTL, key_screen_comeback,
    key_user_info, LandingStackName, MainScreenName, MyAddressesScreenName, OrderHistoryScreenName, PaymentMethodScreenName,
    PersonalZoneScreenName, ProductDetailScreenName, rc_token_expire, rq_get_my_order, rq_get_personal_area_info, rq_ignore_order_feedback, rq_send_order_feedback, SettingScreenName,
} from '../resource/BaseValue';
import AsyncStorage from '@react-native-community/async-storage';
import getLanguage, {getDesignDimension} from '../resource/LanguageSupport';
import { create } from 'react-native-pixel-perfect'
import { globalStyle } from '../resource/style/GlobalStyle';
import { makeAPostRequest } from '../resource/SupportFunction';
import moment from 'moment';
import 'moment/locale/he';
moment.locale('he')
import ViewPager from '@react-native-community/viewpager';
import ProductItem from './comp/ProductItem';
import OrderTotalCostComponent from './comp/OrderTotalCost';
import OrderStatusBarComponent from './comp/OrderStatusBar';
import SectionTitleComponents from './comp/SectionTitle';

export default class ActiveOrderFeedbackScreen extends React.Component {
    constructor (props) {
        super(props);
        this.orderStatusBar = React.createRef();
        this.state = ({
            indicatorSizeW: 0,
            indicatorSizeH: 0,
            indicatorDisplay: false,
            userInfo:{
                firstName:""
            },
            orderId:"",
            order : {
                
            },
            feedbackEmotionIndex:-1,
            notificationContent:"",
            requestCallBack : false
        })
    }


    componentDidMount (){
        if (this.props.route != null
            && this.props.route.params != null
            && this.props.route.params.orderId != null) {
            let allState = this.state;
            allState.orderId = this.props.route.params.orderId;
            this.setState(allState, ()=>{
                this.loadUserInfo();
            });
        } else {
            this.loadUserInfo();
        }

    }

    _onUnreadChange = ({ count }) => {
        console.log("Intercom: " + count);
    }

    componentWillReceiveProps() {
        if (this.props.route != null
            && this.props.route.params != null
            && this.props.route.params.orderId != null) {
            let allState = this.state;
            let orderId = this.props.route.params.orderId;
            orderId = orderId.replace ('"', '');
            allState.orderId = parseInt(orderId);
            this.setState(allState, ()=>{
                this.loadOrderDetails();
            });
        }
    }

    loadUserInfo = async  () => {
        try {
            const value = await AsyncStorage.getItem(key_user_info)
            if(value != null) {
                // value previously stored
                console.log("user info: " +  value);
                const jsonValue = JSON.parse(value);
                let allState = this.state;
                allState.userInfo = jsonValue;
                this.setState(allState, () => {
                   this.loadOrderDetails();
                });
            } else {

            }
        } catch(e) {
            // error reading value
        }
    }

    loadOrderDetails = async () => {
        if (this.state.orderId != "") {
            let dataObj = {
                request: rq_get_my_order,
                token: this.state.userInfo.token,
                order_id : this.state.orderId
            }
            makeAPostRequest( dataObj,
                ()=>{this._showLoadingBox()},
                ()=> {this._closeLoadingBox()},
                (isSuccess, responseJson)=>{
                    if (isSuccess) {
                        this.setState({
                            order: responseJson
                        }, ()=>{
                            this.orderStatusBar.current.update(this.state.order);
                        })
                    } else {
                        console.log(responseJson);
                    }
                })
        }
    }

    getOrderTypeContent = (type) => {
        let contentDisplay = "";
        if (this.state.order.order_types != null && this.state.order.order_types != "") {
            contentDisplay = this.state.order.order_types[type]
        }
        return contentDisplay;
    }

    getStatusMessage = () => {
        let displayText = "";
        switch (this.state.order.status) {
            case 1: 
                displayText = langObj.statusOrder1;
            break;

            case 2: 
                displayText = langObj.statusOrder1;
            break;

            case 3: 
                displayText = langObj.statusOrder2;
            break;

            case 4: 
                displayText = langObj.statusOrder2;
            break;

            case 5: 
                displayText = langObj.statusOrder3b;
            break;

            case 6: 
                displayText = langObj.statusOrder3a;
            break;

            case 7: 
                displayText = langObj.statusOrder4;
            break;
        }
        return displayText;
    }

    getEstimateTimeOfArrival = () =>{
        //let momentDeliveryTime = moment.utc(this.state.order.delivery_time).local();
        //let momentNow = moment();
        //let diffTime = momentDeliveryTime.diff(momentNow);
        //diffTime = - diffTime;
        //let tempTime = moment.duration(diffTime);
        //return tempTime.hours() + ":" + tempTime.minutes();
        return moment.utc(this.state.order.delivery_time).local().format("HH:mm")
    }

    sendFeedBack = async ()=>{
        if (this.state.feedbackEmotionIndex > 0) {
            let dataObj = {
                request: rq_send_order_feedback,
                token: this.state.userInfo.token,
                order_id : this.state.orderId,
                rating: this.state.feedbackEmotionIndex,
                request_call: this.state.requestCallBack,
                message: this.state.notificationContent
            }
            makeAPostRequest(dataObj,
                ()=>{this._showLoadingBox()},
                ()=>{this._closeLoadingBox()},
                (isSuccess, responseJson)=>{
                    this.props.navigation.navigate(MainScreenName, {
                        refreshScreen: moment(new Date()).millisecond
                    })
                })
        } else {
            alert (langObj.hearYourOpinion);
        }
    }

    ignoreFeedBack = async ()=>{
        let dataObj = {
            request: rq_ignore_order_feedback,
            token: this.state.userInfo.token,
            order_id : this.state.orderId,
        }
        makeAPostRequest(dataObj,
            ()=>{this._showLoadingBox()},
            ()=>{this._closeLoadingBox()},
            (isSuccess, responseJson)=>{
                this.props.navigation.navigate(MainScreenName, {
                    refreshScreen: moment(new Date()).millisecond
                })
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


    render () {
        return (
            <KeyboardAvoidingView
                behavior={Platform.OS == "ios" ? "padding" : "height"}
                style={{flex:1, flexDirection:"column", height:screenHeight, backgroundColor:c_main_background}}>
                <View style={[mStyle.mainContentContainer]}>
                    <TouchableOpacity
                        onPress={()=>{
                            this.ignoreFeedBack();
                        }}
                        style={[mStyle.buttonClose]}>
                        <Image
                            source={require("../image/icon_close_black.png")}
                            resizeMode="contain"
                            style={{width:screenWidth*0.03, height:screenWidth*0.03}}
                        />
                    </TouchableOpacity>
                    <OrderStatusBarComponent 
                        ref={this.orderStatusBar}
                        order={this.state.order}/>
                    <Text style={[globalStyle.textBasicBoldStyle, {fontSize:18, marginTop:10, textAlign:'center'}]}>
                        {langObj.hearYourOpinion} 
                    </Text>
                    <Text style={[globalStyle.textBasicStyle, {fontSize:15, marginTop:5, color:c_grey_darker, textAlign:'center'}]}>
                        {langObj.chooseRightQuestion} 
                    </Text>
                    <View style={{flexDirection:"row", alignItems:"center", justifyContent:"space-around", margin:20}}>
                        <TouchableOpacity 
                            onPress={()=>{
                                this.setState({
                                    feedbackEmotionIndex: 5
                                })
                            }}
                            style={[this.state.feedbackEmotionIndex==5 ? mStyle.feedBackItemSelected : mStyle.feedBackItem]}>
                            <Image
                                source={require("../image/feedback_5.png")}
                                resizeMode="contain"
                                style={{width:screenWidth*0.1, height:screenWidth*0.1}}
                            />
                            <Text style={[mStyle.feedBackLabel]}>{langObj.feedBackValue[4]}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={()=>{
                                this.setState({
                                    feedbackEmotionIndex: 4
                                })
                            }}
                            style={[this.state.feedbackEmotionIndex==4 ? mStyle.feedBackItemSelected : mStyle.feedBackItem]}>
                            <Image
                                source={require("../image/feedback_4.png")}
                                resizeMode="contain"
                                style={{width:screenWidth*0.1, height:screenWidth*0.1}}
                            />
                            <Text style={[mStyle.feedBackLabel]}>{langObj.feedBackValue[3]}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            onPress={()=>{
                                this.setState({
                                    feedbackEmotionIndex: 3
                                })
                            }}
                            style={[this.state.feedbackEmotionIndex==3 ? mStyle.feedBackItemSelected : mStyle.feedBackItem]}>
                            <Image
                                source={require("../image/feedback_3.png")}
                                resizeMode="contain"
                                style={{width:screenWidth*0.1, height:screenWidth*0.1}}
                            />
                            <Text style={[mStyle.feedBackLabel]}>{langObj.feedBackValue[2]}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            onPress={()=>{
                                this.setState({
                                    feedbackEmotionIndex: 2
                                })
                            }}
                            style={[this.state.feedbackEmotionIndex==2 ? mStyle.feedBackItemSelected : mStyle.feedBackItem]}>
                            <Image
                                source={require("../image/feedback_2.png")}
                                resizeMode="contain"
                                style={{width:screenWidth*0.1, height:screenWidth*0.1}}
                            />
                            <Text style={[mStyle.feedBackLabel]}>{langObj.feedBackValue[1]}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            onPress={()=>{
                                this.setState({
                                    feedbackEmotionIndex: 1
                                })
                            }}
                            style={[this.state.feedbackEmotionIndex==1 ? mStyle.feedBackItemSelected : mStyle.feedBackItem]}>
                            <Image
                                source={require("../image/feedback_1.png")}
                                resizeMode="contain"
                                style={{width:screenWidth*0.1, height:screenWidth*0.1}}
                            />
                            <Text style={[mStyle.feedBackLabel]}>{langObj.feedBackValue[0]}</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{height:20}}></View>
                    <SectionTitleComponents title={langObj.customerServiceNotification}/>
                    <TextInput
                        style={{width:screenWidth-40, margin:20, backgroundColor:"#ffffff", height:screenWidth*0.35}}
                        value={this.state.notificationContent}
                        selectionColor={c_cursor_textInput}
                        onChangeText={(text)=>{
                            this.setState({notificationContent: text});
                        }}
                    />
                    <TouchableOpacity 
                        onPress={()=>{
                            this.setState({
                                requestCallBack:!this.state.requestCallBack
                            })
                        }}
                        style={{flexDirection:'row', alignItems:'center', justifyContent:'flex-start', marginStart:20}}>
                        <View style={[this.state.requestCallBack?mStyle.dotCurrent:mStyle.dotNormal]}></View>
                        <Text style={[globalStyle.textBasicStyle, {fontSize:20, color:c_dark_text}]}>{langObj.requestGetBack}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        onPress={()=>{
                            this.sendFeedBack();
                        }}
                        style={[globalStyle.buttonBlack]}>
                        <Text style={[globalStyle.buttonBlackLabel]}>{langObj.send}</Text>
                    </TouchableOpacity>
                </View>
                <View style={{width:this.state.indicatorSizeW, height:this.state.indicatorSizeH, backgroundColor: greyHasOpacity,
                    flexDirection:"column",alignItems:"center", justifyContent:"center", position:"absolute",top:0,left:0}}>
                    <ActivityIndicator animating={this.state.indicatorDisplay} size="large" color={c_loading_icon} />
                </View>
            </KeyboardAvoidingView>
        );
    }
}

let langObj = getLanguage();
let perfectSize = create(getDesignDimension());
const screenWidth = Math.round(Dimensions.get('window').width);
const screenHeight = Math.round(Dimensions.get('window').height);
const mStyle = StyleSheet.create({
    statusBarContainer : {
        width:screenWidth-40,
        margin:20,
        padding:10,
        flexDirection:"column",
        alignItems:'center',
        justifyContent:'center',
        borderRadius:10,
        backgroundColor:"#ffffff"
    },
    statusBoxItem : {
        margin:5,
        height:10,
        flex:1
    },
    mainContentContainer:{
        flexDirection:'column'
    },
    buttonClose: {
        width:screenWidth*0.06,
        height:screenWidth*0.06,
        marginStart:20,
        borderRadius:screenWidth*0.03,
        borderColor: "#000000",
        backgroundColor:"#ffffff",
        borderWidth:1,
        flexDirection:"column",
        alignItems:'center',
        justifyContent:"center",
        margin:10
    },
    detailsContentContainer: {
        flexDirection:"column",
        padding:10,
        width:screenWidth,
        borderTopStartRadius:20,
        borderTopEndRadius:20,
        backgroundColor:"#ffffff",
        alignSelf:"flex-end"
    },
    sectionTitleContainer: {
        flexDirection: 'row',
        marginTop: 10,
    },
    textSection: {
        fontSize: 22,
        color: c_text_grey,
    },
    orderSummaryRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop:10,
        marginStart:10
    },
    orderSummaryText: {
        color:"#858586",
        fontSize:18,
        fontWeight:"bold",
        marginStart:5
    },
    orderSummaryTextValue: {
        color:"#858586",
        fontSize:15,
        marginStart:5,
        marginTop:3,
        flex:1,
        textAlign: I18nManager.isRTL || isForceRTL ? 'left' : 'right',
    },
    dotNormal: {
        width:screenWidth*0.06,
        height:screenWidth*0.06,
        borderRadius:screenWidth*0.06,
        backgroundColor:"#ffffff",
        borderColor:c_main_orange,
        borderWidth:2,
        margin:5
    },
    dotCurrent: {
        width:screenWidth*0.06,
        height:screenWidth*0.06,
        borderRadius:screenWidth*0.06,
        backgroundColor:"#ffffff",
        borderColor:c_main_orange,
        borderWidth:7,
        margin:5
    },
    feedBackItem: {
        flexDirection:'column',
        alignItems:"center",
        justifyContent:"center"
    },
    feedBackItemSelected: {
        flexDirection:'column',
        alignItems:"center",
        justifyContent:"center",
        borderBottomColor:c_main_orange,
        borderBottomWidth:2,
    },
    feedBackLabel : {
        fontSize:13, 
        marginTop:5, 
        color:c_grey_darker, 
        textAlign:'center'
    }
})

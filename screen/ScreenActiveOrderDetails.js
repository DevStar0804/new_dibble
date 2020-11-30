/**
 * @format
 * @prettier
 */

import * as React from 'react';
import {
    View, Text, Image, StyleSheet, ImageBackground, Dimensions, ScrollView,
    TouchableOpacity, ActivityIndicator, I18nManager, FlatList,
} from 'react-native';
import {
    c_bg_search_box_dark,
    c_dark_line, c_dark_text, c_grey_darker, c_grey_light,
    c_loading_icon, c_main_background, c_main_orange, c_text_greeting, c_text_grey, greyHasOpacity, isForceRTL, key_screen_comeback,
    key_user_info, LandingStackName, MyAddressesScreenName, OrderHistoryScreenName, PaymentMethodScreenName,
    PersonalZoneScreenName, pn_updateOrderStatus, ProductDetailScreenName, rc_token_expire, rq_get_my_order, rq_get_personal_area_info, SettingScreenName,
} from '../resource/BaseValue';
import AsyncStorage from '@react-native-community/async-storage';
import getLanguage, {getDesignDimension} from '../resource/LanguageSupport';
import { create } from 'react-native-pixel-perfect'
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import { globalStyle } from '../resource/style/GlobalStyle';
import { makeAPostRequest } from '../resource/SupportFunction';
import moment from 'moment';
import 'moment/locale/he';
moment.locale('he')
import Intercom from 'react-native-intercom';
import ViewPager from '@react-native-community/viewpager';
import ProductItem from './comp/ProductItem';
import OrderTotalCostComponent from './comp/OrderTotalCost';
import OrderStatusBarComponent from './comp/OrderStatusBar';
import SectionTitleComponents from './comp/SectionTitle';
import messaging from '@react-native-firebase/messaging';

export default class ActiveOrderDetailsScreen extends React.Component {
    constructor (props) {
        super(props);
        this.orderStatusBar = React.createRef();
        this.orderTotalCostComponent = React.createRef();
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
            addressInfo:{
                address : "",
                floor:"",
                appartment:"",
                type:1,
                notes:"",
                lat:31.7196864,
                lon:34.9729002,
                title:""
            },
            currentPage:0
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
        Intercom.addEventListener(Intercom.Notifications.UNREAD_COUNT, this._onUnreadChange);
        this.startListenPN();
    }

    _onUnreadChange = ({ count }) => {
        console.log("Intercom: " + count);
    }

    componentWillReceiveProps() {
        if (this.props.route != null
            && this.props.route.params != null
            && this.props.route.params.orderId != null) {
            let allState = this.state;
            allState.orderId = this.props.route.params.orderId;
            this.setState(allState);
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

    startListenPN = async  () =>{
        messaging().onMessage(async remoteMessage => {
            console.log('A new FCM message arrived! ' + JSON.stringify(remoteMessage.data));
            if (remoteMessage.data.action == pn_updateOrderStatus) {
                this.setState({
                    orderId: remoteMessage.data.order_id
                }, ()=>{
                    this.loadOrderDetails();
                })
            }
          });
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
                            this.orderTotalCostComponent.current.update(this.state.order.products, 100, 0);
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
                displayText = langObjstatusOrder3a;
            break;

            case 7: 
                displayText = langObjstatusOrder4;
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
            <View style={[StyleSheet.absoluteFillObject,{flex:1,flexDirection:"column", backgroundColor:c_main_background}]}>
                <MapView
                    provider={PROVIDER_GOOGLE}
                    style={StyleSheet.absoluteFillObject}
                    onRegionChange={(region)=>{
                        
                    }}
                    initialRegion={{
                        latitude: this.state.addressInfo.lat,
                        longitude: this.state.addressInfo.lon,
                        latitudeDelta: 0.25,
                        longitudeDelta: 0.25
                    }}>
                </MapView>
                <View style={[mStyle.mainContentContainer]}>
                    <TouchableOpacity 
                        onPress={()=>{
                            this.props.navigation.goBack();
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
                    <View style={{flex:1}}></View>
                    <TouchableOpacity
                        onPress={()=>{
                            Intercom.registerUnidentifiedUser().then(()=>{
                                Intercom.displayMessageComposer()
                            });
                        }}
                        style={{flexDirection: 'column', alignItems: 'center', alignSelf:"flex-start", marginStart:20}}>
                        <Image
                            source={require("../image/icon_chat_circle.png")}
                            resizeMode="contain"
                            style={{
                                width:screenWidth*0.12,
                                height:screenWidth*0.12,
                            }}
                        />
                        <Text style={[globalStyle.textBasicStyle, mStyle.textDescription,{marginTop: 0}]}>{langObj.chat}</Text>
                    </TouchableOpacity>
                    <View style={{flex:1}}></View>
                    <View style={[mStyle.detailsContentContainer, globalStyle.bgShadow, {height:screenWidth*0.9}]}>
                        <ViewPager
                            style={{flex:1}}
                            onPageSelected={(e)=>{
                                console.log(e.nativeEvent.position);
                                this.setState({
                                    currentPage: e.nativeEvent.position
                                })
                            }}
                            initialPage={this.state.currentPage}>
                            <View key="1" style={{flexDirection:"column"}}>
                                <SectionTitleComponents title={langObj.orderSummary}/>
                                <View style={[mStyle.orderSummaryRow]}>
                                    <Image
                                        source={require("../image/icon_order_number.png")}
                                        resizeMode="contain"
                                        style={{
                                            width:screenWidth*0.08,
                                            height:screenWidth*0.08}}
                                    />
                                    <Text style={[globalStyle.textBasicStyle, mStyle.orderSummaryText]}>{langObj.orderNumber}</Text>
                                    <Text numberOfLines={1} style={[globalStyle.textBasicStyle, mStyle.orderSummaryTextValue]}>{this.state.order.order_id}</Text>
                                </View>
                                <View style={[mStyle.orderSummaryRow]}>
                                    <Image
                                        source={require("../image/icon_delivery_time.png")}
                                        resizeMode="contain"
                                        style={{
                                            width:screenWidth*0.08,
                                            height:screenWidth*0.08}}
                                    />
                                    <Text style={[globalStyle.textBasicStyle, mStyle.orderSummaryText]}>{langObj.orderDate}</Text>
                                    <Text numberOfLines={1}  style={[globalStyle.textBasicStyle, mStyle.orderSummaryTextValue]}>{moment.utc(this.state.order.placed_on).local().format('dddd, DD.MM.YY kk:mm') }</Text>
                                </View>
                                <View style={[mStyle.orderSummaryRow]}>
                                    <Image
                                        source={require("../image/icon_ship_car_2.png")}
                                        resizeMode="contain"
                                        style={{
                                            width:screenWidth*0.08,
                                            height:screenWidth*0.08}}
                                    />
                                    <Text style={[globalStyle.textBasicStyle, mStyle.orderSummaryText]}>{langObj.typeOfShipment}</Text>
                                    <Text numberOfLines={1}  style={[globalStyle.textBasicStyle, mStyle.orderSummaryTextValue]}>{this.getOrderTypeContent(1)}</Text>
                                </View>
                                <View style={[mStyle.orderSummaryRow]}>
                                    <Image
                                        source={require("../image/icon_comments.png")}
                                        resizeMode="contain"
                                        style={{
                                            width:screenWidth*0.08,
                                            height:screenWidth*0.08}}
                                    />
                                    <Text style={[globalStyle.textBasicStyle, mStyle.orderSummaryText]}>{langObj.orderComments}</Text>
                                    <Text numberOfLines={1}  style={[globalStyle.textBasicStyle, mStyle.orderSummaryTextValue]}>{this.state.order.purpose}</Text>
                                </View>
                            </View>
                            <View key="2" style={{flexDirection:"column"}}>
                            <SectionTitleComponents title={langObj.orderDetail}/>
                                <FlatList
                                    style={{ marginTop:10}}
                                    data={this.state.order.products}
                                    showsVerticalScrollIndicator={false}
                                    renderItem={({item, index}) =>
                                        <View style={{flexDirection:"column"}}>
                                            <ProductItem product={item}></ProductItem>
                                            <View style={{width:screenWidth-60, height:1, backgroundColor:c_grey_light, alignSelf:"center"}}></View>
                                        </View>
                                    }
                                    keyExtractor={(item) => item.product_id}
                                />
                            </View>
                            <View key="3" style={{flexDirection:"column"}}>
                            <SectionTitleComponents title={langObj.orderDetail}/>
                                <View style={{flexDirection:"row", alignItems:"center", marginTop:10, marginStart:20}}>
                                    <Image
                                        source={require("../image/icon_card_black.png")}
                                        resizeMode="contain"
                                        style={{
                                            width:screenWidth*0.1,
                                            height:screenWidth*0.1}}
                                    />
                                    <View style={{flexDirection:'column', alignItems: 'flex-start', flex:1, margin:5}}>
                                        <Text numberOfLines={1} style={[globalStyle.textBasicBoldStyle,{fontSize:20}]}>{langObj.creditCard}</Text>
                                        <Text numberOfLines={1} style={[globalStyle.textBasicStyle,,{fontSize:18, color:c_grey_darker}]}>****המסתים בספרות 4165</Text>
                                    </View>
                                </View>
                                <OrderTotalCostComponent
                                    ref={this.orderTotalCostComponent}
                                    deliverCost={100}
                                    shippingFee={0}
                                    productList={this.state.order.products}
                                    style={{alignSelf:'flex-start'}}/>
                            </View>
                        </ViewPager>
                        <View style={{flexDirection:"row", alignSelf:'center'}}>
                            <View style={[this.state.currentPage == 0 ? mStyle.dotCurrent: mStyle.dotNormal]}></View>
                            <View style={[this.state.currentPage == 1 ? mStyle.dotCurrent: mStyle.dotNormal]}></View>
                            <View style={[this.state.currentPage == 2 ? mStyle.dotCurrent: mStyle.dotNormal]}></View>
                        </View>
                        <TouchableOpacity
                            onPress={()=>{
                                this.props.navigation.goBack();
                            }}
                            style={[globalStyle.buttonBlack, {display: this.state.currentPage==0? "flex":"none"}]}>
                            <Text style={[globalStyle.buttonBlackLabel]}>{langObj.close}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={{width:this.state.indicatorSizeW, height:this.state.indicatorSizeH, backgroundColor: greyHasOpacity,
                    flexDirection:"column",alignItems:"center", justifyContent:"center", position:"absolute",top:0,left:0}}>
                    <ActivityIndicator animating={this.state.indicatorDisplay} size="large" color={c_loading_icon} />
                </View>
            </View>
        );
    }
}

let langObj = getLanguage();
let perfectSize = create(getDesignDimension());
const screenWidth = Math.round(Dimensions.get('window').width);
const screenHeight = Math.round(Dimensions.get('window').height);
const mStyle = StyleSheet.create({
    mainContentContainer:{
        height:screenHeight,
        position:'absolute',
        backgroundColor:'rgba(12,12,12,0)',
        flexDirection:'column'
    },
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
        width:screenWidth*0.025,
        height:screenWidth*0.025,
        borderRadius:screenWidth*0.025,
        backgroundColor:"#ffffff",
        borderColor:"#000000",
        borderWidth:1,
        margin:5
    },
    dotCurrent: {
        width:screenWidth*0.025,
        height:screenWidth*0.025,
        borderRadius:screenWidth*0.025,
        backgroundColor:c_main_orange,
        borderColor:c_main_orange,
        borderWidth:1,
        margin:5
    }
})

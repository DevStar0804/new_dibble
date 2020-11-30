/**
 * @format
 * @eslint prettier/prettier
 */

import * as React from 'react';
import {
    View,
    FlatList,
    Text,
    ScrollView,
    Image,
    StyleSheet,
    ImageBackground,
    Dimensions,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    I18nManager,
    Keyboard,
    Linking,
    Platform
} from 'react-native';
import {
    c_grey_darker,c_grey_light,c_loading_icon,c_main_background,c_main_orange,CategoriesListScreenName,
    CategoryScreenName, deepLinkPrefix, greyHasOpacity, key_products_cart, key_recommend_for_user,
    key_user_info, MainScreenName, ProductDetailScreenName, rc_token_expire,
    rq_get_app_main_screen_banners, rq_verify_email_code, WebviewScreenName, rq_update_device_info, rq_get_my_active_orders, ActiveOrderDetailsScreenName, ActiveOrderFeedbackScreenName, pn_updateOrderStatus, key_screen_should_open, bg_shadow_color_24, key_orderCreated
} from '../resource/BaseValue';
import AsyncStorage from '@react-native-community/async-storage';
import getLanguage from '../resource/LanguageSupport';
import {globalStyle} from '../resource/style/GlobalStyle';
import {getTimeDiff, makeAPostRequest} from '../resource/SupportFunction';
import AutoHeightImage from 'react-native-auto-height-image';
import SearchHeaderBarFunc from './SearchHeaderBarFunc';
import { connect } from "react-redux";
import {callUpdateCart} from './redux/appCart';
import FastImage from 'react-native-fast-image';
import Intercom from 'react-native-intercom';
import messaging from '@react-native-firebase/messaging';
import moment from 'moment';

class MainScreen extends React.Component {
    constructor (props) {
        super(props);
        this.flatlist = React.createRef();
        this.state = ({
            searchText:"",
            screenLevel:1,
            isRefresh: true,
            indicatorSizeW: 0,
            indicatorSizeH: 0,
            indicatorDisplay: false,
            dataContent:{},
            refreshing:false,
            activeOrders : [],
            orderStatus: {},
            orderTypes: {}
        })
    }


    componentDidMount (){
        console.log("Mainscreen: componentDidMount")
        Linking.getInitialURL().then((ev) => {
            if (ev) {
                this._handleOpenURL(ev);
            }
        }).catch(err => {
            console.warn('An error occurred', err);
        });
        this.loadUserInfo();
        Linking.addEventListener('url', this._handleOpenURL);
        Keyboard.dismiss();
        if (Platform.OS == "ios") {
            this.requestUserPermission();
        } else {
            this.startListenToken();
        }
        Intercom.addEventListener(Intercom.Notifications.UNREAD_COUNT, this._onUnreadChange);
    }

    requestUserPermission = async () => {
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      
        if (enabled) {
          console.log('Authorization status:', authStatus);
          this.startListenToken();
        }
      }

    componentWillReceiveProps () {
        setTimeout(()=>{
            if (this.props.route != null
                && this.props.route.params != null
                && this.props.route.params.refreshScreen != null) {
                this.loadUserInfo().then(()=>{
                    this.loadMyActiveOrder();
                })
            }
        }, 500);
    }

    startListenToken = async  () =>{
        messaging()
            .getToken()
            .then((token) => {
                if (token != "") {
                    console.log('Device FCM Token: ', token);
                    Intercom.sendTokenToIntercom(token);
                    this.updateFcmToken(token);
                }
            });

        messaging().onTokenRefresh((token) => {
            if (token != "") {
                console.log('Device FCM Token: ', token);
                Intercom.sendTokenToIntercom(token);
                this.updateFcmToken(token);
            }
        });

        messaging().onNotificationOpenedApp(remoteMessage => {
            console.log(
                'Notification caused app to open from background state:',
                remoteMessage.data,
            );
            this.comeToActiveOrderDetail(remoteMessage.data.order_id, remoteMessage.data.status);
        });


    }

    updateFcmToken = async (fcmToken) =>{
        if (this.state.userInfo.token != null && this.state.userInfo.token != "") {
            let dataObj = {
                request : rq_update_device_info,
                token : this.state.userInfo.token,
                // token: "courier-token-xxx",
                device_id: fcmToken
            }
            makeAPostRequest(dataObj,
                ()=>{},
                ()=>{},
                (isSuccess, responseJson)=>{
                    
                })
        }
    }

    _onUnreadChange = ({ count }) => {
        console.log("Intercom: " + count);
    }

    _handleOpenURL  = (ev) =>{
        let fullLink = "";
        if (ev.url != null) {
            fullLink = ev.url;
        } else {
            fullLink = JSON.stringify(ev);
        }
        console.log ("deep link: " +JSON.stringify(ev));
        let verifyCode = fullLink.split(deepLinkPrefix)[1].replace('"','');
        let email = this.state.userInfo.email;
        let dataObj = {
            request: rq_verify_email_code,
            email: email,
            verification_code: verifyCode
        }
        makeAPostRequest(dataObj,
            ()=>this._showLoadingBox(),
            ()=>this._closeLoadingBox(),
            (isSuccess, dataResponse)=>{
                if (isSuccess){
                    if (dataResponse.is_registered) {
                        //this.loginWithPhone(dataResponse.auth_key);
                        console.log("this.loginWithPhone(dataResponse.auth_key)")
                    } else {
                        console.log("this.signup(dataResponse.auth_key)")
                    }
                } else {
                    this._closeLoadingBox();
                    alert (dataResponse.message);
                }
            })
    }

    loadUserInfo = async  () => {
        try {
            const value = await AsyncStorage.getItem(key_user_info)
            if(value != null) {
                // value previously stored
                console.log("ui: " + value);
                const jsonValue = JSON.parse(value);
                let allState = this.state;
                allState.userInfo = jsonValue;
                this.setState(allState, ()=>{this.loadBannerList()});
            } else {
                this.prepareUserInfo();
            }
        } catch(e) {
            // error reading value
            this.prepareUserInfo();
        }

    }

    prepareUserInfo = async () =>{
        try {
            let userInfo = {
                token:""
            };
            AsyncStorage.setItem(key_user_info, JSON.stringify(userInfo))
                .then(()=>{
                   this.loadUserInfo();
                });
        } catch (e) {
            this.loadUserInfo();
        }
    }

    loadBannerList = async () => {
        let dataObj = {
            request: rq_get_app_main_screen_banners,
            token: this.state.userInfo.token,
        }
        makeAPostRequest(
            dataObj,
            ()=>{this._showLoadingBox()},
            ()=> {this._closeLoadingBox()},
                (isSuccess, responseJson)=> {
                    if (isSuccess) {
                        let allState = this.state;
                        allState.dataContent = responseJson.items;
                        this.setState(allState, ()=>{this.preparingCart()});
                    } else {
                        if (responseJson == rc_token_expire) {
                            let allState = this.state;
                            allState.userInfo.token = "";
                            this.setState(allState, ()=>{
                                this.loadBannerList();
                            });
                            AsyncStorage.setItem(key_user_info, JSON.stringify(allState.userInfo));
                        } else {
                            console.log(responseJson.message);
                        }
                    }
                }
        );

    }

    preparingCart = async () =>{
        await AsyncStorage.setItem(key_recommend_for_user, JSON.stringify(this.state.dataContent.products));
        let cartStr = await AsyncStorage.getItem(key_products_cart);
        if (cartStr != null && cartStr != "") {
            let productLists = JSON.parse(cartStr);
            let amount = 0;
            for (let i = 0; i < productLists.length; i++) {
                amount = amount + productLists[i]['amount'];
            }
            this.props.callUpdateCart(amount);
        }
        this.loadMyActiveOrder();
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


    displayBannerList = () => {
        let bannerListView = [];
        let bannerJson = this.state.dataContent;
        let keysList = Object.keys(bannerJson);
        keysList.map((key)=> {
            if (key != "categories" && key != "products"){
                // is banner
                bannerListView.push(
                    <TouchableOpacity
                        onPress={()=>{
                            if (bannerJson[key]['category_id'] == null) {
                                this.props.navigation.navigate(WebviewScreenName,{
                                    link: bannerJson[key]['link']
                                })
                            } else {
                                this.props.navigation.navigate(CategoryScreenName,{
                                    category_id: bannerJson[key]['category_id'],
                                    category_name: bannerJson[key]['category_name'],
                                })
                            }
                        }}
                        style={[mStyle.bannerContainer]}>
                        <AutoHeightImage
                            source={{uri:bannerJson[key]['image']}}
                            width={screenWidth-40}/>
                    </TouchableOpacity>
                )

            } else if (key == "categories") {
                bannerListView.push(
                    <View style={{flexDirection:"column", marginBottom: 20}}>
                        <View style={[globalStyle.sectionTitleContainer]}>
                            <View style={{flexDirection:'row', alignItems: "center", borderBottomColor:c_main_orange, borderBottomWidth:5, paddingBottom:5}}>
                                <Text style={[globalStyle.textBasicBoldStyle,globalStyle.textSection]}>{langObj.categoriesTitle}</Text>
                                <Image
                                    source={I18nManager.isRTL || langObj.isRTL ? require("../image/icon_arrow_left_black_d2.png") : require("../image/icon_arrow_right_black_d2.png")}
                                    resizeMode="contain"
                                    style={{
                                        width:screenWidth*0.08,
                                        height:screenWidth*0.08* (108/156),marginStart:5}}
                                />
                            </View>
                            <View style={{flex:1}}/>
                        </View>
                        {this.displayCategorySlider(bannerJson[key])}
                        <TouchableOpacity
                            onPress={()=>{
                                this.comeToCategoriesListScreen();
                            }}
                            style={[globalStyle.sectionTitleContainer]}>
                            <View style={{flex:1}}/>
                            <Text style={[globalStyle.textBasicBoldStyle,mStyle.textMore]}>{langObj.moreCategories}</Text>
                        </TouchableOpacity>
                    </View>
                )
            } else if (key == "products" ) {
                bannerListView.push(
                    <View style={{flexDirection:"column", marginBottom: 20}}>
                        <View style={[globalStyle.sectionTitleContainer]}>
                            <View style={{flexDirection:'row', alignItems: "center", borderBottomColor:c_main_orange, borderBottomWidth:5, paddingBottom:5}}>
                                <Text style={[globalStyle.textBasicBoldStyle,globalStyle.textSection]}>{langObj.recommendForYou}</Text>
                                <Image
                                    source={I18nManager.isRTL || langObj.isRTL ? require("../image/icon_arrow_left_black_d2.png") : require("../image/icon_arrow_right_black_d2.png")}
                                    resizeMode="contain"
                                    style={{
                                        width:screenWidth*0.08,
                                        height:screenWidth*0.08* (108/156),marginStart:5}}
                                />
                            </View>
                            <View style={{flex:1}}/>
                        </View>
                        {this.displayProductList(bannerJson[key])}
                        <TouchableOpacity style={[globalStyle.sectionTitleContainer]}>
                            <View style={{flex:1}}/>
                            <Text style={[globalStyle.textBasicBoldStyle,mStyle.textMore]}>{langObj.moreProduct}</Text>
                        </TouchableOpacity>
                    </View>
                )
            }
        })
        return bannerListView;
    }

    comeToCategoriesListScreen = () => {
        this.props.navigation.navigate(CategoriesListScreenName);
    }

    displayCategorySlider = (categoryLists) => {
        let sliderView = [];
        for (let i = 0; i < categoryLists.length; i++) {
            let sliderItem = categoryLists[i];
            sliderView.push(
                <View style={{flexDirection:'column', marginTop:10, padding:10}}>
                    <View style={{flexDirection:'row', alignItems:'center', marginStart:10}}>
                        <Text style={[globalStyle.textBasicBoldStyle, mStyle.textCategory]}>{sliderItem.name}</Text>
                        <Image
                            source={I18nManager.isRTL || langObj.isRTL ? require("../image/icon_arrow_left_yellow_d2.png") : require("../image/icon_arrow_right_yellow_d2.png")}
                            resizeMode="contain"
                            style={{
                                width:screenWidth*0.08,
                                height:screenWidth*0.08* (108/156),marginStart:5}}
                        />
                    </View>
                    <Text style={[globalStyle.textBasicStyle, mStyle.textItemCount]}>{sliderItem.num_of_products + " " + langObj.productsFoundInThisCategory}</Text>
                    <FlatList
                        style={{ marginTop:10}}
                        data={sliderItem.children}
                        showsHorizontalScrollIndicator={false}
                        horizontal={true}
                        renderItem={({item, index}) =>
                            <TouchableOpacity
                                onPress={()=> {
                                    this.props.navigation.navigate(CategoryScreenName,{
                                        category_id: item.category_id,
                                        category_name: item.name
                                    })
                                }}
                                style={[mStyle.itemContainer]}>
                                <FastImage
                                    source={{uri:item.image}}
                                    resizeMode={FastImage.resizeMode.contain}
                                    style={{
                                        width:screenWidth*0.35,
                                        height:screenWidth*0.35,
                                        borderTopRightRadius:10,
                                        borderTopLeftRadius:10,
                                        alignSelf:'center'}}
                                />
                                <Text
                                    numberOfLines={1}
                                    style={[globalStyle.textItemName,{marginTop:10}]}>{item.name}</Text>
                            </TouchableOpacity>
                        }
                        keyExtractor={item => item.id}
                    />
                </View>
            );
        }
        return sliderView;
    }

    displayProductList = (productList) => {
        let sliderView = [];
        sliderView.push(
            <FlatList
                numColumns={2}
                style={{ marginTop:10}}
                data={productList}
                showsVerticalScrollIndicator={false}
                renderItem={({item, index}) =>
                    <TouchableOpacity
                        onPress={()=>{
                            this.props.navigation.navigate(ProductDetailScreenName, {product_id: item.product_id});
                        }}
                        style={[mStyle.itemContainerGallery]}>
                        <FastImage
                            source={{uri: item.image}}
                            resizeMode={FastImage.resizeMode.contain}
                            style={{width:screenWidth*0.2, height:screenWidth*0.3, margin:5}}
                        />
                        <Text
                            numberOfLines={3}
                            style={[globalStyle.textProductItemName,{flex:1, alignSelf:'center', textAlign:'center', margin:5}]}>{item.name}</Text>
                        <View style={{flexDirection: 'row', alignItems: 'flex-end', }}>
                            <Text
                                numberOfLines={1}
                                style={[globalStyle.textProductItemPrice]}>{item.price}</Text>
                            <Text
                                numberOfLines={1}
                                style={[globalStyle.textProductItemName, {marginStart:5}]}>{langObj.NIS}</Text>
                        </View>
                        <TouchableOpacity
                            onPress={()=>{
                                this.props.navigation.navigate(ProductDetailScreenName, {product_id: item.product_id});
                            }}
                            style={[mStyle.buttonBuy,{marginBottom:10}]}>
                            <Text style={[globalStyle.textBasicStyle,mStyle.buttonBuyText]}>{langObj.buy}</Text>
                        </TouchableOpacity>
                        <ImageBackground
                            source={require('../image/icon_logo.png')}
                            resizeMode="contain"
                            style={[mStyle.promotionContainer, {top:5,end:5,opacity: item.isOnSale?1:0}]}>
                            <Text style={[globalStyle.textBasicBoldStyle,mStyle.promotionText]}>{langObj.saleOfMonth}</Text>
                        </ImageBackground>
                    </TouchableOpacity>
                }
                keyExtractor={(item) => item.product_id}
            />
        )
        return sliderView;
    }

    loadMyActiveOrder = async () =>{
        let dataObj = {
            request: rq_get_my_active_orders,
            token: this.state.userInfo.token,
        }
        makeAPostRequest (dataObj, 
            ()=>{},
            ()=>{},
            (isSuccess , responseJson)=>{
                if (isSuccess) {
                   this.setState({
                       activeOrders: responseJson.orders,
                       orderStatus: responseJson.statuses,
                       orderTypes : responseJson.order_types,
                   }, ()=>{
                       this.checkScreenShouldOpen();
                   })
                } else {
                    this.setState({
                        activeOrders:[],
                        orderStatus: {},
                        orderTypes: {}
                    })
                }
            })
    }

    displayOrderFloating  () {
        let allState = this.state;
        let orderList = [];
        for (let i = 0; i < allState.activeOrders.length; i ++) {
            let orderItem = allState.activeOrders[i];
            console.log("orderItem:" + orderItem)
            let timeString = moment.utc(orderItem.delivery_time).local().format("HH:mm")
            // let momentDeliveryTime = moment.utc(orderItem.delivery_time).local();
            //let momentNow = moment();            
            //let timeString = getTimeDiff(momentNow, momentDeliveryTime, "YYYY-MM-DD HH:mm:ss");
            // let timeString = getTimeDiff(momentDeliveryTime, momentNow, "YYYY-MM-DD HH:mm:ss");
            orderList.push(
                <TouchableOpacity
                    onPress={()=>{
                        console.log("onPress:" + orderItem)
                        this.comeToActiveOrderDetail(orderItem.order_id, orderItem.status);
                    }}
                    style={[mStyle.orderFloatingItem]}>
                        <Text numberOfLines={1} style={[globalStyle.textBasicStyle, mStyle.orderFloatingStatus]}>{allState.orderTypes[orderItem['order_type'].toString()]}</Text>
                        <Text numberOfLines={1} style={[globalStyle.textBasicStyle, mStyle.orderFloatingTime]}>{timeString}</Text>
                </TouchableOpacity>
            )
        }
        return orderList;
    }

    checkScreenShouldOpen = async () =>{
        console.log("checkScreenShouldOpen");
        try {
            const value = await AsyncStorage.getItem(key_screen_should_open);
            if(value != null) {
                // value previously stored
                console.log("checkScreenShouldOpen: " + value);
                let jsonValue = JSON.parse(value);
                console.log("jsonValue.data: " + jsonValue.data.action);
                if (jsonValue.action != null && jsonValue.action == pn_updateOrderStatus) {
                    AsyncStorage.setItem(key_screen_should_open, "").then(()=>{
                        this.comeToActiveOrderDetail(jsonValue.order_id, jsonValue.status);
                    })
                } else if (jsonValue.data != null) {
                    // let action = JSON.parse(jsonValue.data.action);
                    if (jsonValue.data.action == pn_updateOrderStatus) {
                        console.log("data: " +jsonValue.data.order_id);
                        AsyncStorage.setItem(key_screen_should_open, "").then(()=>{
                            this.comeToActiveOrderDetail(jsonValue.data.order_id, jsonValue.data.status);
                        }) 
                    } 
                    else if (jsonValue.data.action == key_orderCreated){
                        AsyncStorage.setItem(key_screen_should_open, "").then(()=>{
                            this.comeToActiveOrderDetail(this.state.activeOrders[0].order_id,this.state.activeOrders[0].status);
                        }) 
                    }   
                    else {
                        console.log("jsonValue.data.action: " + jsonValue.data.action);
                    }
                } else {
                    // AsyncStorage.setItem(key_screen_should_open, "")
                    console.log("jsonValue.data in try is null");
                }
            } else {
                // AsyncStorage.setItem(key_screen_should_open, "")
                console.log("value in try is null");
            }
        } catch(e) {
            // error reading value
            // AsyncStorage.setItem(key_screen_should_open, "")
            console.log("value in catch is null: " + e);
        }
    }
    comeToActiveOrderDetail = (orderId, status) => {
        if (status == 7) {
            this.props.navigation.navigate (ActiveOrderFeedbackScreenName, {
                orderId: parseInt(orderId) ,
                refreshing:  moment(new Date()).millisecond
            })
        } else {
            this.props.navigation.navigate (ActiveOrderDetailsScreenName, {
                orderId: parseInt(orderId) ,
                refreshing:  moment(new Date()).millisecond
            })
        }
    }

    render () {
        return (
            <View style={{flex:1, flexDirection:"column", backgroundColor:c_main_background}}>
                <SearchHeaderBarFunc navigation={this.props.navigation} title={MainScreenName}/>
                <ScrollView
                    refreshControl={
                        <RefreshControl
                            refreshing={this.state.refreshing}
                            onRefresh={()=>{
                                this.loadBannerList();
                            }} />}
                >
                    <View style={{flexDirection:'row', width:screenWidth, marginBottom: 20, marginTop:10}}>
                        <TouchableOpacity style={[mStyle.titleContainer]}>
                            <Text style={[globalStyle.textBasicBoldStyle,mStyle.titleContainerText]}>{langObj.freeShippingIn24Hours}</Text>
                        </TouchableOpacity>
                    </View>
                    {this.displayBannerList()}
                </ScrollView>
                <ScrollView style={[mStyle.orderFloatingContainer]} 
                    showsVerticalScrollIndicator={false}
                    nestedScrollEnabled 
                    scrollEnabled>
                        {this.displayOrderFloating()}
                    </ScrollView>
                <View style={{width:this.state.indicatorSizeW, height:this.state.indicatorSizeH, backgroundColor: greyHasOpacity,
                    flexDirection:"column",alignItems:"center", justifyContent:"center", position:"absolute",top:0,left:0}}>
                    <ActivityIndicator animating={this.state.indicatorDisplay} size="large" color={c_loading_icon} />
                </View>
            </View>
        );
    }
}

const mapStateToProps = state =>  ({

});
const mapDispatchToProps = dispatch => {
    return {
        callUpdateCart: (amount)  => dispatch(callUpdateCart(amount))
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(MainScreen);

let langObj = getLanguage();
const screenWidth = Math.round(Dimensions.get('window').width);
const screenHeight = Math.round(Dimensions.get('window').height);
const mStyle = StyleSheet.create({
    titleContainer: {
        width: screenWidth-40,
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
        shadowColor: bg_shadow_color_24,
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.22,
        shadowRadius: 20,
        elevation: 7,
    },
    titleContainerText:{
        color:"#000000",
        fontSize:14,
    },
    textMore:{
        fontSize:18,
        color:c_main_orange
    },
    bannerContainer:{
        width:screenWidth-40,
        flexDirection:'row',
        marginStart:20,
        marginEnd: 20,
        marginBottom: 20
    },
    textCategory: {
        fontSize: 18,
        color:"#000000",

    },
    textItemCount: {
        fontSize: 16,
        color:c_grey_darker,
        marginStart: 10
    },
    itemContainer: {
        flexDirection:'column',
        width: screenWidth*0.35,
        height: screenWidth*0.45,
        alignItems:'center',
        justifyContent:'flex-start',
        padding:0,
        margin:10,
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
    itemContainerGallery :{
        //width:screenWidth,
        flex: 1,
        flexDirection: "column",
        alignItems:'center',
        justifyContent:'center',
        margin: 10,
        paddingStart:5,
        paddingEnd:5,
        paddingTop:10,
        paddingBottom:10,
        backgroundColor:'#ffffff',
        marginTop:10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    buttonBuy : {
        backgroundColor: "#000000",
        padding:10,
        marginTop: 10,
        width:screenWidth*0.2,
        alignItems: 'center',
        justifyContent: 'center'
    },
    buttonBuyText: {
        color:'#ffffff',
        fontSize:14,
        textAlign:'center'
    },
    promotionContainer: {
        width:screenWidth*0.1,
        height: screenWidth*0.1*(312/298),
        alignItems:'center',
        justifyContent:'center',
        position:'absolute'
    },
    promotionText: {
        fontSize:8,
        color:"#000000",
        textAlign:'center'
    },
    orderFloatingContainer:{
        height:screenHeight-(screenWidth*0.45),
        position:'absolute',
        top: screenWidth*0.25,
        end:10,
        flexDirection:"column"
    },
    orderFloatingStatus: {
        fontSize:8,
        textAlign:'center'
    },
    orderFloatingTime: {
        fontSize:19
    },
    orderFloatingItem : {
        flexDirection:'column',
        alignItems:'center',
        justifyContent:'center',
        marginTop:5,
        padding:5,
        width:screenWidth*0.15,
        height:screenWidth*0.15,
        borderRadius: screenWidth*0.1,
        borderWidth:3,
        borderColor:c_main_orange,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        backgroundColor: "#ffffff"
    }
})

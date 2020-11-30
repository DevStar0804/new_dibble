/**
 * @format
 * @eslint prettier/prettier
 */

import * as React from 'react';
import {
    View, Text, Image, ScrollView, TextInput, Dimensions, ActivityIndicator,
    TouchableOpacity, StyleSheet, FlatList, I18nManager, ImageBackground, Modal,
} from 'react-native';
import {
    key_user_info, greyHasOpacity, c_loading_icon, isForceRTL, c_text_header, c_main_orange, c_text_general,
    c_grey_darker, c_grey_light, rc_token_expire, OrderSummaryScreenName, MainScreenName,
    c_cursor_textInput, key_products_cart, rq_place_order_with_products, key_screen_comeback, LandingStackName,
    AddCardScreenName, rq_get_addresses, c_dark_line, rq_get_creditcards, AddAddressesScreenName,key_orderCreated,key_screen_should_open
} from '../resource/BaseValue';
import * as RNLocalize from "react-native-localize";
import AsyncStorage from '@react-native-community/async-storage';
import getLanguage, {getDesignDimension} from '../resource/LanguageSupport';
import FastImage from 'react-native-fast-image'
import {makeAPostRequest} from '../resource/SupportFunction';
import {globalStyle} from '../resource/style/GlobalStyle';
import SearchHeaderBarFunc from './SearchHeaderBarFunc';
import {callUpdateCart} from './redux/appCart';
import {connect} from 'react-redux';
import moment from 'moment';
import {create} from 'react-native-pixel-perfect';

class OrderSummaryScreen extends React.Component {
    constructor (props) {
        super(props);
        this.state = ({
            indicatorSizeW: 0,
            indicatorSizeH: 0,
            indicatorDisplay: false,
            isShowChangeAmount:false,
            isShowDeliveryDetail:false,
            isPickupSelected:false,
            orderId:0,
            productList:[],
            orderReason:"",
            orderComment:"",
            paymentSelectedPos:2,
            shippingAddress: 'זאב ז׳בוטינסקי 73, רמת גן',
            showSelectPaymentMethod: false,
            selectedCreditCardIndex:0,
            selectedAddressIndex:0,
            creditCardList:[

            ],
            addresses:[

            ],
            showSelectAddress:false,
        })
    }


    loadMyCard = async () => {
        if (this.state.userInfo.token != null && this.state.userInfo.token != "") {
            let data = {
                request : rq_get_creditcards,
                token : this.state.userInfo.token,
            }
            makeAPostRequest(data,
                ()=>this._showLoadingBox(),
                ()=>this._closeLoadingBox(),
                (isSuccess, dataResponse)=>{
                    if (isSuccess) {
                        let allState = this.state;
                        allState.creditCardList = dataResponse.creditcards;
                        allState.creditCardList.push({
                            creditcard_id: 0,
                            name: langObj.newCard,
                            content:langObj.addCreditCard,
                            type: 2,
                            notify_email: "",
                            card_num: "",
                            valid_thru_month: 0,
                            valid_thru_year: 0,
                            cvv: "",
                            is_default: 0
                        })
                        allState.showSelectPaymentMethod = true;
                        this.setState(allState);
                    } else {
                        if (dataResponse == rc_token_expire) {
                            AsyncStorage.setItem(key_screen_comeback, OrderSummaryScreenName);
                            this.props.navigation.navigate(LandingStackName,{
                                previousScreen: OrderSummaryScreenName
                            });
                        } else {
                            alert (dataResponse);
                        }
                    }
                })
        } else {
            AsyncStorage.setItem(key_screen_comeback, OrderSummaryScreenName);
            this.props.navigation.navigate(LandingStackName,{
                previousScreen: OrderSummaryScreenName
            });
        }
    }

    loadMyAddresses = async () => {
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
                    allState.addresses = dataResponse.addresses;
                    allState.addresses.push({
                        address_id:0,
                        title:langObj.newAddress,
                        address:langObj.addNewAddress,
                        floor:"",
                        appartment: "",
                        type : 0,
                        notes:""
                    })
                    allState.showSelectAddress = true;
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

    componentDidMount (){
        console.log(RNLocalize.getLocales());
        RNLocalize.addEventListener("change", () => {
            // do localization related stuff…
        });
        let allState = this.state;
        // allState.orderId = this.props.route.params.orderId;
        if (this.props.route != null
            && this.props.route.params != null
            && this.props.route.params.isPickupSelected != null){
                allState.isPickupSelected = this.props.route.params.isPickupSelected;
                if (allState.isPickupSelected) {
                    allState.shippingAddress = langObj.pickup + " " + langObj.titleOfPlace;
                }
            }
        this.setState(allState, ()=> {
            this.loadUserInfo();
        });
    }

    componentWillReceiveProps(){
        console.log("componentWillReceiveProps");
        console.log(this.props);
        setTimeout(()=>{
            if (this.props.route != null
                && this.props.route.params != null) {
                let allState = this.state;
                if (this.props.route.params.orderId != null) {
                    allState.orderId = this.props.route.params.orderId;
                }
                if (this.props.route.params.isPickupSelected != null) {
                    allState.isPickupSelected = this.props.route.params.isPickupSelected;
                    if (allState.isPickupSelected) {
                        allState.shippingAddress = langObj.pickup + " " + langObj.titleOfPlace;
                    }
                }
                if (this.props.route.params.previousScreen != null && this.props.route.params.previousScreen != "") {
                    if (this.props.route.params.previousScreen == AddCardScreenName) {
                        this.loadMyCard();
                    } else if (this.props.route.params.previousScreen == AddAddressesScreenName) {
                        this.loadMyAddresses();
                    }
                } else {
                    this.setState(allState, ()=>{
                        this.loadActiveOrder();
                    });
                }
            }
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
                this.setState(allState, () => {
                    this.loadActiveOrder();
                });
            } else {
                this.loadActiveOrder();
            }
        } catch(e) {
            // error reading value
            this.loadActiveOrder();
        }
    }

    loadActiveOrder = async () => {
        let productListStr = await AsyncStorage.getItem(key_products_cart);
        if (productListStr != null && productListStr != "") {
            let productListJson = JSON.parse(productListStr);
            let allState = this.state;
            allState.productList = [];
            for (let i = 0; i < productListJson.length; i++) {
                if (productListJson[i]['isSelected'] == null || productListJson[i]['isSelected']) {
                    let productItem = {
                        product_id : productListJson[i]['product_id'],
                        product_name : productListJson[i]['product_name'],
                        product_image : productListJson[i]['product_image'],
                        amount : productListJson[i]['amount'],
                        fAmount : productListJson[i]['amount'],
                        isSelected : productListJson[i]['isSelected'],
                    }
                    if (productListJson[i]['sale_price'] != null && productListJson[i]['sale_price'] != 0) {
                        productItem['price'] = productListJson[i]['sale_price'];
                    } else {
                        productItem['price'] = productListJson[i]['price'];
                    }
                    allState.productList.push(productItem);
                }
            }
            this.setState(allState, ()=>{
                if (!this.state.isPickupSelected) {
this.loadDefaultAddress().then(()=>{
                    this.loadDefaultCard();
                });
                }
            });
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

    loadDefaultCard = async () => {
        if (this.state.userInfo.token != null && this.state.userInfo.token != "") {
            let data = {
                request : rq_get_creditcards,
                token : this.state.userInfo.token,
            }
            makeAPostRequest(data,
                ()=>this._showLoadingBox(),
                ()=>this._closeLoadingBox(),
                (isSuccess, dataResponse)=>{
                    if (isSuccess) {
                        let allState = this.state;
                        allState.creditCardList = dataResponse.creditcards;
                        allState.creditCardList.push({
                            creditcard_id: 0,
                            name: langObj.newCard,
                            content:langObj.addCreditCard,
                            type: 2,
                            notify_email: "",
                            card_num: "",
                            valid_thru_month: 0,
                            valid_thru_year: 0,
                            cvv: "",
                            is_default: 0
                        })
                        for (let i = 0; i < allState.creditCardList.length; i++) {
                            if (allState.creditCardList[i]["is_default"]){
                                allState.selectedCreditCardIndex = i;
                            }
                        }
                        this.setState(allState);
                    } else {
                        if (dataResponse == rc_token_expire) {
                            AsyncStorage.setItem(key_screen_comeback, OrderSummaryScreenName);
                            this.props.navigation.navigate(LandingStackName,{
                                previousScreen: OrderSummaryScreenName
                            });
                        } else {
                            alert (dataResponse);
                        }
                    }
                })
        } else {
            AsyncStorage.setItem(key_screen_comeback, OrderSummaryScreenName);
            this.props.navigation.navigate(LandingStackName,{
                previousScreen: OrderSummaryScreenName
            });
        }
    }


    selectPaymentMethod = (methodIndex) => {
        this.setState({paymentSelectedPos: methodIndex});
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


    loadTotalOrderPrice = () => {
        let total = 0;
        for (let i = 0; i < this.state.productList.length; i++) {
            total = total + this.state.productList[i]['amount'] * this.state.productList[i]['price'];
        }
        return total.toFixed(1);
    }

    loadGrandTotalOrderPrice = (shippingFee) => {
        let total = 0;
        for (let i = 0; i < this.state.productList.length; i++) {
            total = total + this.state.productList[i]['amount'] * this.state.productList[i]['price'];
        }
        total = total + shippingFee;
        return total.toFixed(1);
    }

    displayAddressSelected = () =>{
        if (this.state.isPickupSelected) {
            return (
                <View
                        style={[mStyle.itemSectionContainer, {borderRadius:10}]}>
                        <ImageBackground
                            source={require("../image/icon_logo_grayscale.png")}
                            resizeMode="contain"
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
                        </ImageBackground>
                        <View style={{flexDirection:'column', flex:1}}>
                            <Text style={[globalStyle.textBasicBoldStyle,{fontSize:perfectSize(70)}]}>{langObj.pickup}</Text>
                            <View style={{flexDirection:'row', alignItems:'center', alignSelf: 'stretch'}}>
                                <FastImage
                                    source={require("../image/icon_pin_location.png")}
                                    resizeMode="contain"
                                    style={{
                                        width:screenWidth*0.02,
                                        height:screenWidth*0.02*(54/36)}}
                                />
                                <Text style={[globalStyle.textBasicStyle,mStyle.textNormalContent, {color:c_grey_darker, fontSize: perfectSize(45)}]}>{this.state.shippingAddress}</Text>
                            </View>
                        </View>
                    </View>
            );
        } else {
            return (
                <TouchableOpacity
                        onPress={()=>{
                            // this.props.navigation.navigate(ShippingInfoScreenName);
                            if (this.state.addresses.length == 0) {
                                this.loadMyAddresses();
                            } else {
                                this.setState({showSelectAddress: true})
                            }
                        }}
                        style={[mStyle.itemSectionContainer, {borderRadius:10}]}>
                        <ImageBackground
                            source={require("../image/icon_logo_grayscale.png")}
                            resizeMode="contain"
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
                        </ImageBackground>
                        <View style={{flexDirection:'column', flex:1}}>
                            <Text style={[globalStyle.textBasicBoldStyle,{fontSize:perfectSize(70)}]}>{langObj.deliveryUpTo24Hours}</Text>
                            <View style={{flexDirection:'row', alignItems:'center', alignSelf: 'stretch'}}>
                                <FastImage
                                    source={require("../image/icon_pin_location.png")}
                                    resizeMode="contain"
                                    style={{
                                        width:screenWidth*0.02,
                                        height:screenWidth*0.02*(54/36)}}
                                />
                                <Text style={[globalStyle.textBasicStyle,mStyle.textNormalContent, {color:c_grey_darker, fontSize: perfectSize(45)}]}>{this.state.shippingAddress}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
            );
        }
    }

    placeOrder = async () => {
        if (this.state.userInfo.token != null && this.state.userInfo.token != "") {
            let productList = [];
            for (let i = 0; i < this.state.productList.length; i++) {
                let productionItem = {
                    product_id: this.state.productList[i]['product_id'],
                    amount: this.state.productList[i]['amount']
                }
                productList.push(productionItem);
            }
            let creditcardId = this.state.creditCardList[this.state.selectedCreditCardIndex]["creditcard_id"];
            let dataObj = {
                request: rq_place_order_with_products,
                token: this.state.userInfo.token,
                order_type: 1,
                destination_address: this.state.shippingAddress,
                notes: this.state.orderComment,
                purpose : this.state.orderReason,
                products: productList,
                creditcard_id: creditcardId
            }

            console.log(dataObj);
            makeAPostRequest(dataObj,
                ()=>{this._showLoadingBox()},
                ()=>{this._closeLoadingBox()},
                (isSuccess, responseJson)=>{
                    if (isSuccess){
                        AsyncStorage.getItem(key_products_cart).then((productListStr)=>{
                            console.log(productListStr);
                            let jsonProduct = JSON.parse(productListStr);
                            let productRemains = [];
                            let amount = 0;
                            for (let i = 0; i < jsonProduct.length; i++) {
                                if (jsonProduct[i]['isSelected'] != null && !jsonProduct[i]['isSelected']) {
                                    productRemains.push(jsonProduct[i]);
                                    amount = amount + jsonProduct[i]['amount'];
                                }
                            }
                            if (productRemains.length > 0) {
                                AsyncStorage.setItem(key_products_cart, JSON.stringify(productRemains)).then(
                                    ()=>{
                                        this.props.callUpdateCart(amount);
                                        this.props.navigation.navigate(MainScreenName, {
                                            refreshScreen: moment(new Date()).millisecond
                                        });
                                    }
                                );
                            } else {
                                AsyncStorage.setItem(key_screen_should_open, JSON.stringify({data:{action:key_orderCreated}})).then(()=>{
                                    AsyncStorage.setItem(key_products_cart, "").then(
                                        ()=>{
                                            this.props.callUpdateCart(0);
                                            this.props.navigation.navigate(MainScreenName, {
                                                refreshScreen: moment(new Date()).millisecond
                                            });
                                        }
                                    );
                                }) 
                            }
                        })
                    } else {
                        if (responseJson == rc_token_expire) {
                            AsyncStorage.setItem(key_screen_comeback, OrderSummaryScreenName);
                            this.props.navigation.navigate(LandingStackName,{
                                previousScreen: OrderSummaryScreenName
                            });
                        } else {
                            alert (responseJson);
                        }
                    }
                }
            )
        } else {
                AsyncStorage.setItem(key_screen_comeback, OrderSummaryScreenName);
                this.props.navigation.navigate(LandingStackName,{
                    previousScreen: OrderSummaryScreenName
                });
        }
    }

    render () {
        return (
            <View style={{flex:1, flexDirection:"column", backgroundColor:c_grey_light}}>
                <SearchHeaderBarFunc navigation={this.props.navigation} title={OrderSummaryScreenName}/>
                <ScrollView style={{flex:1,width:screenWidth, paddingTop:10, paddingBottom:10}}>
                    <View style={[globalStyle.sectionTitleContainer]}>
                        <View style={{flexDirection:'row', alignItems: "center", borderBottomColor:c_main_orange, borderBottomWidth:5, paddingBottom:5}}>
                            <Text style={[globalStyle.textBasicBoldStyle,globalStyle.textSection]}>{langObj.orderSummary}</Text>
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
                    <FlatList
                        style={{ marginTop:0}}
                        data={this.state.productList}
                        extraData={this.state}
                        showsVerticalScrollIndicator={false}
                        renderItem={({item, index}) =>
                            <View style={[mStyle.itemSectionContainer]}>
                                <FastImage
                                    source={{uri:item.product_image}}
                                    resizeMode="contain"
                                    style={{
                                        width:screenWidth*0.15,
                                        height:screenWidth*0.15}}
                                />
                                <View style={{flexDirection:'column', marginStart:10, flex:1}}>
                                    <Text style={[globalStyle.textBasicStyle,mStyle.textNormalContent, {fontSize: perfectSize(60), color: c_dark_line}]}>{item.product_name}</Text>
                                    <View style={{flexDirection:'row', alignItems:'center',marginTop:10}}>
                                        <Text style={[globalStyle.textBasicStyle,mStyle.textNormalContent, {fontSize: perfectSize(50)}]}>{langObj.amount}</Text>
                                        <Text style={[globalStyle.textBasicBoldStyle,mStyle.textBoldContent, {marginStart:5,fontSize: perfectSize(50)}]}>{item.amount}</Text>
                                        <Text style={[globalStyle.textBasicStyle,mStyle.textNormalContent, {marginStart:30,fontSize: perfectSize(50)}]}>{langObj.price}</Text>
                                        <Text style={[globalStyle.textBasicBoldStyle, mStyle.textBoldContent,{marginStart:5,fontSize: perfectSize(50)}]}>{item.price}</Text>
                                        <Text style={[globalStyle.textBasicBoldStyle, mStyle.textBoldContent,{marginStart:5,fontSize: perfectSize(50)}]}>{langObj.priceUnit}</Text>
                                    </View>
                                </View>
                            </View>
                        }
                        keyExtractor={(item) => item.product_id}
                    />
                    <View style={[globalStyle.sectionTitleContainer]}>
                        <View style={{flexDirection:'row', alignItems: "center", borderBottomColor:c_main_orange, borderBottomWidth:5, paddingBottom:5}}>
                            <Text style={[globalStyle.textBasicBoldStyle,globalStyle.textSection]}>{langObj.orderReason}</Text>
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
                    <TextInput
                        style={[globalStyle.textBasicStyle, mStyle.textInput]}
                        numberOfLines={5}
                        multiline={true}
                        selectionColor={c_cursor_textInput}
                        value={this.state.orderReason}
                        placeholder={langObj.orderSummaryPurposePlaceholder}
                        onChangeText={(text)=>{
                            this.setState({orderReason: text})
                        }}
                    />
                    <View style={[globalStyle.sectionTitleContainer]}>
                        <View style={{flexDirection:'row', alignItems: "center", borderBottomColor:c_main_orange, borderBottomWidth:5, paddingBottom:5}}>
                            <Text style={[globalStyle.textBasicBoldStyle,globalStyle.textSection]}>{langObj.orderComments}</Text>
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
                    <TextInput
                        style={[globalStyle.textBasicStyle, mStyle.textInput]}
                        numberOfLines={5}
                        multiline={true}
                        selectionColor={c_cursor_textInput}
                        value={this.state.orderComment}
                        placeholder={langObj.orderSummaryCommentPlaceholder}
                        onChangeText={(text)=>{
                            this.setState({orderComment: text})
                        }}
                    />
                    <View style={[globalStyle.sectionTitleContainer]}>
                        <View style={{flexDirection:'row', alignItems: "center", borderBottomColor:c_main_orange, borderBottomWidth:5, paddingBottom:5}}>
                            <Text style={[globalStyle.textBasicBoldStyle,globalStyle.textSection]}>{langObj.shipping}</Text>
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
                    {this.displayAddressSelected()}
                    <View style={[globalStyle.sectionTitleContainer]}>
                        <View style={{flexDirection:'row', alignItems: "center", borderBottomColor:c_main_orange, borderBottomWidth:5, paddingBottom:5}}>
                            <Text style={[globalStyle.textBasicBoldStyle,globalStyle.textSection]}>{langObj.payment}</Text>
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
                    <TouchableOpacity
                        onPress={()=>{
                            if(this.state.paymentSelectedPos == 1){
                                if (this.state.creditCardList.length == 0) {
                                    this.loadMyCard();
                                } else {
                                    this.setState({showSelectPaymentMethod: true})
                                }
                            } else{
                                this.selectPaymentMethod(1);
                            }
                        }}
                        style={[mStyle.itemSectionContainer, {borderRadius:10}]}>
                        <View style={[this.state.paymentSelectedPos == 1 ? mStyle.checkedItems : mStyle.checkItems]}></View>
                        <FastImage
                            source={require("../image/icon_card_black.png")}
                            resizeMode="contain"
                            style={{
                                width:screenWidth*0.08,
                                height:screenWidth*0.08}}
                        />
                        <View style={{flexDirection:'column', marginStart:10, flex:1}}>
                            <Text style={[globalStyle.textBasicBoldStyle,{fontSize:perfectSize(70)}]}>{langObj.creditCard}</Text>
                            <View style={{flexDirection:'row', alignItems:'center'}}>
                                <Text numberOfLines={1} style={[globalStyle.textBasicStyle,mStyle.textNormalContent,{flexWrap: 'wrap',color:c_grey_darker, fontSize: perfectSize(45)}]}>
                                    {this.state.creditCardList.length > this.state.selectedCreditCardIndex?this.state.creditCardList[this.state.selectedCreditCardIndex]["name"]: langObj.creditCardEndWith + " ****4165"}
                                </Text>
                            </View>
                        </View>
                        <FastImage
                            source={I18nManager.isRTL || langObj.isRTL ? require("../image/icon_arrow_left_orange.png") : require("../image/icon_arrow_right_orange.png")}
                            resizeMode="contain"
                            style={{
                                width:perfectSize(30),
                                height:perfectSize(50),marginStart:5}}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={()=>{
                            this.selectPaymentMethod(2);
                        }}
                        style={[mStyle.itemSectionContainer, {borderRadius:10}]}>
                        <View style={[this.state.paymentSelectedPos == 2 ? mStyle.checkedItems : mStyle.checkItems]}></View>
                        <FastImage
                            source={require("../image/icon_dibble_coin.png")}
                            resizeMode="contain"
                            style={{
                                width:screenWidth*0.08,
                                height:screenWidth*0.08}}
                        />
                        <View style={{flexDirection:'column', marginStart:10, flex:1}}>
                            <Text style={[globalStyle.textBasicBoldStyle,{fontSize:perfectSize(70)}]}>{langObj.DibbleCoin}</Text>
                            <View style={{flexDirection:'row', alignItems:'center'}}>
                                <Text numberOfLines={1}  style={[globalStyle.textBasicStyle,mStyle.textNormalContent,{flexWrap: 'wrap',color:c_grey_darker, fontSize: perfectSize(45)}]}>{langObj.DibbleCoinDescription}</Text>
                            </View>
                        </View>
                        <FastImage
                            source={I18nManager.isRTL || langObj.isRTL ? require("../image/icon_arrow_left_orange.png") : require("../image/icon_arrow_right_orange.png")}
                            resizeMode="contain"
                            style={{
                                width:perfectSize(30),
                                height:perfectSize(50),marginStart:5}}
                        />
                    </TouchableOpacity>
                    <View style={[globalStyle.sectionTitleContainer]}>
                        <View style={{flexDirection:'row', alignItems: "center", borderBottomColor:c_main_orange, borderBottomWidth:5, paddingBottom:5}}>
                            <Text style={[globalStyle.textBasicBoldStyle,globalStyle.textSection]}>{langObj.summary}</Text>
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
                    <View style={[mStyle.labelContainer]}>
                        <Text style={[globalStyle.textBasicBoldStyle, mStyle.textLabel,{flex:1}]}>{langObj.orderAmount}</Text>
                        <Text style={[globalStyle.textBasicBoldStyle, mStyle.textLabel,]}>{this.loadTotalOrderPrice() + " " + langObj.priceUnit}</Text>
                    </View>
                    <View style={[mStyle.labelContainer]}>
                        <Text style={[globalStyle.textBasicBoldStyle, mStyle.textLabel,{flex:1}]}>{langObj.deliverCost}</Text>
                        <Text style={[globalStyle.textBasicBoldStyle, mStyle.textLabel,]}>{100 + " " + langObj.priceUnit}</Text>
                    </View>
                    <View style={[mStyle.labelContainer, {marginTop: 40}]}>
                        <Text style={[globalStyle.textBasicBoldStyle, mStyle.textLabel,{flex:1, color: c_grey_darker}]}>{langObj.shippingFee}</Text>
                        <Text style={[globalStyle.textBasicBoldStyle, mStyle.textLabel,{color: c_grey_darker}]}>{100  + " " + langObj.priceUnit}</Text>
                    </View>
                    <View style={[mStyle.labelContainer, {marginTop: 40}]}>
                        <Text style={[globalStyle.textBasicBoldStyle,{fontSize:24, flex:1}]}>{langObj.grandTotal}</Text>
                        <Text style={[globalStyle.textBasicBoldStyle,{fontSize:24}]}>{langObj.priceUnit + " " + this.loadGrandTotalOrderPrice(100)}</Text>
                    </View>
                    <TouchableOpacity
                        onPress={()=>{
                            this.placeOrder();
                        }}
                        style={[mStyle.buttonDarker]}>
                        <Text style={[globalStyle.textBasicBoldStyle, {color:"#ffffff", fontSize:24}]}>{langObj.makeOrder}</Text>
                    </TouchableOpacity>
                </ScrollView>
                <Modal
                    animationType="fade"
                    transparent
                    visible={this.state.showSelectPaymentMethod}>
                    <View style={{flexDirection: "column", height:'100%' ,justifyContent:'flex-end', backgroundColor:'rgba(0,0,0,0.8)'}}>
                        <TouchableOpacity
                            onPress={()=>{
                                this.setState({showSelectPaymentMethod: false})
                            }}
                            activeOpacity={1}
                            style={{flex:1, width:screenWidth}}
                        />
                        <View style={[mStyle.modalContainer]}>
                            <View style={[globalStyle.sectionTitleContainer]}>
                                <View style={{flexDirection:'row', alignItems: "center", borderBottomColor:c_main_orange, borderBottomWidth:5, paddingBottom:5}}>
                                    <Text style={[globalStyle.textBasicBoldStyle,globalStyle.textSection]}>{langObj.chooseCreditCard}</Text>
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
                            <FlatList
                                style={{ marginTop:0}}
                                data={this.state.creditCardList}
                                extraData={this.state}
                                showsVerticalScrollIndicator={true}
                                renderItem={({item, index}) =>{
                                    if (item.creditcard_id != "" && item.creditcard_id != 0) {
                                        return (
                                            <TouchableOpacity
                                                onPress={()=>{
                                                    this.setState({selectedCreditCardIndex: index})
                                                }}
                                                style={{flexDirection: 'row', alignItems: 'center', width:screenWidth-20, padding: 10}}>
                                                <View style={[this.state.selectedCreditCardIndex == index ? mStyle.checkedItems : mStyle.checkItems]}></View>
                                                <FastImage
                                                    source={require('../image/icon_visa.png')}
                                                    resizeMode="contain"
                                                    style={{
                                                        width:screenWidth*0.15,
                                                        height:screenWidth*0.15* (78/190),marginStart:5}}
                                                />
                                                <View style={{flexDirection: 'column', flex:1}}>
                                                    <Text style={[globalStyle.textBasicStyle, {fontSize:18}]}>{item.name}</Text>
                                                    <Text style={[globalStyle.textBasicStyle, {fontSize:18, color:c_grey_darker}]}>{item.content}</Text>
                                                </View>
                                            </TouchableOpacity>
                                        );
                                    } else {
                                        return (
                                            <TouchableOpacity
                                                onPress={()=>{
                                                    this.setState({selectedCreditCardIndex: index})
                                                }}
                                                style={{flexDirection: 'row', alignItems: 'center', width:screenWidth, padding: 10}}>
                                                <View style={[this.state.selectedCreditCardIndex == index ? mStyle.checkedItems : mStyle.checkItems]}></View>
                                                <Text style={[globalStyle.textBasicStyle, mStyle.textTitle]}>{langObj.addCreditCard}</Text>
                                            </TouchableOpacity>
                                        );
                                    }
                                }}
                                keyExtractor={(item) => item.creditcard_id}
                            />
                            <TouchableOpacity
                                onPress={()=>{
                                    if (this.state.selectedCreditCardIndex == this.state.creditCardList.length -1) {
                                        this.setState({
                                            selectedCreditCardIndex:0,
                                            showSelectPaymentMethod: false}, ()=>{
                                            this.props.navigation.navigate(AddCardScreenName,{
                                                refreshValue: moment().format('YYYY-MM-DD hh:mm:ss a'),
                                                previousScreen: OrderSummaryScreenName
                                            });
                                        });
                                        // console.log("AddCardScreenName");
                                        // this.props.navigation.navigate(AddCardScreenName,{
                                        //         refreshValue: moment().format('YYYY-MM-DD hh:mm:ss a'),
                                        //         previousScreen: OrderSummaryScreenName
                                        //     }
                                        // );
                                    } else {
                                        this.setState({
                                            showSelectPaymentMethod: false});
                                    }
                                }}
                                style={[mStyle.buttonDarker]}>
                                <Text style={[globalStyle.textBasicBoldStyle, {color:"#ffffff", fontSize:24}]}>{langObj.approve}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
                <Modal
                    animationType="fade"
                    transparent
                    visible={this.state.showSelectAddress}>
                    <View style={{flexDirection: "column", height:'100%' ,justifyContent:'flex-end', backgroundColor:'rgba(0,0,0,0.8)'}}>
                        <TouchableOpacity
                            onPress={()=>{
                                this.setState({showSelectAddress: false})
                            }}
                            activeOpacity={1}
                            style={{flex:1, width:screenWidth}}
                        />
                        <View style={[mStyle.modalContainer]}>
                            <View style={[globalStyle.sectionTitleContainer]}>
                                <View style={{flexDirection:'row', alignItems: "center", borderBottomColor:c_main_orange, borderBottomWidth:5, paddingBottom:5}}>
                                    <Text style={[globalStyle.textBasicBoldStyle,globalStyle.textSection]}>{langObj.myAddress}</Text>
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
                            <FlatList
                                style={{ marginTop:0}}
                                data={this.state.addresses}
                                extraData={this.state}
                                showsVerticalScrollIndicator={false}
                                renderItem={({item, index}) =>{
                                    if (item.address_id != "" && item.address_id != 0) {
                                        return (
                                            <TouchableOpacity
                                                onPress={()=>{
                                                    this.setState({selectedAddressIndex: index})
                                                }}
                                                style={{flexDirection: 'row', alignItems: 'center', width:screenWidth-20, padding: 10}}>
                                                <View style={[this.state.selectedAddressIndex == index ? mStyle.checkedItems : mStyle.checkItems]}></View>
                                                <FastImage
                                                    source={require('../image/icon_visa.png')}
                                                    resizeMode="contain"
                                                    style={{
                                                        width:screenWidth*0.15,
                                                        height:screenWidth*0.15* (78/190),marginStart:5}}
                                                />
                                                <View style={{flexDirection: 'column', flex:1, marginStart:10}}>
                                                    <Text style={[globalStyle.textBasicStyle, {fontSize:18}]}>{item.title}</Text>
                                                    <Text style={[globalStyle.textBasicStyle, {fontSize:18, color:c_grey_darker}]}>{item.address}</Text>
                                                </View>
                                            </TouchableOpacity>
                                        );
                                    } else {
                                        return (
                                            <TouchableOpacity
                                                onPress={()=>{
                                                    this.setState({selectedAddressIndex: index})
                                                }}
                                                style={{flexDirection: 'row', alignItems: 'center', width:screenWidth-20, padding: 10}}>
                                                <View style={[this.state.selectedAddressIndex == index ? mStyle.checkedItems : mStyle.checkItems]}></View>
                                                <Text style={[globalStyle.textBasicStyle, mStyle.textTitle]}>{langObj.addNewAddress}</Text>
                                            </TouchableOpacity>
                                        );
                                    }
                                }}
                                keyExtractor={(item) => item.address_id}
                            />
                            <TouchableOpacity
                                onPress={()=>{
                                    if (this.state.selectedAddressIndex == this.state.addresses.length -1) {
                                        this.setState({
                                            selectedAddressIndex:0,
                                            showSelectAddress: false,
                                            addresses:[]}, ()=>{
                                            this.props.navigation.navigate(AddAddressesScreenName,{
                                                refreshValue: moment().format('YYYY-MM-DD hh:mm:ss a'),
                                                previousScreen: OrderSummaryScreenName
                                            });
                                        });
                                    } else {
                                        this.setState({
                                            shippingAddress: this.state.addresses[this.state.selectedAddressIndex]['address'],
                                            showSelectAddress: false});
                                    }
                                }}
                                style={[mStyle.buttonDarker]}>
                                <Text style={[globalStyle.textBasicBoldStyle, {color:"#ffffff", fontSize:24}]}>{langObj.approve}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
                <View style={{width:this.state.indicatorSizeW, height:this.state.indicatorSizeH, backgroundColor: greyHasOpacity,
                    flexDirection:"column",alignItems:"center", justifyContent:"center", position:"absolute"}}>
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
export default connect(mapStateToProps, mapDispatchToProps)(OrderSummaryScreen);
let langObj = getLanguage();
let perfectSize = create(getDesignDimension());
const screenWidth = Math.round(Dimensions.get('window').width);
const screenHeight = Math.round(Dimensions.get('window').height);
const mStyle = StyleSheet.create({
    textNormalContent: {
        fontSize:18,
    },
    textBoldContent: {
        fontSize:14,
    },
    itemSectionContainer: {
        width:screenWidth-40,
        height:perfectSize(250),
        marginStart:20,
        marginTop:10,
        marginBottom:10,
        flexDirection:'row',
        padding:10,
        backgroundColor:"#ffffff",
        alignItems:'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    labelContainer: {
        flexDirection:'row',
        alignItems:'center',
        marginStart:30,
        marginEnd:20,
        marginTop:20
    },
    textLabel: {
        fontSize: 16,
        color:c_text_header,
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
    textInput: {
        width:screenWidth-40,
        minHeight: perfectSize(360),
        marginStart:20,
        marginTop:10,
        padding:5,
        backgroundColor:"#ffffff",
        color:c_text_general,
        fontSize:18,
        alignItems:"flex-start",
        textAlignVertical: 'top',
        textAlign:I18nManager.isRTL || isForceRTL ? 'right' : 'left',
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
    modalContainer: {
        flexDirection:'column',
        padding:10,
        borderTopLeftRadius:20,
        borderTopRightRadius:20,
        backgroundColor:"#ffffff",
        alignItems:'center',
        minHeight:screenWidth*0.5,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
})

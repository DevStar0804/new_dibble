/**
 * @format
 * @prettier
 */

import * as React from 'react';
import {
    View, Text, Image, ScrollView, Dimensions, ActivityIndicator,
    TouchableOpacity, StyleSheet, FlatList, I18nManager, ImageBackground, Vibration,
} from 'react-native';
import {
    key_user_info,
    greyHasOpacity,
    c_loading_icon,
    isForceRTL,
    c_text_header,
    ShippingInfoScreenName,
    c_main_orange,
    c_text_general,
    c_grey_darker,
    c_grey_light,
    OrderDetailsScreenName,
    c_dark_text, c_text_grey, c_dark_line, key_products_cart, MyCartScreenName,
} from '../resource/BaseValue';
import * as RNLocalize from "react-native-localize";
import AsyncStorage from '@react-native-community/async-storage';
import getLanguage, {getDesignDimension} from '../resource/LanguageSupport';
import FastImage from 'react-native-fast-image'
import {globalStyle} from '../resource/style/GlobalStyle';
import SearchHeaderBarFunc from './SearchHeaderBarFunc';
import moment from 'moment';
import 'moment/locale/he';
import {callUpdateCart} from './redux/appCart';
import {connect} from 'react-redux';
moment.locale('he')
import {create} from 'react-native-pixel-perfect';
import Intercom from 'react-native-intercom';
import ProductItem from './comp/ProductItem';

class OrderDetailsScreen extends React.Component {
    constructor (props) {
        super(props);
        this.state = ({
            indicatorSizeW: 0,
            indicatorSizeH: 0,
            indicatorDisplay: false,
            isShowChangeAmount:false,
            isShowDeliveryDetail:false,
            orderId:0,
            productList:[],
            orderReason:"",
            orderComment:"",
            paymentSelectedPos:2,
            shippingAddress: 'זאב ז׳בוטינסקי 73, רמת גן',
            orderItem: {
                order_id: 0,
                created_on: "",
                status: 2,
                placed_on: "",
                purpose: "",
                shipment_date: "",
                products: [
                    {
                        product_id: 44,
                        product_name: "",
                        price: 1.87,
                        amount: 1,
                        product_image: ""
                    }
                ],
                total_price: 1.87
            }
        })
    }



    componentDidMount (){
        console.log(RNLocalize.getLocales());
        RNLocalize.addEventListener("change", () => {
            // do localization related stuff…
        });
        let allState = this.state;
        allState.orderItem = this.props.route.params.orderItem;
        allState.statuses = this.props.route.params.statuses;
        allState.order_types = this.props.route.params.order_types;
        this.setState(allState, ()=> {
            this.loadUserInfo();
        });
    }

    componentWillReceiveProps(){
        console.log("componentWillReceiveProps");
        console.log(this.props);
        setTimeout(()=>{
            if (this.props.route != null
                && this.props.route.params != null
                && this.props.route.params.orderItem != null) {
                let allState = this.state;
                allState.orderItem = this.props.route.params.orderItem;
                allState.statuses = this.props.route.params.statuses;
                allState.order_types = this.props.route.params.order_types;
                this.setState(allState, ()=>{

                });
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

                });
            } else {

            }
        } catch(e) {
            // error reading value

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

    getStatusContent = (status) => {
        let contentDisplay = "";
        if (this.state.statuses != null) {
            const keys = Object.keys(this.state.statuses);
            for (let i = 0; i < keys.length && contentDisplay==""; i++) {
                if (keys[i] == status) {
                    contentDisplay = this.state.statuses[keys[i]]
                }
            }
        }
        return contentDisplay;
    }

    getOrderTypeContent = (type) => {
        let contentDisplay = "";
        if (this.state.order_types != null) {
            const keys = Object.keys(this.state.order_types);
            for (let i = 0; i < keys.length && contentDisplay==""; i++) {
                console.log(keys[i]);
                if (keys[i] == type) {
                    contentDisplay = this.state.order_types[keys[i]]
                }
            }
        }
        return contentDisplay;
    }

    reOrderProducts = async () =>{
        this._showLoadingBox();
        let productNeedBeAddedList = this.state.orderItem.products;
        let productsInCart = await AsyncStorage.getItem(key_products_cart);
        let productLists = [];
        if (productsInCart != null && productsInCart != "") {
            productLists = JSON.parse(productsInCart);
        }
        for (let x = 0; x < productNeedBeAddedList.length; x++) {
            let productItem = productNeedBeAddedList[x];
            if (productLists.length > 0) {
                let isAdded = false;
                if (productLists.length > 0) {
                    for (let i = 0; i < productLists.length && !isAdded; i++) {
                        if (productLists[i]['product_id'] == productItem.product_id) {
                            productLists[i]['amount'] = parseInt(productLists[i]['amount']) + productItem.amount;
                            isAdded = true;
                        }
                    }
                }
                if (!isAdded) {
                    let productItems = {
                        product_id : productItem.product_id,
                        amount : productItem.amount,
                        product_name : productItem.product_name,
                        price : productItem.price,
                        sale_price : productItem.price,
                        product_image : productItem.product_image
                    }
                    productLists.push(productItems);
                }
            } else {
                let productItems = {
                    product_id : productItem.product_id,
                    amount : productItem.amount,
                    product_name : productItem.product_name,
                    price : productItem.price,
                    sale_price : productItem.price,
                    product_image : productItem.product_image
                }
                productLists.push(productItems);
            }
        }
        AsyncStorage.setItem(key_products_cart, JSON.stringify(productLists)).then(
            ()=>{
                let amount = 0;
                for (let i = 0; i < productLists.length; i++) {
                    amount = amount + productLists[i]['amount'];
                }
                this.props.callUpdateCart(amount);
                Vibration.vibrate();
                let allState = this.state;
                allState.addedToCart = true;
                this.setState(allState, ()=>{
                    this.props.navigation.navigate(MyCartScreenName, {
                        refreshScreen: moment(new Date()).millisecond
                    })
                })
            }
        )
        this._closeLoadingBox();
    }


    loadTotalOrderPrice = () => {
        let total = 0;
        for (let i = 0; i < this.state.orderItem.products.length; i++) {
            total = total + this.state.orderItem.products[i]['amount'] * this.state.orderItem.products[i]['price'];
        }
        return total.toFixed(1);
    }

    loadGrandTotalOrderPrice = (shippingFee) => {
        let total = 0;
        for (let i = 0; i < this.state.orderItem.products.length; i++) {
            total = total + this.state.orderItem.products[i]['amount'] * this.state.orderItem.products[i]['price'];
        }
        total = total + shippingFee;
        return total.toFixed(1);
    }


    render () {
        return (
            <View style={{flex:1, flexDirection:"column", backgroundColor:c_grey_light}}>
                <SearchHeaderBarFunc navigation={this.props.navigation} title={OrderDetailsScreenName}/>
                <ScrollView style={{flex:1,width:screenWidth, paddingTop:10, paddingBottom:10}}>
                    <Text style={[globalStyle.textBasicBoldStyle, mStyle.textOrderReason]}>{this.state.orderItem.purpose}</Text>
                    <Text style={[globalStyle.textBasicStyle, mStyle.textStatus]}>{this.getStatusContent(this.state.orderItem.status)}</Text>
                    <View style={{backgroundColor:"#ffffff", margin:20}}>
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
                        <View style={[mStyle.orderSummaryRow]}>
                            <FastImage
                                source={require("../image/icon_order_number.png")}
                                resizeMode="contain"
                                style={{
                                    width:screenWidth*0.08,
                                    height:screenWidth*0.08}}
                            />
                            <Text style={[globalStyle.textBasicStyle, mStyle.orderSummaryText]}>{langObj.orderNumber}</Text>
                            <Text numberOfLines={1} style={[globalStyle.textBasicStyle, mStyle.orderSummaryTextValue]}>{this.state.orderItem.order_id}</Text>
                        </View>
                        <View style={[mStyle.orderSummaryRow]}>
                            <FastImage
                                source={require("../image/icon_delivery_time.png")}
                                resizeMode="contain"
                                style={{
                                    width:screenWidth*0.08,
                                    height:screenWidth*0.08}}
                            />
                            <Text style={[globalStyle.textBasicStyle, mStyle.orderSummaryText]}>{langObj.orderDate}</Text>
                            <Text numberOfLines={1}  style={[globalStyle.textBasicStyle, mStyle.orderSummaryTextValue]}>{moment.utc(this.state.orderItem.placed_on).local().format('dddd, DD.MM.YY kk:mm') }</Text>
                        </View>
                        <View style={[mStyle.orderSummaryRow]}>
                            <FastImage
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
                            <FastImage
                                source={require("../image/icon_comments.png")}
                                resizeMode="contain"
                                style={{
                                    width:screenWidth*0.08,
                                    height:screenWidth*0.08}}
                            />
                            <Text style={[globalStyle.textBasicStyle, mStyle.orderSummaryText]}>{langObj.orderComments}</Text>
                            <Text numberOfLines={1}  style={[globalStyle.textBasicStyle, mStyle.orderSummaryTextValue]}>{this.state.orderItem.purpose}</Text>
                        </View>
                    </View>
                    <View style={[globalStyle.sectionTitleContainer]}>
                        <View style={{flexDirection:'row', alignItems: "center", borderBottomColor:c_main_orange, borderBottomWidth:5, paddingBottom:5}}>
                            <Text style={[globalStyle.textBasicBoldStyle,globalStyle.textSection]}>{langObj.orderItem}</Text>
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
                        style={{ margin:20, backgroundColor:"#ffffff"}}
                        data={this.state.orderItem.products}
                        extraData={this.state}
                        showsVerticalScrollIndicator={false}
                        renderItem={({item, index}) =>
                            <ProductItem product={item}></ProductItem>
                        }
                        keyExtractor={(item) => item.product_id}
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
                    <TouchableOpacity
                        activeOpacity={1}
                        onPress={()=>{
                            // this.props.navigation.navigate(ShippingInfoScreenName);
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
                        <View style={{flexDirection:'column'}}>
                            <Text style={[globalStyle.textBasicBoldStyle,{fontSize:perfectSize(70)}]}>{this.getOrderTypeContent(1)}</Text>
                            <View style={{flexDirection:'row', alignItems:'center'}}>
                                <FastImage
                                    source={require("../image/icon_pin_location.png")}
                                    resizeMode="contain"
                                    style={{
                                        width:screenWidth*0.02,
                                        height:screenWidth*0.02*(54/36)}}
                                />
                                <Text style={[globalStyle.textBasicStyle,mStyle.textContentCustom]}>{this.state.shippingAddress}</Text>
                            </View>
                        </View>
                        <View style={{flex:1}}/>
                    </TouchableOpacity>
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
                    <View
                        style={[mStyle.itemSectionContainer, {borderRadius:10}]}>
                        <ImageBackground
                            source={require("../image/icon_logo_grayscale.png")}
                            resizeMode="contain"
                            style={{
                                width:screenWidth*0.15, height:screenWidth*0.15*(312/298),
                                alignItems:'center', justifyContent: 'center'}}>
                            <FastImage
                                source={require("../image/icon_card_black.png")}
                                resizeMode="contain"
                                style={{
                                    width:screenWidth*0.09, height:screenWidth*0.09*(74/103),}}
                            />
                        </ImageBackground>
                        <View style={{flexDirection:'column'}}>
                            <Text style={[globalStyle.textBasicBoldStyle,{fontSize:perfectSize(70)}]}>{langObj.creditCard}</Text>
                            <View style={{flexDirection:'row', alignItems:'center'}}>
                                <Text style={[globalStyle.textBasicStyle,mStyle.textContentCustom]}>4165****</Text>
                            </View>
                        </View>
                        <View style={{flex:1}}/>
                        <FastImage
                            source={I18nManager.isRTL || langObj.isRTL ? require("../image/icon_arrow_left_black.png") : require("../image/icon_arrow_right_black.png")}
                            resizeMode="contain"
                            style={{
                                width:screenWidth*0.08,
                                height:screenWidth*0.08* (108/156),marginStart:5}}
                        />
                    </View>
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
                        <Text style={[globalStyle.textBasicBoldStyle, mStyle.textLabel,{color: c_grey_darker}]}>{100 + " " + langObj.priceUnit}</Text>
                    </View>
                    <View style={[mStyle.labelContainer, {marginTop: 40}]}>
                        <Text style={[globalStyle.textBasicBoldStyle,{fontSize:perfectSize(65), flex:1}]}>{langObj.totalWithVAT}</Text>
                        <Text style={[globalStyle.textBasicBoldStyle,{fontSize:perfectSize(65)}]}>{this.loadGrandTotalOrderPrice(100)  + " " + langObj.priceUnit}</Text>
                    </View>
                    <View style={{flexDirection:'column', marginStart:10}}>
                        <TouchableOpacity
                            onPress={()=>{
                                this.reOrderProducts();
                            }}
                            style={[mStyle.orderSummaryRow, {marginTop: 10}]}>
                            <FastImage
                                source={require("../image/icon_reorder.png")}
                                resizeMode="contain"
                                style={{
                                    width:screenWidth*0.08,
                                    height:screenWidth*0.08}}
                            />
                            <Text style={[globalStyle.textBasicStyle, mStyle.textOtherAction]}>{langObj.repeatOrder}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={()=>{
                                if (this.state.userInfo.token != null && this.state.userInfo.token != "") {
                                    Intercom.registerIdentifiedUser({ userId:this.state.userInfo.phoneNumber ,email: this.state.userInfo.email})
                                        .then (()=>{
                                            let phoneNumber = "";
                                            if (this.state.userInfo.phoneNumber != null) {
                                                phoneNumber = this.state.userInfo.phoneNumber
                                            }
                                            Intercom.updateUser({
                                                // Pre-defined user attributes
                                                email: this.state.userInfo.email,
                                                name: this.state.userInfo.lastName + " " + this.state.userInfo.firstName,
                                                phone: phoneNumber
                                            });
                                        }).then(()=>{
                                            Intercom.displayMessageComposer()
                                        });
                                } else {
                                    Intercom.registerUnidentifiedUser().then(()=>{
                                        Intercom.displayMessageComposer()
                                    });
                                }
                            }}
                            style={[mStyle.orderSummaryRow, {marginTop: 10}]}>
                            <FastImage
                                source={require("../image/icon_close_circle_black.png")}
                                resizeMode="contain"
                                style={{
                                    width:screenWidth*0.08,
                                    height:screenWidth*0.08}}
                            />
                            <Text style={[globalStyle.textBasicStyle, mStyle.textOtherAction]}>{langObj.refundOrCancelOrder}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[mStyle.orderSummaryRow, {marginTop: 10}]}>
                            <FastImage
                                source={require("../image/icon_mail_2.png")}
                                resizeMode="contain"
                                style={{
                                    width:screenWidth*0.08,
                                    height:screenWidth*0.08}}
                            />
                            <Text style={[globalStyle.textBasicStyle, mStyle.textOtherAction]}>{langObj.resendTheReceipt}</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        onPress={()=>{
                            this.props.navigation.goBack();
                        }}
                        style={[mStyle.buttonDarker]}>
                        <Text style={[globalStyle.textBasicBoldStyle, {color:"#ffffff", fontSize:24}]}>{langObj.close}</Text>
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

const mapStateToProps = state =>  ({

});
const mapDispatchToProps = dispatch => {
    return {
        callUpdateCart: (amount)  => dispatch(callUpdateCart(amount))
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(OrderDetailsScreen);

let perfectSize = create(getDesignDimension());
let langObj = getLanguage();
const screenWidth = Math.round(Dimensions.get('window').width);
const screenHeight = Math.round(Dimensions.get('window').height);
const mStyle = StyleSheet.create({
    textOrderReason: {
        width:screenWidth,
        textAlign: "center",
        fontSize:20,
        color:c_text_grey
    },
    textStatus: {
        width:screenWidth,
        textAlign: "center",
        fontSize:18,
        color:c_dark_line
    },
    textOtherAction: {
        fontSize:perfectSize(60),
        color:'#000000'
    },
    orderSummaryRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop:10,
        marginStart:10
    },
    orderSummaryText: {
        color:"#858586",
        fontSize:perfectSize(60),
        fontWeight:"bold",
        marginStart:5
    },
    orderSummaryTextValue: {
        color:"#858586",
        fontSize:perfectSize(60),
        marginStart:5,
        marginTop:3,
        flex:1,
        textAlign: I18nManager.isRTL || isForceRTL ? 'left' : 'right',

    },
    textNormalContent: {
        fontSize:perfectSize(60),
        color: c_dark_text
    },
    textContentCustom: {
        fontSize:perfectSize(45),
        color: c_grey_darker
    },
    textBoldContent: {
        fontSize:perfectSize(50),
    },
    itemSectionContainer: {
        width:screenWidth-40,
        height:perfectSize(240),
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
        fontSize: perfectSize(50),
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
        margin:20,
    },
    textInput: {
        width:screenWidth-40,
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
    }
})

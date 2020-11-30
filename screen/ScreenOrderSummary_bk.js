/*eslint prettier/prettier:0*/
/**
 * @format
 * @flow
 */

import * as React from 'react';
import {
    View,
    Text,
    Image, ScrollView,
    Dimensions, ActivityIndicator, Alert, TouchableOpacity, StyleSheet, Platform, NativeModules, FlatList,
} from 'react-native';
import {
    c_text_green,
    HomeScreenName,
    key_user_info,
    greyHasOpacity,
    c_loading_icon,
    c_bg_blue,
    PhoneInputScreenName,
    top_margin_ios,
    isForceRTL,
    c_text_header,
    c_green_lighter,
    ProductDetailScreenName,
    rq_get_product,
    apiUrl,
    rc_success,
    rq_get_my_active_order,
    rq_add_products_to_order,
    rq_remove_product_from_order, rq_change_product_amount_in_order, rq_place_order, ShippingInfoScreenName,
} from '../resource/BaseValue';
import * as RNLocalize from "react-native-localize";
import AsyncStorage from '@react-native-community/async-storage';
import getLanguage from '../resource/LanguageSupport';
import AmountButton from './comp/AmountButton';
import {makeAPostRequest} from '../resource/SupportFunction';
import {globalStyle} from '../resource/style/GlobalStyle';

export default class OrderSummaryScreen extends React.Component {
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
        })
    }



    componentDidMount (){
        console.log(RNLocalize.getLocales());
        RNLocalize.addEventListener("change", () => {
            // do localization related stuff…
        });
        let allState = this.state;
        allState.orderId = this.props.route.params.orderId;
        this.setState(allState, ()=> {
            this.loadUserInfo();
        });
    }

    componentWillReceiveProps(nextProps: Props, nextContext: *): * {
        console.log("componentWillReceiveProps");
        console.log(this.props);
        setTimeout(()=>{
            if (this.props.route != null
                && this.props.route.params != null
                && this.props.route.params.orderId != null) {
                let allState = this.state;
                allState.orderId = this.props.route.params.orderId;
                this.setState(allState, ()=>{
                    this.loadActiveOrder();
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
                    this.loadActiveOrder();
                });
            } else {

            }
        } catch(e) {
            // error reading value

        }
    }

    loadActiveOrder = async () => {
        let dataObj = {
            request: rq_get_my_active_order,
            token: this.state.userInfo.token,
        }
        console.log(dataObj);
        makeAPostRequest(dataObj,
            ()=>{this._showLoadingBox()},
            ()=>{this._closeLoadingBox()},
            (isSuccess, responseJson)=>{
                if (isSuccess){
                    let allState = this.state;
                    allState.productList = responseJson.products;
                    allState.orderCreatedOn = responseJson.created_on;
                    allState.status = responseJson.status;
                    allState.totalPrice = responseJson.total_price;
                    for (let i = 0 ; i < allState.productList.length; i++) {
                        allState.productList[i]['isSelected'] = true;
                        allState.productList[i]['description'] = "מברגת האימפקט הנמכרת ביותר של Makita. הדגם החזק המשופר שהושק בשנת 2016.\nמהר יותר, חזק יותר ואורך חיים משופר יותר ! מברגת רבת עוצמה, קומפקטית ונוח לאחיזה (גוף בלבד)";
                        allState.productList[i]['fAmount'] = allState.productList[i]['amount'];
                    }
                    this.setState(allState);
                } else {
                    alert (responseJson);
                }
            }
        )
    }

    toogleActiveProduct = async (index) =>{
        let isActive = this.state.productList[index]['isSelected'];
        let dataObj = {};
        if (isActive){
            dataObj = {
                request: rq_remove_product_from_order,
                token: this.state.userInfo.token,
                product_id: this.state.productList[index]['product_id']
            }
        } else {
            let productsList = [];
            let productItem = {
                product_id: this.state.productList[index]['product_id'],
                amount:this.state.productList[index]['amount']
            }
            productsList.push(productItem);
            dataObj = {
                request: rq_add_products_to_order,
                token: this.state.userInfo.token,
                products: productsList
            }
        }
        makeAPostRequest(dataObj,
            ()=>{this._showLoadingBox()},
            ()=>{this._closeLoadingBox()},
            (isSuccess, responseJson)=>{
                if (isSuccess){
                    let allState = this.state;
                    allState.productList[index]['isSelected'] = !allState.productList[index]['isSelected'];
                    this.setState(allState);
                } else {
                    alert (responseJson);
                }
            }
        )
    }

    changeAmountOfProduct = () => {
        for (let i = 0; i < this.state.productList.length; i++) {
            if (this.state.productList[i]['amount'] != this.state.productList[i]['fAmount']
                && this.state.productList[i]['isSelected']) {
                this.callChangeAmountApi(i);
            }
        }
    }

    callChangeAmountApi = async (index) => {
        let dataObj = {
            request: rq_change_product_amount_in_order,
            token: this.state.userInfo.token,
            product_id: this.state.productList[index]['product_id'],
            amount: this.state.productList[index]['amount']
        }
        console.log(dataObj);
        makeAPostRequest(dataObj,
            ()=>{this._showLoadingBox()},
            ()=>{this._closeLoadingBox()},
            (isSuccess, responseJson)=>{
                if (isSuccess){
                    let allState = this.state;
                    allState.productList[index]['fAmount'] = allState.productList[index]['amount'];
                    this.setState(allState);
                } else {
                    alert (responseJson);
                }
            }
        )
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

    showChangeAmount = () => {
        this.setState({isShowChangeAmount: true});
    }

    closeChangeAmount = (callUpdate) => {
        let allState = this.state;
        allState.isShowChangeAmount = false;
        if (callUpdate == false) {
            for (let i = 0; i < allState.productList.length; i++) {
                allState.productList[i]['amount'] = allState.productList[i]['fAmount'];
            }
            this.setState(allState);
        } else {
            this.setState(allState, () => {
                this.changeAmountOfProduct();
            });
        }
    }

    toggleDeliverDetail = () => {
        let isShowDeliveryDetail = this.state.isShowDeliveryDetail;
        this.setState({isShowDeliveryDetail: !isShowDeliveryDetail});
    }

    loadTotalOrderPrice = () => {
        let total = 0;
        for (let i = 0; i < this.state.productList.length; i++) {
            total = total + this.state.productList[i]['amount'] * this.state.productList[i]['price'];
        }
        return total;
    }

    placeOrder = async () => {
        let dataObj = {
            request: rq_place_order,
            token: this.state.userInfo.token,
            order_type: 1,
            destination_address: 'This is Demo Destination Address',
            notes: 'This is demo notes',
            purpose : 'This is demo purpose'
        }
        console.log(dataObj);
        makeAPostRequest(dataObj,
            ()=>{this._showLoadingBox()},
            ()=>{this._closeLoadingBox()},
            (isSuccess, responseJson)=>{
                if (isSuccess){
                    let allState = this.state;
                    this.setState(allState);
                    this.props.navigation.navigate(ShippingInfoScreenName);
                } else {
                    alert (responseJson);
                }
            }
        )
    }

    render () {
        return (
            <View style={{flex:1, flexDirection:"column", backgroundColor:'#ffffff'}}>
                <View style={{width:screenWidth, flexDirection:'row', alignItems:'center', padding:10, marginTop:10}}>
                    <View style={{flex:1}}/>
                    <Text style={[globalStyle.textHeader]}>{langObj.orderSummary}</Text>
                    <TouchableOpacity
                        onPress={()=>{
                            this.props.navigation.goBack();
                        }}
                        style={{flex:1, flexDirection:'row', justifyContent:'flex-end'}}>
                        <Image
                            source={langObj.isRTL || isForceRTL ? require("../image/icon_arrow_blue_left.png"): require("../image/icon_arrow_blue_right.png")}
                            resizeMode="contain"
                            style={{
                                width:screenWidth*0.045*(70/139),
                                height:screenWidth*0.045
                            }}
                        />
                    </TouchableOpacity>
                </View>
                <ScrollView style={{flex:1,width:screenWidth, paddingStart:10, paddingEnd:10}}>
                    <Image
                        source={require("../image/img_delivery.png")}
                        resizeMode="contain"
                        style={{
                            width:screenWidth*0.9,
                            height:screenWidth*0.9*(800/1125),
                            marginBottom:10, alignSelf:'center'
                        }}
                    />
                    <Text style={[globalStyle.textBasicBoldStyle, mStyle.textSection]}>{langObj.orderType}</Text>
                    <View style={[mStyle.contRow]}>
                        <Image
                            source={require("../image/icon_car.png")}
                            resizeMode="contain"
                            style={{
                                width:screenWidth*0.05,
                                height:screenWidth*0.05*(133/184),
                            }}
                        />
                        <View style={{flex:1,flexDirection: 'column', alignItems: "flex-start", marginStart:10}}>
                            <Text style={[globalStyle.textBasicBoldStyle, mStyle.textLabel]}>משלוח עד 24 שעות</Text>
                            <View style={mStyle.contDescription}>
                                <Text style={[globalStyle.textBasicStyle, mStyle.textDescription]}>{langObj.to_dd}</Text>
                                <Image
                                    source={require("../image/icon_location_grey.png")}
                                    resizeMode="contain"
                                    style={{
                                        width:screenWidth*0.04,
                                        height:screenWidth*0.04, marginEnd:1}}
                                />
                                <Text style={[globalStyle.textBasicStyle, mStyle.textDescription]}>זאב ז’בוטינסקי 2, רמת גן.</Text>
                                <TouchableOpacity>
                                    <Text style={[globalStyle.textBasicStyle, mStyle.textDescription,{color:c_text_green, marginStart:3}]}>{langObj.changeAddress}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                    <View style={{flexDirection:'row', alignItems:"center", marginTop:10}}>
                        <Text style={[globalStyle.textBasicBoldStyle, mStyle.textSection]}>{langObj.orderDetail}</Text>
                        <View style={{flex:1}}/>
                        <TouchableOpacity
                            style={{display:this.state.isShowChangeAmount? 'flex' :'none'}}
                            onPress={()=>{
                                this.closeChangeAmount(false);

                            }}>
                            <Text style={[globalStyle.textBasicStyle, mStyle.textDescription,{color:c_text_green, marginStart:10}]}>{langObj.cancel}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{display:this.state.isShowChangeAmount? 'flex' :'none'}}
                            onPress={()=>{
                                this.closeChangeAmount(true);

                            }}>
                            <Text style={[globalStyle.textBasicStyle, mStyle.buttonDarker]}>{langObj.save}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{display:this.state.isShowChangeAmount? 'none' :'flex'}}
                            onPress={()=>{
                                this.showChangeAmount();
                            }}>
                            <Text style={[globalStyle.textBasicStyle, mStyle.buttonLight]}>{langObj.change}</Text>
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        style={{ marginTop:0}}
                        data={this.state.productList}
                        extraData={this.state}
                        showsVerticalScrollIndicator={false}
                        renderItem={({item, index}) =>
                            <View style={[mStyle.contRow, {alignItems: 'flex-start', marginTop: 15}]}>
                                <TouchableOpacity
                                    onPress={()=>{
                                        this.toogleActiveProduct(index);
                                    }}
                                    style={{alignSelf:'center'}}
                                >
                                    <Image
                                        source={item.isSelected ? require("../image/icon_checked_green.png") : require("../image/icon_unchecked_green.png")}
                                        resizeMode="contain"
                                        style={{
                                            width:screenWidth*0.05,
                                            height:screenWidth*0.05,
                                        }}
                                    />
                                </TouchableOpacity>
                                <View style={{flex:1,flexDirection: 'column', alignItems: "flex-start", marginStart:10}}>
                                    <View style={{flexDirection:'row'}}>
                                        <Text style={[globalStyle.textBasicBoldStyle, mStyle.textLabel]}>{item.product_name}</Text>
                                        <Text style={[globalStyle.textBasicBoldStyle, mStyle.textLabel,{color:c_text_green,marginStart:2}]}>x{item.amount}</Text>
                                    </View>
                                    <Text
                                        numberOfLines={1}
                                        style={[globalStyle.textBasicStyle, mStyle.textDescription, {alignSelf:'stretch'}]}>{item.description}</Text>
                                </View>
                                <Text style={[globalStyle.textBasicBoldStyle, mStyle.textLabel,{color:c_text_green, display: this.state.isShowChangeAmount ? 'none':'flex'}]}>{langObj.priceUnit}{(item.price*item.amount).toFixed(2)}</Text>
                                <AmountButton
                                    number={item.amount}
                                    isVisible={this.state.isShowChangeAmount}
                                    style={{marginStart:10}}
                                    onNumberChange={(amount) => {
                                        let allState = this.state;
                                        allState.productList[index]['amount'] = amount;
                                        this.setState(allState);
                                    }}
                                />
                            </View>
                        }
                        keyExtractor={(item) => item.product_id}
                    />
                    <View style={[mStyle.contRow]}>
                        <Image
                            source={require("../image/icon_chat.png")}
                            resizeMode="contain"
                            style={{
                                width:screenWidth*0.05,
                                height:screenWidth*0.05*(201/211),
                            }}
                        />
                        <View style={{flex:1,flexDirection: 'column', alignItems: "flex-start", marginStart:10}}>
                            <Text style={[globalStyle.textBasicBoldStyle, mStyle.textLabel]}>{langObj.orderComments}</Text>
                            <Text style={[globalStyle.textBasicStyle, mStyle.textDescription]}>{langObj.orderCommentsPlaceHolder}</Text>
                        </View>
                    </View>
                    <View style={[mStyle.contRow]}>
                        <Image
                            source={require("../image/icon_pin_note.png")}
                            resizeMode="contain"
                            style={{
                                width:screenWidth*0.05,
                                height:screenWidth*0.05,
                            }}
                        />
                        <View style={{flex:1,flexDirection: 'column', alignItems: "flex-start", marginStart:10}}>
                            <Text style={[globalStyle.textBasicBoldStyle, mStyle.textLabel]}>{langObj.orderReason}</Text>
                            <Text style={[globalStyle.textBasicStyle, mStyle.textDescription]}>{langObj.orderReasonPlaceHolder}</Text>
                        </View>
                    </View>
                    <Text style={[globalStyle.textBasicBoldStyle, mStyle.textSection,{marginTop:10}]}>{langObj.payment}</Text>
                    <View style={[mStyle.contRow]}>
                        <Image
                            source={require("../image/icon_card.png")}
                            resizeMode="contain"
                            style={{
                                width:screenWidth*0.05,
                                height:screenWidth*0.05*(145/214),
                            }}
                        />
                        <View style={{flex:1,flexDirection: 'column', alignItems: "flex-start", marginStart:10}}>
                            <Text style={[globalStyle.textBasicBoldStyle, mStyle.textLabel]}>{langObj.creditCardEndWith}</Text>
                            <Text style={[globalStyle.textBasicStyle, mStyle.textDescription]}>{langObj.clickToChangeMeanPayment}</Text>
                        </View>
                        <Image
                            source={require("../image/icon_card_visa.png")}
                            resizeMode="contain"
                            style={{
                                width:screenWidth*0.09,
                                height:screenWidth*0.09*(145/228),
                                alignSelf:'center',
                                marginEnd:10
                            }}
                        />
                    </View>
                    <View style={[mStyle.contRow]}>
                        <Image
                            source={require("../image/icon_card_write.png")}
                            resizeMode="contain"
                            style={{
                                width:screenWidth*0.05,
                                height:screenWidth*0.05*(204/230),
                            }}
                        />
                        <View style={{flex:1,flexDirection: 'column', alignItems: "flex-start", marginStart:10}}>
                            <Text style={[globalStyle.textBasicBoldStyle, mStyle.textLabel]}>{langObj.payWithCheck}</Text>
                            <Text style={[globalStyle.textBasicStyle, mStyle.textDescription]}>{langObj.payWithCheckDescription}</Text>
                        </View>
                    </View>
                    <Text style={[globalStyle.textBasicBoldStyle, mStyle.textSection,{marginTop:10}]}>{langObj.summary}</Text>
                    <View style={[mStyle.contRow]}>
                        <Text style={[globalStyle.textBasicBoldStyle, mStyle.textLabel,{flex:1}]}>{langObj.orderTotal}</Text>
                        <Text style={[globalStyle.textBasicBoldStyle, mStyle.textLabel]}>{langObj.priceUnit}{this.loadTotalOrderPrice()}</Text>
                    </View>
                    <View style={[mStyle.contRow,{alignItems: 'center'}]}>
                        <Text style={[globalStyle.textBasicBoldStyle, mStyle.textLabel]}>{langObj.deliverCost}</Text>
                        <TouchableOpacity
                            onPress={() =>{
                                this.toggleDeliverDetail();
                            }}
                            >
                            <Image
                                source={this.state.isShowDeliveryDetail? require("../image/icon_arrow_blue_up.png") : require("../image/icon_arrow_blue_down.png")}
                                resizeMode="contain"
                                style={{
                                    width:screenWidth*0.05,
                                    height:screenWidth*0.05*(70/139),
                                    marginStart:10
                                }}
                            />
                        </TouchableOpacity>
                        <View style={{flex:1}}/>
                        <Text style={[globalStyle.textBasicBoldStyle, mStyle.textLabel]}>{langObj.priceUnit}200</Text>
                    </View>
                    <View style={{display:this.state.isShowDeliveryDetail?'flex':'none', flexDirection:'column'}}>
                        <View style={[mStyle.contRow]}>
                            <Text style={[globalStyle.textBasicBoldStyle, mStyle.textLabel,{flex:1}]}>{langObj.regularDeliveryCommission}</Text>
                            <Text style={[globalStyle.textBasicBoldStyle, mStyle.textLabel]}>{langObj.priceUnit}100</Text>
                        </View>
                        <View style={[mStyle.contRow]}>
                            <View style={{flexDirection:'column', flex:1, justifyContent:"flex-start"}}>
                                <Text style={[globalStyle.textBasicBoldStyle, mStyle.textLabel]}>{langObj.costDeliveryToDistantLocation}</Text>
                                <Text style={[globalStyle.textBasicStyle, mStyle.textDescription]}>{langObj.costDeliveryToDistantLocationDescription}</Text>
                            </View>
                            <Text style={[globalStyle.textBasicBoldStyle, mStyle.textLabel]}>{langObj.priceUnit}100</Text>
                        </View>
                    </View>
                    <View style={[mStyle.contRow]}>
                        <Text style={[globalStyle.textBasicBoldStyle, mStyle.textLabel,{flex:1}]}>{langObj.grandTotal}</Text>
                        <Text style={[globalStyle.textBasicBoldStyle, mStyle.textLabel]}>{langObj.priceUnit}1000</Text>
                    </View>
                </ScrollView>
                <TouchableOpacity
                    onPress={()=>{
                        this.placeOrder();
                    }}
                    style={{alignSelf:'stretch', flexDirection:'row', alignItems:'center', justifyContent:'center', padding:15,
                    backgroundColor:c_text_green, borderRadius:10, margin:10}}>
                    <Text style={[globalStyle.textBasicBoldStyle, mStyle.textLabel,{color:"#ffffff"}]}>{langObj.slideToApprove}</Text>
                    <Image
                        source={langObj.isRTL || isForceRTL? require("../image/icon_arrow_left_white.png") : require("../image/icon_arrow_right_white.png")}
                        resizeMode="contain"
                        style={{
                            width:screenWidth*0.02,
                            height:screenWidth*0.02*(139/70),
                            marginStart:10
                        }}
                    />
                </TouchableOpacity>
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
    textSection: {
        fontSize: 14,
        color:c_text_header,
    },
    textLabel: {
        fontSize: 12,
        color:c_text_header,
    },
    textDescription: {
        fontSize: 12,
        color:c_text_header
    },
    buttonLight:{
        paddingTop:5,
        paddingBottom:5,
        paddingStart:10,
        paddingEnd:10,
        borderRadius: 5,
        fontFamily: "HelveticaNeue",
        fontSize: 13,
        backgroundColor:c_green_lighter,
        color:c_text_green,
        marginStart:5
    },
    buttonDarker: {
        paddingTop:5,
        paddingBottom:5,
        paddingStart:10,
        paddingEnd:10,
        borderRadius: 5,
        fontFamily: "HelveticaNeue",
        fontSize: 13,
        backgroundColor:c_text_green,
        color:"#ffffff",
        marginStart:10
    },
    contRow : {
        flexDirection:'row',
        alignItems:'center',
        marginTop:10
    },
    contDescription: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5
    }
})

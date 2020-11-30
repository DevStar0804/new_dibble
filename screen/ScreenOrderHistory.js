/*eslint prettier/prettier:0*/
/**
 * @format
 * @flow
 */

import * as React from 'react';
import {
    View, Text, ScrollView,
    Image, StyleSheet,
    Dimensions, TouchableOpacity, ActivityIndicator, I18nManager, FlatList, Modal,
} from 'react-native';
import {
    c_dark_line, c_dark_text, c_grey_darker, c_grey_light, c_loading_icon,
    c_main_background, c_main_orange, c_red, c_text_grey, greyHasOpacity, key_screen_comeback,
    key_user_info, LandingStackName, OrderDetailsScreenName,
    OrderHistoryScreenName, rc_token_expire, rq_get_my_orders,
} from '../resource/BaseValue';
import AsyncStorage from '@react-native-community/async-storage';
import getLanguage, {getDesignDimension} from '../resource/LanguageSupport';
import {globalStyle} from '../resource/style/GlobalStyle';
import SearchHeaderBarFunc from './SearchHeaderBarFunc';
import {makeAPostRequest} from '../resource/SupportFunction';
import {dateOrderHistory, timeOrderHistory} from '../resource/Config';
import moment from 'moment';
import 'moment/locale/he'
moment.locale('he')
import FastImage from 'react-native-fast-image'
import {create} from 'react-native-pixel-perfect';
import {memo} from 'react';

export default class OrderHistoryScreen extends React.Component {
    constructor (props) {
        super(props);
        this.flatlist = React.createRef();
        this.state = ({
            isRefresh: true,
            indicatorSizeW: 0,
            indicatorSizeH: 0,
            indicatorDisplay: false,
            orders: [
                {
                    "order_id": 0,
                    "created_on": "",
                    "status": 2,
                    "placed_on": "",
                    "purpose": "",
                    "shipment_date": "",
                    "products": [
                        {
                            "product_id": 44,
                            "product_name": "",
                            "price": 1.87,
                            "amount": 1,
                            "product_image": ""
                        }
                    ],
                    "total_price": 1.87
                }
            ],
            statuses: {},
            order_types: {},
            isShowFilterMenu: false,
            filterText: langObj.everything
        })
    }


    componentDidMount (){
        this.loadUserInfo();
    }

    componentWillReceiveProps(nextProps: Props, nextContext: *): * {
        if (this.flatlist != null && this.flatlist.current != null) {
            this.flatlist.current.scrollToOffset({offset: 0});
        }
    }


    loadUserInfo = async  () => {
        try {
            const value = await AsyncStorage.getItem(key_user_info)
            if(value != null) {
                // value previously stored
                const jsonValue = JSON.parse(value);
                let allState = this.state;
                allState.userInfo = jsonValue;
                this.setState(allState, ()=>this.getMyOrders());
            } else {

            }
        } catch(e) {
            // error reading value
        }
    }

    getMyOrders = async () => {
        let dataObj = {
            request: rq_get_my_orders,
            token: this.state.userInfo.token
        }
        makeAPostRequest(dataObj,
            ()=> this._showLoadingBox(),
            ()=>this._closeLoadingBox(),
            (isSuccess, responseJson) => {
                if (isSuccess) {
                    let allState = this.state;
                    allState.orders = responseJson.orders;
                    allState.statuses = responseJson.statuses;
                    allState.order_types = responseJson.order_types;
                    this.setState(allState);
                } else {
                    this._closeLoadingBox();
                    if (responseJson == rc_token_expire) {
                        AsyncStorage.setItem(key_screen_comeback, OrderHistoryScreenName);
                        this.props.navigation.navigate(LandingStackName,{
                            previousScreen: OrderHistoryScreenName
                        });
                    } else {
                        alert (responseJson);
                    }
                }
            })
    }

    getVisibleByFilter = (item) =>{
        if (this.state.filterText == langObj.everything) {
            return true;
        } else {
            let momentPlacedOn = moment.utc(item.placed_on).local();
            let momentNow = moment();
            let diffMonth = momentNow.diff(momentPlacedOn, 'months');
            console.log('diffMonth: ' + diffMonth);
            if (this.state.filterText == langObj.inTheLastMonth){
                if (diffMonth <= 0) {
                    return true;
                } else {
                    return false;
                }
            } else if (this.state.filterText == langObj.lastThreeMonth){
                if (diffMonth <= 2) {
                    return true;
                } else {
                    return false;
                }
            } else if (this.state.filterText == langObj.lastSixMonth) {
                if (diffMonth <= 5) {
                    return true;
                } else {
                    return false;
                }
            }
        }
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
                if (keys[i] == type) {
                    contentDisplay = this.state.order_types[keys[i]]
                }
            }
        }
        return contentDisplay;
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
            <View style={{flex:1, flexDirection:"column", backgroundColor:c_main_background}}>
                <SearchHeaderBarFunc navigation={this.props.navigation} title={OrderHistoryScreenName}/>
                <ScrollView style={{flex:1,width:screenWidth, paddingTop:10, paddingBottom:10}}>
                    <View style={[globalStyle.sectionTitleContainer, {alignItems: 'center'}]}>
                        <View style={{flexDirection:'row', alignItems: "center", borderBottomColor:c_main_orange, borderBottomWidth:5, paddingBottom:5}}>
                            <Text style={[globalStyle.textBasicBoldStyle,globalStyle.textSection]}>{langObj.orderHistory}</Text>
                            <FastImage
                                source={I18nManager.isRTL || langObj.isRTL ? require("../image/icon_arrow_left_black_d2.png") : require("../image/icon_arrow_right_black_d2.png")}
                                resizeMode="contain"
                                style={{
                                    width:screenWidth*0.08,
                                    height:screenWidth*0.08* (108/156),marginStart:5}}
                            />
                        </View>
                        <View style={{flex:1}}/>
                        <TouchableOpacity
                            onPress={()=>{
                                this.setState({
                                    isShowFilterMenu :true
                                })
                            }}>
                            <Text style={[globalStyle.textBasicStyle, mStyle.textFilter]}>{langObj.filterResult}</Text>
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        style={{ marginTop:0}}
                        data={this.state.orders}
                        extraData={this.state}
                        showsVerticalScrollIndicator={false}
                        renderItem={({item, index}) =>{
                            let productList = item.products;
                            return (
                                <TouchableOpacity
                                    style={{display:this.getVisibleByFilter(item)?"flex":"none"}}
                                    onPress={()=>{
                                        this.props.navigation.navigate(OrderDetailsScreenName, {
                                            orderItem: item,
                                            statuses: this.state.statuses,
                                            order_types: this.state.order_types,
                                        });
                                    }}>
                                    <View style={mStyle.orderItemContainer}>
                                        <View style={{flexDirection:'row', alignItems: 'center'}}>
                                            <Text style={[globalStyle.textBasicBoldStyle, {fontSize:18, color:c_text_grey}]}>{this.getStatusContent(item.status)}</Text>
                                            <View style={{flex:1}}/>
                                            <FastImage
                                                source={langObj.isRTL ? require("../image/icon_arrow_left_black.png"): require("../image/icon_arrow_right_black.png")}
                                                resizeMode="contain"
                                                style={{
                                                    width:screenWidth*0.08,
                                                    height:screenWidth*0.08* (70/139)}}
                                            />
                                        </View>
                                        <Text style={[globalStyle.textBasicStyle, {fontSize:17, color:c_grey_darker, marginTop:5}]}>
                                            {langObj.orderReceivedOn + " " + moment.utc(item.placed_on).local().format(dateOrderHistory) + " " + langObj.at + " " + moment.utc(item.placed_on).local().format(timeOrderHistory)}
                                        </Text>

                                        {/*<Text style={[globalStyle.textBasicStyle, {fontSize:16, color:c_dark_text, marginTop:5}]}>{langObj.orderReceivedOn + " " + moment(item.shipment_date).format('MMMM Do YYYY') }</Text>*/}
                                        <FlatList
                                            style={{marginTop:20, marginBottom: 20, width:screenWidth-80, height:screenWidth*0.4}}
                                            data={productList}
                                            horizontal={true}
                                            renderItem={({item, index}) =>{
                                                return (
                                                    <View style={{flexDirection:'row', width:screenWidth*0.3, marginEnd: 20}}>
                                                        <FastImage
                                                            source={{uri:item.product_image}}
                                                            resizeMode="contain"
                                                            style={{
                                                                width:screenWidth*0.3,
                                                                height:screenWidth*0.4, marginStart: 10, marginEnd: 10}}
                                                        />
                                                    </View>
                                                );
                                            }}
                                            keyExtractor={(itemImage) => itemImage.product_id}
                                        />
                                        <View style={{flexDirection:'row'}}>
                                            <Text style={[globalStyle.textBasicStyle, {fontSize:18, color:c_dark_line, marginTop:5, fontWeigh:'bold'}]}>{item.purpose}</Text>
                                            <View style={{flex:1}}/>
                                        </View>
                                        <View style={{flexDirection:'row',marginTop: 5}}>
                                            <Text style={[globalStyle.textBasicStyle, mStyle.textItemTitleSection]}>{langObj.orderNumber}</Text>
                                            <Text style={[globalStyle.textBasicStyle, mStyle.textItemContentSection]}>{item.order_id}</Text>
                                        </View>
                                        <View style={{flexDirection:'row',marginTop: 5}}>
                                            <Text style={[globalStyle.textBasicStyle, mStyle.textItemTitleSection]}>{langObj.deliveryDate}</Text>
                                            <Text style={[globalStyle.textBasicStyle, mStyle.textItemContentSection]}>{ moment.utc(item.placed_on).local().format('Do MMMM YYYY')}</Text>
                                        </View>
                                        <View style={{width:screenWidth-80, height:1,marginTop: 10, marginBottom: 10, backgroundColor: c_grey_light}}/>
                                        <TouchableOpacity
                                            onPress={()=>{
                                                //will open tracking map
                                                // if (item.status==8 || item.status==9)
                                            }}
                                            style={{marginTop: 5}}>
                                            <Text style={[globalStyle.textBasicStyle, mStyle.textItemContentSection, {color:c_main_orange}]}>{item.status==8 || item.status==9?langObj.reOrder:langObj.orderTracking}</Text>
                                        </TouchableOpacity>
                                    </View>
                                </TouchableOpacity>
                            );
                        }}
                        keyExtractor={(item) => item.order_id}
                    />
                </ScrollView>
                <TouchableOpacity
                    onPress={()=>{
                        this.props.navigation.goBack();
                    }}
                    style={[mStyle.buttonDarker]}>
                    <Text style={[globalStyle.textBasicBoldStyle, {color:"#ffffff", fontSize:24}]}>{langObj.close}</Text>
                </TouchableOpacity>
                <Modal
                    animationType="fade"
                    transparent
                    visible={this.state.isShowFilterMenu}>
                    <View style={{flexDirection: "column", height:'100%' ,justifyContent:'flex-end', backgroundColor:'rgba(0,0,0,0.8)'}}>
                        <TouchableOpacity
                            onPress={()=>{
                                this.setState({isShowFilterMenu: false})
                            }}
                            activeOpacity={1}
                            style={{flex:1, width:screenWidth}}
                        />
                        <View style={[mStyle.modalContainer]}>
                            <View style={[globalStyle.sectionTitleCenterContainer,{marginBottom:10, paddingBottom: 10, width:screenWidth*0.5}]}>
                                <Text style={[globalStyle.textBasicBoldStyle,globalStyle.textSection]}>{langObj.historyFilterTitle}</Text>
                            </View>
                            <TouchableOpacity
                                style={[mStyle.filterRow]}
                                onPress={()=>{
                                    this.setState({
                                        isShowFilterMenu: false,
                                        filterText: langObj.everything})
                                }}>
                                <FastImage
                                    source={require("../image/icon_checked_single.png")}
                                    resizeMode="contain"
                                    style={{
                                        opacity:this.state.filterText==langObj.everything?1:0,
                                        marginStart: perfectSize(100),
                                        width:perfectSize(30),
                                        height:perfectSize(30)}}
                                />
                                <Text style={[globalStyle.textBasicStyle,mStyle.textAction, {flex:1,marginEnd:perfectSize(130),color:c_dark_text}]}>{langObj.everything}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[mStyle.filterRow]}
                                onPress={()=>{
                                    this.setState({
                                        isShowFilterMenu:false,
                                        filterText: langObj.inTheLastMonth
                                    })
                                }}>
                                <FastImage
                                    source={require("../image/icon_checked_single.png")}
                                    resizeMode="contain"
                                    style={{
                                        opacity:this.state.filterText==langObj.inTheLastMonth?1:0,
                                        marginStart: perfectSize(100),
                                        width:perfectSize(30),
                                        height:perfectSize(30)}}
                                />
                                <Text style={[globalStyle.textBasicStyle,mStyle.textAction, {flex:1,marginEnd:perfectSize(130),color:c_dark_text}]}>{langObj.inTheLastMonth}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[mStyle.filterRow]}
                                onPress={()=>{
                                    this.setState({
                                        isShowFilterMenu:false,
                                        filterText:langObj.lastThreeMonth
                                    })
                                }}>
                                <FastImage
                                    source={require("../image/icon_checked_single.png")}
                                    resizeMode="contain"
                                    style={{
                                        opacity:this.state.filterText==langObj.lastThreeMonth?1:0,
                                        marginStart: perfectSize(100),
                                        width:perfectSize(30),
                                        height:perfectSize(30)}}
                                />
                                <Text style={[globalStyle.textBasicStyle,mStyle.textAction, {flex:1,marginEnd:perfectSize(130),color:c_dark_text}]}>{langObj.lastThreeMonth}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[mStyle.filterRow]}
                                onPress={()=>{
                                    this.setState({
                                        isShowFilterMenu:false,
                                        filterText:langObj.lastSixMonth
                                    })
                                }}>
                                <FastImage
                                    source={require("../image/icon_checked_single.png")}
                                    resizeMode="contain"
                                    style={{
                                        opacity:this.state.filterText==langObj.lastSixMonth?1:0,
                                        marginStart: perfectSize(100),
                                        width:perfectSize(30),
                                        height:perfectSize(30)}}
                                />
                                <Text style={[globalStyle.textBasicStyle,mStyle.textAction, {flex:1,marginEnd:perfectSize(130),color:c_dark_text}]}>{langObj.lastSixMonth}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
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
    textFilter: {
        color:c_main_orange,
        fontSize:17
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
    orderItemContainer: {
        flexDirection: 'column',
        width:screenWidth-40,
        margin:20,
        padding:20,
        backgroundColor: "#ffffff",
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    textItemTitleSection: {
        width:screenWidth*0.3,
        color:c_grey_darker,
        fontSize: 18
    },
    textItemContentSection: {
        color:c_grey_darker,
        fontSize: 18
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
    textAction:{
        fontSize:19,
        marginTop: 10,
        marginBottom: 15,
        color: c_dark_text,
        textAlign:'center'
    },
    filterRow:{
        flexDirection:'row',
        alignItems:'center',
    }

})

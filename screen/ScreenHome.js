/**
 * @format
 * @eslint prettier/prettier
 */

import * as React from 'react';
import {
    View, FlatList,
    Text, ScrollView, BackHandler,Platform,
    Image, StyleSheet, TouchableOpacity, I18nManager, NativeModules,
    Dimensions, TextInput, Alert, ActivityIndicator,
} from 'react-native';
import * as RNLocalize from "react-native-localize";
import {
    apiUrl,
    c_active_dot, c_bg_product_image,
    c_dark_line,
    c_dark_text,
    c_inactive_dot,
    c_loading_icon,
    c_text_green,
    CategoryScreenName,
    greyHasOpacity,
    HomeScreenName, isForceRTL, key_current_route_name,
    key_user_info, LandingScreenName,
    rc_success,
    rq_get_sub_categories,
    SearchResultScreenName,
} from '../resource/BaseValue';
import AsyncStorage from '@react-native-community/async-storage';
import getLanguage from '../resource/LanguageSupport';
import {globalStyle} from '../resource/style/GlobalStyle';
import {SliderBox} from '../resource/lib/SliderBox';
import FastImage from 'react-native-fast-image';
import { makeAPostRequest } from '../resource/SupportFunction';

export default class HomeScreen extends React.Component {
    constructor (props) {
        super(props);
        this.state = ({
            searchText:"",
            isRefresh: true,
            indicatorSizeW: 0,
            indicatorSizeH: 0,
            indicatorDisplay: false,
            images: [
                require('../image/img_1.png'),
                require('../image/img_2.png'),
                require('../image/img_3.png'),
                require('../image/img_4.png'),
                require('../image/img_5.png'),
            ],
            categories:[],
            categorySliders: [
                {
                    sliderId:1,
                    sliderName: "קטגוריות",
                    type:"cat",
                    itemList: [
                        {
                            id:1,
                            image: require('../image/img_6.png'),
                            name:"אביזרי חשמל",
                            itemCount: 2,
                        },
                        {
                            id:2,
                            image: require('../image/img_7.png'),
                            name:"אביזרי חשמל",
                            itemCount: 3,
                        },
                        {
                            id:3,
                            image: require('../image/img_8.png'),
                            name:"אביזרי חשמל",
                            itemCount: 2,
                        },
                        {
                            id:4,
                            image: require('../image/img_9.png'),
                            name:"אביזרי חשמל",
                            itemCount: 2,
                        },
                        {
                            id:5,
                            image: require('../image/img_10.png'),
                            name:"אביזרי חשמל",
                            itemCount: 2,
                        }
                    ]
                },
                {
                    sliderId:2,
                    sliderName: "קטגוריות",
                    type:"cat",
                    itemList: [
                        {
                            id:1,
                            image: require('../image/img_6.png'),
                            name:"אביזרי חשמל",
                            itemCount: 2,
                        },
                        {
                            id:2,
                            image: require('../image/img_7.png'),
                            name:"אביזרי חשמל",
                            itemCount: 3,
                        },
                        {
                            id:3,
                            image: require('../image/img_8.png'),
                            name:"אביזרי חשמל",
                            itemCount: 2,
                        },
                        {
                            id:4,
                            image: require('../image/img_9.png'),
                            name:"אביזרי חשמל",
                            itemCount: 2,
                        },
                        {
                            id:5,
                            image: require('../image/img_10.png'),
                            name:"אביזרי חשמל",
                            itemCount: 2,
                        }
                    ]
                },
                {
                    sliderId:3,
                    sliderName: "אביזרי חשמל",
                    type:"product",
                    itemList: [
                        {
                            id:1,
                            image: require('../image/img_10.png'),
                            name:"אביזרי חשמל",
                            description:"",
                            price: 12
                        },
                        {
                            id:2,
                            image: require('../image/img_11.png'),
                            name:"אביזרי חשמל",
                            description:"",
                            price: 12
                        },
                        {
                            id:3,
                            image: require('../image/img_12.png'),
                            name:"אביזרי חשמל",
                            description:"",
                            price: 12
                        },
                        {
                            id:4,
                            image: require('../image/img_1.png'),
                            name:"אביזרי חשמל",
                            description:"",
                            price: 12
                        },
                        {
                            id:5,
                            image: require('../image/img_3.png'),
                            name:"אביזרי חשמל",
                            description:"",
                            price: 12
                        }
                    ]
                }
            ]
        })
    }


    displaySlider () {
        let sliderView = [];
        for (let i = 0; i < this.state.categorySliders.length; i++) {
            let sliderItem = this.state.categorySliders[i];
            if (sliderItem.type == 'cat') {
                sliderView.push(
                    <View style={{flexDirection:'column', marginTop:10, padding:10}}>
                        <View style={{flexDirection:'row', alignItems:'center'}}>
                            <Text style={[globalStyle.textBasicBoldStyle, mStyle.textCategory,{color:c_dark_text}]}>{sliderItem.sliderName}</Text>
                            <View style={{flex:1}}></View>
                            <Text style={[globalStyle.textBasicBoldStyle, mStyle.textCategory,{color:c_text_green}]}>{langObj.more}</Text>
                        </View>
                        <FlatList
                            style={{ marginTop:10, width:screenWidth}}
                            data={this.state.categories}
                            showsHorizontalScrollIndicator={false}
                            horizontal={true}
                            renderItem={({item, index}) =>
                                <TouchableOpacity
                                    onPress={()=>{
                                        this.props.navigation.navigate(CategoryScreenName,{
                                            category_id: item.category_id,
                                            category_name: item.name
                                        })
                                    }}
                                    style={mStyle.itemContainer}>
                                    <FastImage
                                        source={{uri:item.image}}
                                        resizeMode="cover"
                                        style={{
                                            width:screenWidth*0.3,
                                            height:screenWidth*0.33,
                                            borderTopLeftRadius:10,
                                            borderTopRightRadius:10}}
                                    />
                                    <Text
                                        numberOfLines={1}
                                        style={[globalStyle.textItemName]}>{item.name}</Text>
                                    <Text
                                        numberOfLines={1}
                                        style={[globalStyle.textItemDescription]}>{langObj.item + " " + item.num_of_products}</Text>
                                </TouchableOpacity>
                            }
                            keyExtractor={item => item.id}
                        />
                    </View>
                );
            } else {
                sliderView.push(
                    <View style={{flexDirection:'column', marginTop:10, padding:10}}>
                        <View style={{flexDirection:'row', alignItems:'center'}}>
                            <Text style={[globalStyle.textBasicBoldStyle, mStyle.textCategory,{color:c_dark_text}]}>{sliderItem.sliderName}</Text>
                            <View style={{flex:1}}></View>
                            <Text style={[globalStyle.textBasicBoldStyle, mStyle.textCategory,{color:c_text_green}]}>{langObj.more}</Text>
                        </View>
                        <FlatList
                            style={{ marginTop:10}}
                            data={sliderItem.itemList}
                            showsHorizontalScrollIndicator={false}
                            horizontal={true}
                            renderItem={({item, index}) =>
                                <View style={[mStyle.itemContainer,{width: screenWidth*0.4}]}>
                                    <FastImage
                                        source={item.image}
                                        resizeMode="contain"
                                        style={{
                                            width:screenWidth*0.4,
                                            height:screenWidth*0.3,
                                            borderTopLeftRadius:10,
                                            borderTopRightRadius:10}}
                                    />
                                    <Text
                                        numberOfLines={1}
                                        style={[globalStyle.textItemName]}>{item.name}</Text>
                                    <Text
                                        numberOfLines={3}
                                        style={[globalStyle.textItemDescription]}>{item.description}</Text>
                                    <Text
                                        numberOfLines={1}
                                        style={[globalStyle.textItemDescription]}>{langObj.priceStartFrom + " " + item.price}</Text>
                                </View>
                            }
                            keyExtractor={item => item.id}
                        />
                    </View>
                );
            }
        }
        return sliderView;
    }


    componentDidMount (){
        BackHandler.addEventListener("hardwareBackPress", this.backAction);
        console.log(RNLocalize.getLocales());
        RNLocalize.addEventListener("change", () => {
            // do localization related stuff…
        });
        console.log("componentDidMount ScreenHome");
        this.loadUserInfo();
    }

    componentWillReceiveProps(nextProps: Props, nextContext: *): * {
        console.log(this.props);
        if (this.props.route.params != null && this.props.route.params.showSideMenu != null && this.props.route.params.showSideMenu){
            this.props.navigation.openDrawer();
        }
    }

    componentDidUpdate(prevProps: Props, prevState: State, prevContext: *): * {
        console.log(this.props);
    }

    componentWillUnmount() {
        BackHandler.removeEventListener("hardwareBackPress", this.backAction);
    }

    backAction = async () => {
        try {
            const value = await AsyncStorage.getItem(key_current_route_name);
            // const jsonValue = JSON.parse(value);
            console.log(value.toString());
            if(value != null) {
                if (value == HomeScreenName) {
                    BackHandler.exitApp();
                } else {
                    this.props.navigation.goBack();
                }
            } else {
                this.props.navigation.goBack();
            }
        } catch(e) {
            // error reading value
            this.props.navigation.goBack();
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

    loadUserInfo = async  () => {
        try {
            const value = await AsyncStorage.getItem(key_user_info)
            if(value != null) {
                // value previously stored
                const jsonValue = JSON.parse(value);
                let allState = this.state;
                allState.userInfo = jsonValue;
                this.setState(allState);
                this.loadCategories();
            } else {

            }
        } catch(e) {
            // error reading value

        }
    }

    checkTokenForMenu = async  () => {
        try {
            const value = await AsyncStorage.getItem(key_user_info)
            if(value != null) {
                // value previously stored
                const jsonValue = JSON.parse(value);
                console.log(jsonValue);
                let allState = this.state;
                allState.userInfo = jsonValue;
                this.setState(allState);
                if (allState.userInfo.token == "") {
                    this.props.navigation.navigate(LandingScreenName);
                } else {
                    this.props.navigation.openDrawer();
                }
            } else {

            }
        } catch(e) {
            // error reading value

        }
    }

    loadCategories () {
        this._showLoadingBox();
        let dataObj = {
            request: rq_get_sub_categories,
            token: this.state.userInfo.token,
            parent_category_id: 0
        }
        console.log(dataObj);
        makeAPostRequest(dataObj,
            ()=>this._showLoadingBox(),
            ()=>this._closeLoadingBox(),
            (isSuccess, responseJson)=>{
                if (isSuccess) {
                    let allState = this.state;
                    allState.categories = responseJson.categories;
                    this.setState(allState);
                } else {
                    alert (responseJson);
                }
            })
    }

    render () {
        return (
            <View style={{flex:1, flexDirection:"column", alignItems:"center", backgroundColor:'#ffffff'}}>
                <View style={[globalStyle.header,{width:screenWidth, padding:5,flexDirection:'row',alignItems:'center',
                    backgroundColor:"#ffffff",marginBottom:10}]}>
                    <TouchableOpacity
                        onPress={()=>{
                            this.checkTokenForMenu();
                        }}>
                        <FastImage
                            source={require("../image/icon_menu.png")}
                            resizeMode="contain"
                            style={{
                                width:screenWidth*0.05*(159/123),
                                height:screenWidth*0.05}}
                        />
                    </TouchableOpacity>
                    <View style={{flex:1, flexDirection:'column', alignItems:'center', justifyContent:'center'}}>
                        <Text style={[globalStyle.textHeader]}>{langObj.deliveryTo}</Text>
                        <View style={{flexDirection:"row", alignItems:'center'}}>
                            <FastImage
                                source={require("../image/icon_location.png")}
                                resizeMode="contain"
                                style={{
                                    width:screenWidth*0.03,
                                    height:screenWidth*0.03, marginEnd: 3}}
                            />
                            <Text style={[globalStyle.textHeader,{color:c_text_green}]}>זאב ז’בוטינסקי 2, רמת גן</Text>
                        </View>
                    </View>
                    <FastImage
                        source={require("../image/icon_cart.png")}
                        resizeMode="contain"
                        style={{
                            width:screenWidth*0.06,
                            height:screenWidth*0.06}}
                    />
                </View>
                <View style={{flex:1, flexDirection: 'column'}}>
                    <View style={{flexDirection:'row', alignItems:'center', width: screenWidth-20, margin:10,
                            borderColor: c_dark_line, borderRadius:10, borderWidth:0.5, paddingStart:10, paddingEnd:10}}>
                        <TouchableOpacity
                            onPress={()=>{
                                this.props.navigation.navigate(SearchResultScreenName, {
                                    searchText: this.state.searchText
                                })
                            }}>
                            <FastImage
                                source={require("../image/icon_search.png")}
                                resizeMode="contain"
                                style={{
                                    width:screenWidth*0.05,
                                    height:screenWidth*0.05*(153/150),marginEnd:5}}
                            />
                        </TouchableOpacity>
                        <TextInput
                            placeholder={langObj.wantToBuy}
                            style={[globalStyle.textSearch]}
                            value={this.state.searchText}
                            onSubmitEditing={()=>{
                                this.props.navigation.navigate(SearchResultScreenName, {
                                    searchText: this.state.searchText
                                })
                            }}
                            onChangeText={(text)=>{
                                this.setState({searchText: text})
                            }}
                        />
                    </View>
                    <ScrollView>
                        <SliderBox
                            // style={{backgroundColor:c_bg_product_image}}
                            ImageComponentStyle={{backgroundColor:c_bg_product_image, borderRadius: 15, width:screenWidth-20}}
                            circleLoop
                            autoplay
                            resizeMode={"cover"}
                            disableOnPress={true}
                            parentWidth={screenWidth}
                            sliderBoxHeight={screenHeight*0.25}
                            dotColor={c_active_dot}
                            inactiveDotColor={c_inactive_dot}
                            dotStyle={{
                                width: 15,
                                height: 15,
                                borderRadius: 15,
                                marginHorizontal: -5,
                                padding: 0,
                                margin: 0
                            }}
                            images={this.state.images} />
                        {this.displaySlider()}
                    </ScrollView>
                </View>
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
    textCategory: {
        fontSize: 16,
    },
    itemContainer: {
        flexDirection:'column',
        width:screenWidth*0.3,
        alignItems:'flex-start',
        justifyContent:'flex-start',
        padding:0,
        margin:5,
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
    }
})

/*eslint prettier/prettier:0*/
/**
 * @format
 * @flow
 */

import * as React from 'react';
import {
    View, FlatList,
    Text, ScrollView,
    Image, StyleSheet,ImageBackground,
    Dimensions, TextInput, Alert, TouchableOpacity, ActivityIndicator, Platform, NativeModules, I18nManager,
} from 'react-native';
import FastImage from 'react-native-fast-image'
import {
    apiUrl,
    c_bg_search_box_dark,
    c_dark_line,
    c_dark_text, c_grey_darker,
    c_inactive_dot,
    c_loading_icon, c_main_background, c_main_orange,
    c_text_green, c_text_grey, CategoriesListScreenName, CategoryScreenName,
    greyHasOpacity, isForceRTL,
    key_user_info, LandingScreenName,
    ProductDetailScreenName,
    rc_success, RecentSearchScreenName, rq_client_get_categories,
    rq_get_category_products,
    rq_search_products,
    SearchResultScreenName,
} from '../resource/BaseValue';
import AsyncStorage from '@react-native-community/async-storage';
import getLanguage from '../resource/LanguageSupport';
import {globalStyle} from '../resource/style/GlobalStyle';
import {makeAPostRequest} from '../resource/SupportFunction';
import SearchHeaderBar from './SearchHeaderBar';
import SearchHeaderBarFunc from './SearchHeaderBarFunc';

export default class CategoriesListScreen extends React.Component {
    constructor (props) {
        super(props);
        this.flatlist = React.createRef();
        this.state = ({
            searchText:"",
            isRefresh: true,
            indicatorSizeW: 0,
            indicatorSizeH: 0,
            indicatorDisplay: false,
            categoryLists: []
        })
    }


    componentDidMount (){
        this.loadUserInfo();
    }

    componentWillReceiveProps(nextProps: Props, nextContext: *): * {
        if (this.flatlist != null && this.flatlist.current != null) {
            this.flatlist.current.scrollToOffset({offset: 0});
        }
        setTimeout(()=>{
            // if(this.props.route.params.searchText != null) {
            //     let allState = this.state;
            //     allState.next_product_id = 0;
            //     allState.searchText = this.props.route.params.searchText;
            //     this.setState(allState, () =>{
            //         this.startSearch(0);
            //     })
            // }
        },500);
    }


    loadUserInfo = async  () => {
        try {
            const value = await AsyncStorage.getItem(key_user_info)
            if(value != null) {
                // value previously stored
                const jsonValue = JSON.parse(value);
                let allState = this.state;
                allState.userInfo = jsonValue;
                this.setState(allState, ()=> this.loadCategoriesList());
            } else {

            }
        } catch(e) {
            // error reading value
        }
    }

    loadCategoriesList = async () => {
        let dataObj = {
            request: rq_client_get_categories,
            token: this.state.userInfo.token,
        }
        makeAPostRequest(dataObj,
            ()=>this._showLoadingBox(),
            ()=>this._closeLoadingBox(),
            (isSuccess, responseJson)=>{
                if (isSuccess) {
                    this.setState({categoryLists: responseJson['categories']})
                }
            });
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

    startSearch = async () => {
        this.props.navigation.navigate(SearchResultScreenName, {
            searchText: this.state.searchText
        })
    }

    displaySlider () {
        let sliderView = [];
        for (let i = 0; i < this.state.categoryLists.length; i++) {
            let sliderItem = this.state.categoryLists[i];
            sliderView.push(
                <View style={{flexDirection:'column', marginTop:10, padding:10}}>
                    <View style={{flexDirection:'row', alignItems:'center', marginStart:10}}>
                        <Text style={[globalStyle.textBasicBoldStyle, mStyle.textCategory]}>{sliderItem.name}</Text>
                        <FastImage
                            source={I18nManager.isRTL || langObj.isRTL ? require("../image/icon_arrow_left_yellow_d2.png") : require("../image/icon_arrow_right_yellow_d2.png")}
                            resizeMode="cover"
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

    render () {
        return (
            <View style={{flex:1, flexDirection:"column", backgroundColor:c_main_background}}>
                <SearchHeaderBarFunc navigation={this.props.navigation} title={CategoriesListScreenName}/>
                <ScrollView>
                    <View style={{flexDirection:'row', justifyContent:'flex-start', width:screenWidth, marginTop: 10}}>
                        <View style={[mStyle.titleContainer]}>
                            <Text style={[globalStyle.textBasicBoldStyle,mStyle.textTitle]}>{langObj.categoriesTitle}</Text>
                            <FastImage
                                source={I18nManager.isRTL || langObj.isRTL ? require("../image/icon_arrow_left_black_d2.png") : require("../image/icon_arrow_right_black_d2.png")}
                                resizeMode="contain"
                                style={{
                                    width:screenWidth*0.08,
                                    height:screenWidth*0.08* (108/156),marginStart:10}}
                            />
                        </View>
                    </View>
                    {this.displaySlider()}
                </ScrollView>
                <View style={{width:this.state.indicatorSizeW, height:this.state.indicatorSizeH, backgroundColor: greyHasOpacity,
                    flexDirection:"column",alignItems:"center", justifyContent:"center", position:"absolute",top:0,left:0}}>
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
    titleContainer: {
        flexDirection:'row',
        borderBottomColor:c_main_orange,
        alignItems:"center",
        borderBottomWidth:5,
        marginStart:20,
        paddingBottom:5
    },
    textTitle:{
        fontSize:22,
        color:c_text_grey
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
    }
})

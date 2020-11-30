/*eslint prettier/prettier:0*/
/**
 * @format
 * @flow
 */

import * as React from 'react';
import {
    View, TouchableOpacity, Dimensions, StyleSheet, Image, Text, I18nManager, ScrollView, FlatList,
} from 'react-native';
import getLanguage from '../resource/LanguageSupport';
import {
    c_bg_search_box_dark,
    c_dark_line_opacity,
    c_dark_text, c_grey_darker, c_main_orange,c_text_grey,
    c_text_green,
    CategoriesListScreenName, CategoryScreenName,
    greyHasOpacity,
    HomeScreenName, key_recent_search, key_user_info, MainScreenName, RecentSearchScreenName, SearchResultScreenName,
} from '../resource/BaseValue';
import {globalStyle} from '../resource/style/GlobalStyle';
import AsyncStorage from '@react-native-community/async-storage';
import SearchHeaderBarFunc from './SearchHeaderBarFunc';
import FastImage from 'react-native-fast-image';

export default class RecentSearchScreen extends React.Component  {
    constructor (props) {
        super(props);
        this.state = ({
            searchText:"",
            recentSearchTextList: [
                // "abc", "1", "2", "6"
            ],
            previousScreen: "",
        })
    }

    componentDidMount () {
        this.loadRecentList();
    }


    componentWillReceiveProps() {
        this.loadRecentList();
    }

    loadRecentList = async () => {
        const value = await AsyncStorage.getItem(key_recent_search);
        console.log("loadRecentList: " + value);
        if (value != null) {
            this.setState({recentSearchTextList: JSON.parse(value)});
        } else {
            this.setState({recentSearchTextList: []})
        }
    }

    removeFromRecentSearch = async (index) =>{
        const value = await AsyncStorage.getItem(key_recent_search);
        let searchList = JSON.parse(value);
        let newSearchList = [];
        for (let i = 0; i < searchList.length; i++) {
            if (i != index) {
                newSearchList.push(searchList[i]);
            }
        }
        this.setState({recentSearchTextList: newSearchList});
        AsyncStorage.setItem(key_recent_search, JSON.stringify(newSearchList));
    }

    render() {
        return (
            <View style={{flexDirection: "column"}}>
                <SearchHeaderBarFunc
                    navigation={this.props.navigation}
                    title={RecentSearchScreenName}/>
                <ScrollView>
                    <View style={{flexDirection:'row', justifyContent:'flex-start', width:screenWidth, marginTop:10}}>
                        <View style={[mStyle.titleContainer]}>
                            <Text style={[globalStyle.textBasicBoldStyle,globalStyle.textSection, {color:c_text_grey}]}>{langObj.recentSearches}</Text>
                            <FastImage
                                source={I18nManager.isRTL || langObj.isRTL ? require("../image/icon_arrow_left_black_d2.png") : require("../image/icon_arrow_right_black_d2.png")}
                                resizeMode="contain"
                                style={{
                                    width:screenWidth*0.08,
                                    height:screenWidth*0.08* (108/156),marginStart:10}}
                            />
                        </View>
                    </View>
                    <FlatList
                        style={{ marginTop:20}}
                        data={this.state.recentSearchTextList}
                        renderItem={({item, index}) =>
                            <TouchableOpacity
                                onPress={()=> {
                                    this.props.navigation.goBack();
                                    setTimeout(()=>{
                                        this.props.navigation.navigate(SearchResultScreenName,{
                                            searchText: item
                                        })
                                    }, 100);
                                }}
                                style={{flexDirection: 'column', alignItems: 'flex-start'}}>
                                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                    <Text
                                        numberOfLines={1}
                                        style={[globalStyle.textBasicStyle,{flex:1,marginStart:20,fontSize:18}]}>{item}</Text>
                                    <TouchableOpacity
                                        onPress={()=>{
                                            this.removeFromRecentSearch(index);
                                        }}
                                        style={{marginEnd:10}}>
                                        <FastImage
                                            source={require("../image/icon_close_black.png")}
                                            resizeMode="contain"
                                            style={{
                                                width:screenWidth*0.03,
                                                height:screenWidth*0.03 ,margin:5}}
                                        />
                                    </TouchableOpacity>
                                </View>
                                <View style={{width:screenWidth-20,margin: 10, height:1, backgroundColor:c_grey_darker}}/>
                            </TouchableOpacity>
                        }
                        keyExtractor={item => item.id}
                    />
                </ScrollView>
            </View>
        );
    }
}


let langObj = getLanguage();
const screenWidth = Math.round(Dimensions.get('window').width);
const mStyle = StyleSheet.create({
    titleContainer: {
        flexDirection:'row',
        borderBottomColor:c_main_orange,
        alignItems:"center",
        borderBottomWidth:5,
        marginStart:20,
        paddingBottom:5
    },
})

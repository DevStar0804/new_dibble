/*eslint prettier/prettier:0*/
/**
 * @format
 * @flow
 */

import * as React from 'react';
import {
    View, TouchableOpacity, Dimensions, StyleSheet, Image, Text, TextInput,
} from 'react-native';
import getLanguage from '../resource/LanguageSupport';
import {
    c_bg_search_box_dark, c_cursor_textInput,
    c_dark_line_opacity,
    c_dark_text,
    c_text_green,
    CategoriesListScreenName,
    greyHasOpacity,
    HomeScreenName, MainScreenName, RecentSearchScreenName, SearchResultScreenName,
} from '../resource/BaseValue';
import {globalStyle} from '../resource/style/GlobalStyle';
import RecentSearchScreen from './ScreenRecentSearch';
import FastImage from 'react-native-fast-image';

export default class SearchHeaderBar extends React.Component  {
    constructor (props) {
        super(props);
        this.state = ({
            searchText:""
        })
    }

    componentDidMount () {

    }

    startSearch = () => {
        this.props.navigation.navigate(SearchResultScreenName, {
            searchText: this.state.searchText
        })
    }

    render() {
        return (
            <View style={[globalStyle.header,{width:screenWidth, paddingStart:5, paddingEnd:5,flexDirection:'column',alignItems:'center',
                backgroundColor:"#ffffff"}]}>
                <View style={{flexDirection: 'row', width: screenWidth, alignItems:'center',justifyContent:'center',marginTop:10}}>
                    <Text style={[globalStyle.textBasicBoldStyle, {fontWeight:'bold'}]}>{langObj.appName}</Text>
                    <FastImage
                        source={require("../image/icon_logo.png")}
                        resizeMode="contain"
                        style={{
                            width:screenWidth*0.05,
                            height:screenWidth*0.05*(312/298),marginStart:5}}
                    />
                </View>
                <View style={{flexDirection:'row'}}>
                    <View style={{flexDirection:'row', alignItems:'center', flex:1, margin:10,
                        backgroundColor:c_bg_search_box_dark, borderRadius:10, paddingStart:10, paddingEnd:10}}>

                        <TextInput
                            style={[globalStyle.textSearch,{textAlign:'center'}]}
                            value={this.state.searchText}
                            selectionColor={c_cursor_textInput}
                            onFocus={()=>{
                                this.props.navigation.navigate(RecentSearchScreenName);
                            }}
                            onSubmitEditing={()=>{
                                this.startSearch();
                            }}
                            onChangeText={(text)=>{
                                this.setState({searchText: text})
                            }}
                            placeholder={langObj.searchTextInMain}
                        />
                        <TouchableOpacity
                            onPress={()=>{

                            }}>
                            <FastImage
                                source={require("../image/icon_search_static.png")}
                                resizeMode="contain"
                                style={{
                                    width:screenWidth*0.07,
                                    height:screenWidth*0.07*(138/148),marginEnd:5}}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    }
}


let langObj = getLanguage();
const screenWidth = Math.round(Dimensions.get('window').width);
const mStyle = StyleSheet.create({
    footerContainer: {
        width:screenWidth,
        backgroundColor:"#fff",
        borderTopWidth:0.5,
        borderTopColor:greyHasOpacity,
        flexDirection:'row',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 0,
    },
    footerItem : {
        flexDirection:'column',
        flex:1,
        alignItems:'center',
        justifyContent: 'center',
        padding: 5,
    },
    footerImage: {
        width:screenWidth*0.1,
        height:screenWidth*0.1,
    },
    footerText: {
        fontSize:13,
        color:'#000000',
        textAlign:'center',
    }

})

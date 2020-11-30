

import * as React from 'react';
import {
    View, TouchableOpacity, Dimensions, StyleSheet, Image, Text
} from 'react-native';
import getLanguage from '../resource/LanguageSupport';
import {globalStyle} from '../resource/style/GlobalStyle';
import FastImage from 'react-native-fast-image';


export default class DefaultErrorDialog extends React.Component  {
    constructor (props) {
        super(props);
        this.state = ({

        })
    }

    componentDidMount () {

    }


    componentWillReceiveProps() {

    }


    render() {
        return (
            <View style={{flexDirection: "column", height:'100%' ,justifyContent:'flex-end'}}>
                <TouchableOpacity
                    onPress={()=>{
                        this.props.navigation.goBack();
                    }}
                    activeOpacity={1}
                    style={{flex:1, width:screenWidth}}
                />
                <View style={[mStyle.modalContainer]}>
                    <TouchableOpacity
                        onPress={()=>{
                            this.props.navigation.goBack();
                        }}
                        style={{alignSelf: 'flex-end'}}>
                        <FastImage
                            source={require("../image/icon_close_black.png")}
                            resizeMode="contain"
                            style={{
                                width:screenWidth*0.04,
                                height:screenWidth*0.04,margin:5}}
                        />
                    </TouchableOpacity>
                    <FastImage
                        source={require("../image/icon_system_error.png")}
                        resizeMode="contain"
                        style={{
                            width:screenWidth*0.2,
                            height:screenWidth*0.2*(174/194),alignSelf: 'center'}}
                    />
                    <View style={[globalStyle.sectionTitleCenterContainer, {width:screenWidth*0.6}]}>
                        <Text style={[globalStyle.textBasicBoldStyle,globalStyle.textSectionCenter]}>{langObj.errorDialogTitle}</Text>
                    </View>
                    <Text style={[globalStyle.textBasicStyle, {fontSize:18, alignSelf:'center', marginTop:20, marginBottom: 20}]}>{langObj.errorDialogMessage}</Text>
                    <TouchableOpacity
                        onPress={()=>{
                            this.props.navigation.goBack();
                        }}
                        style={[mStyle.buttonDarker]}>
                        <Text style={[globalStyle.textBasicBoldStyle, {color:"#ffffff", fontSize:24}]}>{langObj.continue}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
}


let langObj = getLanguage();
const screenWidth = Math.round(Dimensions.get('window').width);
const mStyle = StyleSheet.create({
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
})

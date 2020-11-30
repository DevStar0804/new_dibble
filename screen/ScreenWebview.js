/*eslint prettier/prettier:0*/
/**
 * @format
 * @flow
 */

import * as React from 'react';
import {
    View, StyleSheet, Dimensions,ActivityIndicator,
} from 'react-native';
import {
    c_grey_light, c_loading_icon, c_main_background, greyHasOpacity,
} from '../resource/BaseValue';
import { WebView } from 'react-native-webview';
import getLanguage from '../resource/LanguageSupport';
import FastImage from 'react-native-fast-image';

export default class WebviewScreen extends React.Component {
    constructor (props) {
        super(props);
        this.state = ({
            isRefresh: true,
            indicatorSizeW: 0,
            indicatorSizeH: 0,
            indicatorDisplay: false,
            link:""
        })
    }


    componentDidMount (){
        this.setState({
            link: this.props.route.params.link
        })
    }

    componentWillReceiveProps(nextProps: Props, nextContext: *): * {
        // if (this.catFlatlist.current != null) {
        //     this.catFlatlist.current.scrollToOffset({ animated: true, offset: 0 });
        // }
        this.setState({
            link:"",
        }, ()=>{
            this._showLoadingBox()
        })
        setTimeout(()=>{
            let allState = this.state;
            allState.link = this.props.route.params.link;
            this.setState(allState, ()=> {
                this._closeLoadingBox();
            });
        },500);
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
                <WebView
                    source={{
                        uri: this.state.link
                    }}
                    style={{ flex:1, width:screenWidth }}
                />

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

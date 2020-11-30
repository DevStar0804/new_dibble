/*eslint prettier/prettier:0*/
/**
 * @format
 * @flow
 */

import React, { Component } from "react";
import {
    View,
    Image,
    ActivityIndicator,
    TouchableOpacity,
    Dimensions,
    Button
} from "react-native";
import Dot from './Dot'
import Carousel, { Pagination } from "react-native-snap-carousel"; //Thank From distributer(s) of this lib
import styles from "./SliderBox.style";
import { getDesignDimension } from "../LanguageSupport";
import {create} from 'react-native-pixel-perfect';

// -------------------Props---------------------
// images
// onCurrentImagePressed
// sliderBoxHeight
// parentWidth
// dotColor
// inactiveDotColor
// dotStyle
// paginationBoxVerticalPadding
// circleLoop
// autoplay
// ImageComponent
// paginationBoxStyle
// resizeMethod
// resizeMode
// ImageComponentStyle,
// imageLoadingColor = "#E91E63"
// firstItem = 0

const width = Dimensions.get("window").width;
let perfectSize=create(getDesignDimension())
export class SliderBox extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentImage: 0,
            loading: [],
            number_of_images: this.props.images.length
        };
        this.onCurrentImagePressedHandler = this.onCurrentImagePressedHandler.bind(
            this
        );
        this.onSnap = this.onSnap.bind(this);
    } 
    componentWillUnmount(){
        this.setState({currentImage:0})
    }
    onCurrentImagePressedHandler() {
        if (this.props.onCurrentImagePressed) {
            this.props.onCurrentImagePressed(this.state.currentImage);
        }
    }

    onSnap(index) {
        console.log(index)
        
        const { currentImageEmitter } = this.props;
        // if (index==0){
        this.setState({ currentImage: index }, () => {
            if (currentImageEmitter) currentImageEmitter(this.state.currentImage);
        });
    // }
    // else{
    //     this.setState({ currentImage: this.props.images.length-index }, () => {
    //         if (currentImageEmitter) currentImageEmitter(this.state.currentImage);
    //     });
    // }
    }

    _renderItem({ item, index }) {
        const {
            ImageComponent,
            ImageComponentStyle = {},
            sliderBoxHeight,
            disableOnPress,
            resizeMethod,
            resizeMode,
            imageLoadingColor = "#E91E63"
        } = this.props;
        return (
            <View
                style={{
                    position: "relative",
                    justifyContent: "center"
                }}
            >
                <TouchableOpacity
                    key={index}
                    disabled={disableOnPress}
                    onPress={this.onCurrentImagePressedHandler}
                    activeOpacity={1}
                >
                     <ImageComponent
                        style={[
                            {
                                width: "100%",
                                height: "100%",
  
                            },
                            ImageComponentStyle
                        ]}
                        source={typeof item === "string" ? { uri: item } : item}
                         onLoad={() => {}}
                        onLoadStart={() => {}}
                        onLoadEnd={() => {
                            let t = this.state.loading;
                            t[index] = true;
                            this.setState({ loading: t });
                        }}
                        {...this.props}
                    />
                </TouchableOpacity>
                {!this.state.loading[index] && (
                    <ActivityIndicator
                        size="large"
                        color={imageLoadingColor}
                        style={{
                            position: "absolute",
                            alignSelf: "center"
                        }}
                    />
                )}
            </View>
        );
    }

    // get pagination() {
    //     const { currentImage } = this.state;
    //     const {
    //         images,
    //         dotStyle,
    //         dotColor,
    //         inactiveDotColor,
    //         paginationBoxStyle,
    //         paginationBoxVerticalPadding
    //     } = this.props;
    //     return (
    //         <Pagination
    //             borderRadius={2}
    //             dotsLength={images.length}
    //             activeDotIndex={ currentImage}
    //             dotStyle={dotStyle || styles.dotStyle}
    //             dotColor={dotColor || colors.dotColors}
    //             inactiveDotColor={inactiveDotColor || colors.white}
    //             inactiveDotScale={0.8}
    //             inactiveDotOpacity={0.8}
    //             autoplayTimeout={0}
    //             containerStyle={[
    //                 styles.paginationBoxStyle,
    //                 paginationBoxVerticalPadding
    //                     ? { paddingVertical: paginationBoxVerticalPadding }
    //                     : {},
    //                 paginationBoxStyle ? paginationBoxStyle : {}
    //             ]}
    //             {...this.props}
    //         />
    //     );
    // }

    render() {
        const {
            images,
            circleLoop,
            autoplay,
            parentWidth,
            loopClonesPerSide,
            autoplayDelay
        } = this.props;
        return (
            <View style={{flexDirection:'column' }}>
                 <Carousel
                     data={images}
                     enableSnap={true}
                    itemWidth={parentWidth || width}
                    sliderWidth={parentWidth || width}
                     renderItem={item => this._renderItem(item)}
                    onSnapToItem={index => this.onSnap(index)}
                    style={{flex:1}}
                    firstItem={ this.props.images[this.state.number_of_images-1]}

                 />
                <View style={{flexDirection:'row',alignItems:'center',marginStart:perfectSize(500),marginTop:perfectSize(-50)} }>
               { this.props.images.length>1&&images.map((img,index)=><Dot circle_radius={10} visible={index==this.state.currentImage?true:false} color="black"></Dot>)}
               </View>
        </View>
        );
    }
}

const colors = {
    dotColors: "#BDBDBD",
    white: "#FFFFFF"
};

SliderBox.defaultProps = {
    ImageComponent: Image
};

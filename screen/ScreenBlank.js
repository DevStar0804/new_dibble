/*eslint prettier/prettier:0*/
/**
 * @format
 * @flow
 */

import * as React from 'react';
import {
    View,
} from 'react-native';
import {
    c_main_background,
} from '../resource/BaseValue';

export default class BlankScreen extends React.Component {
    constructor (props) {
        super(props);
        this.flatlist = React.createRef();
        this.state = ({

        })
    }


    componentDidMount (){

    }

    render () {
        return (
            <View style={{flex:1, flexDirection:"column", backgroundColor:c_main_background}}>

            </View>
        );
    }
}


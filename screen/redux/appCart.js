/*eslint prettier/prettier:0*/
import AsyncStorage from '@react-native-community/async-storage';
import {key_products_cart} from '../../resource/BaseValue';

/**
 * @format
 * @flow
 */

// action type
export const UPDATE_CART = 'update_cart';
export const UPDATE_LIKE_PRODUCT = 'update_like_product';

let cartUpdateIndex = 0;
let likeProductUpdateIndex = 0;

export function callUpdateCart (amount) {
    console.log("callUpdateCart - appCart " + cartUpdateIndex);
    return {
        type : UPDATE_CART,
        updateIndex : cartUpdateIndex++,
        amount : amount,
    }
}
export function callUpdateLikeProduct () {
    console.log("callUpdateLikeProduct - appCart " + likeProductUpdateIndex);
    return {
        type : UPDATE_LIKE_PRODUCT,
        updateIndex : likeProductUpdateIndex++,

    }
}

// reducer
let initialState = [ {
    updateIndex: 0,
    likeProductsUpdate: 0,
    amount : 0
}];

function cartReducer (state = initialState, action) {
    console.log("cartReducer - appCart " + action.updateIndex);
    if (action.type == UPDATE_CART) {
        return [
            {
                updateIndex: action.updateIndex,
                amount: action.amount
            }
        ]
    } else if (action.type == UPDATE_LIKE_PRODUCT) {
        return [
            {
                likeProductsUpdate: action.likeProductsUpdate,
            }
        ]
    } else {
        return state;
    }
}

export default cartReducer;

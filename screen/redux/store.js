/*eslint prettier/prettier:0*/
/**
 * @format
 * @flow
 */

import { createStore } from 'redux'
import cartReducer from './appCart';

const store = createStore(cartReducer);
export default store;

import React, { useCallback, useContext, useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';
import { getLogger } from '../core';
import { ItemProps } from './ItemProps';
import { createItem, getItems, newWebSocket, updateItem,removeItem, promiseWithTimeout, promiseWithTimeout2 } from './itemApi';
import { AuthContext } from '../auth';
import { Plugins } from '@capacitor/core';
import {useBackgroundTaskDeleting, useBackgroundTaskFetching, useBackgroundTaskSaving } from './useBackgroundTask';

const {Storage}=Plugins;

const log = getLogger('ItemProvider');

type SaveItemFn = (item: ItemProps) => Promise<any>;
type DeleteItemFn = (item: ItemProps) => Promise<any>;

export interface ItemsState {
  items?: ItemProps[],
  savingBackground:boolean,
  deletingBackground:boolean,
  fetchingBackground:boolean,
  fetching: boolean,
  fetchingError?: Error | null,
  saving: boolean,
  savingError?: Error | null,
  saveItem?: SaveItemFn,
  deleting:boolean,
  deletingError?:Error|null,
  deleteItem?:DeleteItemFn,

  itemsStorage?:ItemProps[],
  deletedItems?:ItemProps[],
}

interface ActionProps {
  type: string,
  payload?: any,
}

const initialState: ItemsState = {
  savingBackground:false,
  deletingBackground:false,
  fetchingBackground:false,
  fetching: false,
  saving: false,
  deleting:false,
};

const FETCH_ITEMS_STARTED = 'FETCH_ITEMS_STARTED';
const FETCH_ITEMS_SUCCEEDED = 'FETCH_ITEMS_SUCCEEDED';
const FETCH_ITEMS_FAILED = 'FETCH_ITEMS_FAILED';

const SAVE_ITEM_STARTED = 'SAVE_ITEM_STARTED';
const SAVE_ITEM_SUCCEEDED = 'SAVE_ITEM_SUCCEEDED';
const SAVE_ITEM_FAILED = 'SAVE_ITEM_FAILED';

const DELETE_ITEM_STARTED = 'DELETE_ITEM_STARTED';
const DELETE_ITEM_SUCCEEDED = 'DELETE_ITEM_SUCCEEDED';
const DELETE_ITEM_FAILED = 'DELETE_ITEM_FAILED';
const GET_ITEMS_STORAGE = 'GET_ITEMS_STORAGE';

async function setStorage(items:ItemProps[]){
  console.log("SETEZ STORAGE "+items)
  await Storage.set({
    key:'items',
    value: JSON.stringify(items),
  });
}

const reducer: (state: ItemsState, action: ActionProps) => ItemsState =
  (state, { type, payload }) => {
    switch (type) {
      case FETCH_ITEMS_STARTED:
        return { ...state, fetching: true, fetchingError: null };
      case FETCH_ITEMS_SUCCEEDED:
        //persistenta
        setStorage(payload.items);
        return { ...state,fetchingBackground:false, items: payload.items, fetching: false };
      case FETCH_ITEMS_FAILED:
        var fetch=state.fetchingBackground;
        return { ...state,fetchingBackground:!fetch, fetchingError: payload.error, fetching: false };
      case SAVE_ITEM_STARTED:
        console.log("saving e TRUE!!!")
        return { ...state, savingError: null, saving: true };
      case SAVE_ITEM_SUCCEEDED:
        const items = [...(state.items || [])];
        const item = payload.item;
        const index = items.findIndex(it => it._id === item._id);
        if (index === -1) {
          items[items.length]=item;
        } 
        else {
          items[index] = item;
        }
        log(items)
        setStorage(items);
        console.log("saving e FALSE!!!")
        return { ...state,savingBackground:false, items, saving: false };
      case SAVE_ITEM_FAILED:
        const items4 = [...(state.items || state.itemsStorage||[])];
        const item4 = payload.item;
        const index4 = items4.findIndex(it => it._id === item4._id);
        if (index4 === -1) {
          items4[items4.length]=item4;
        } 
        else {
          items4[index4] = item4;
        }
        log(items4)
        setStorage(items4);
        console.log("saving e FALSE!!!")
        var save=state.savingBackground
        return { ...state,savingBackground:!save, savingError: payload.error, saving: false,itemsStorage:items4 };
      case DELETE_ITEM_STARTED:
        const deleted=[...(state.deletedItems || [])];
        const itemDel = payload.item;
        deleted[deleted.length]=itemDel;
        return {...state, deletingError:null,deleting:true,deletedItems:deleted};
      case DELETE_ITEM_SUCCEEDED:
        const items2 = [...(state.items || [])];
        const item2 = payload.item;
        log(item2);

        const index2 = items2.findIndex(it => it._id === item2._id);
        items2.splice(index2,1);
        const deleted2=[...(state.deletedItems || [])];
        const indexDel = deleted2.findIndex(it => it._id === item2._id);
        deleted2.splice(indexDel,1);

        setStorage(items2);
        return {...state,deletingBackground:false,items:items2,deleting:false,deletedItems:deleted2};
      case DELETE_ITEM_FAILED:
        const items3 = [...(state.items || state.itemsStorage||[])];
        const item3 = payload.item;
        const index3 = items3.findIndex(it => it._id === item3._id);
        items3.splice(index3,1);
        setStorage(items3);
        var del=state.deletingBackground;
        return{...state,deletingBackground:!del,deletingError:payload.error,deleting:false,itemsStorage:items3};
      case GET_ITEMS_STORAGE:
        return {...state,itemsStorage:payload.storageItems,items:undefined}
      default:
        return state;
    }
  };

export const ItemContext = React.createContext<ItemsState>(initialState);

interface ItemProviderProps {
  children: PropTypes.ReactNodeLike,
}

export const ItemProvider: React.FC<ItemProviderProps> = ({ children }) => {
  const { token } = useContext(AuthContext);
  const [state, dispatch] = useReducer(reducer, initialState);
  const { items,savingBackground,deletingBackground,fetchingBackground, fetching, fetchingError, saving, savingError,deleting,deletingError,itemsStorage,deletedItems } = state;
  useEffect(getItemsEffect, [token,itemsStorage]);
  useEffect(wsEffect, [token]);

  useEffect(getItemsStorageEffect,[saving,deleting]);

  const saveItem = useCallback<SaveItemFn>(saveItemCallback, [token]);

  const deleteItem=useCallback<DeleteItemFn>(DeleteItemCallback,[token]);
  useBackgroundTaskFetching(() => new Promise(resolve => {
    // console.log('My Background Task');
    getItemsEffect();
    resolve();
  }),fetchingBackground);
  useBackgroundTaskSaving(() => new Promise(resolve => {
    // console.log('My Background Task');
    const last=itemsStorage ? itemsStorage[itemsStorage.length-1] : null;
    console.log(last);
    if(last)
      saveItemCallback(last);
    resolve();
  }),savingBackground);
  useBackgroundTaskDeleting(() => new Promise(resolve => {
    // console.log('My Background Task');
    const last=deletedItems? deletedItems[deletedItems.length-1] : null;
    console.log(last);
    if(last){
      DeleteItemCallback(last);
    }
    resolve();
  }),deletingBackground);
  const value = { items,savingBackground,deletingBackground,fetchingBackground, fetching, fetchingError, saving, savingError, saveItem,deleting,deletingError,deleteItem,itemsStorage};


  log('returns');
  return (
    <ItemContext.Provider value={value}>
      {children}
    </ItemContext.Provider>
  );



  function getItemsStorageEffect(){
    getItemsStorage();
    async function getItemsStorage(){
      const res=await Storage.get({key:'items'});
      console.log(res.value);
      if(res.value){
        const storageItems=JSON.parse(res.value);
        dispatch({ type: GET_ITEMS_STORAGE, payload: { storageItems } });
      }
    }
  }

  function getItemsEffect() {
    let canceled = false;
    fetchItems();
    return () => {
      canceled = true;
    }

    async function fetchItems() {
      if (!token?.trim()) {
        return; 
      }
      // try {
        // log('fetchItems started');
        // dispatch({ type: FETCH_ITEMS_STARTED });
        // const items = await getItems(token);
        // const items = await getItemsTimeOut(token);
        const {promiseOrTimeout,timeoutId}=promiseWithTimeout(getItems(token));
        try{
          log('fetchItems started');
          dispatch({ type: FETCH_ITEMS_STARTED });
          const items=await promiseOrTimeout;
          // const items=await result.json();
          log('fetchItems succeeded');
          if (!canceled) {
            
            dispatch({ type: FETCH_ITEMS_SUCCEEDED, payload: { items } });
          }
        }
        catch(error){
          log('fetchItems failed');
          dispatch({ type: FETCH_ITEMS_FAILED, payload: {error } });
        }
        finally{
          clearTimeout(timeoutId);
        }
        // log('fetchItems succeeded');
        // if (!canceled) {
          
        //   dispatch({ type: FETCH_ITEMS_SUCCEEDED, payload: { items } });
        // }
      // } catch (error) {
      //   log('fetchItems failed');
      //   dispatch({ type: FETCH_ITEMS_FAILED, payload: {error } });
      // }
    }
  }


  async function saveItemCallback(item: ItemProps) {
    // try {
    //   log('saveItem started');
    //   dispatch({ type: SAVE_ITEM_STARTED });
    //   // const savedItem = await (item._id ? updateItem(token, item) : createItem(token, item));
    //   const savedItem = await (item._id ? updateItem(token, item) : createItemTimeOut(token, item));
    //   log('saveItem succeeded');
    //   dispatch({ type: SAVE_ITEM_SUCCEEDED, payload: { item: savedItem } });
    // } catch (error) {
    //   log('saveItem failed');
    //   dispatch({ type: SAVE_ITEM_FAILED, payload: {item, error } });
    // }
    if(item._id){
      // const {promiseOrTimeout,timeoutId}=promiseWithTimeout(createItem(token,item));
      const {promiseOrTimeout2,timeoutId2}=promiseWithTimeout2(updateItem(token,item));
      try{
        log('saveItem started');
        dispatch({ type: SAVE_ITEM_STARTED });
        const savedItem = await (promiseOrTimeout2);
        // const items=await result.json();
        log('saveItem succeeded');
        dispatch({ type: SAVE_ITEM_SUCCEEDED, payload: { item: savedItem } });
    }
      catch(error){
        log('saveItem failed');
        dispatch({ type: SAVE_ITEM_FAILED, payload: {item, error } });
    }
      finally{
        clearTimeout(timeoutId2);
      }
    }
    else{
            const {promiseOrTimeout,timeoutId}=promiseWithTimeout(createItem(token,item));
            // const {promiseOrTimeout2,timeoutId2}=promiseWithTimeout2(updateItem(token,item));
            try{
              log('saveItem started');
              dispatch({ type: SAVE_ITEM_STARTED });
              const savedItem = await (promiseOrTimeout);
              // const items=await result.json();
              log('saveItem succeeded');
              dispatch({ type: SAVE_ITEM_SUCCEEDED, payload: { item: savedItem } });
          }
            catch(error){
              log('saveItem failed');
              dispatch({ type: SAVE_ITEM_FAILED, payload: {item, error } });
          }
            finally{
              clearTimeout(timeoutId);
            }
          
    }

  }


  async function DeleteItemCallback(item:ItemProps){
    // try{
    //   log('deleteItem started');
    //   dispatch({type:DELETE_ITEM_STARTED});
    //   const deletedItem = await (removeItem(token, item));
    //   log('deleteItem succeeded');
    //   dispatch({ type: DELETE_ITEM_SUCCEEDED, payload: { item:deletedItem } });
    // } catch (error) {
    //   log('deleteItem failed');
    //   dispatch({ type: DELETE_ITEM_FAILED, payload: {item, error } });
    // }
    const {promiseOrTimeout,timeoutId}=promiseWithTimeout(removeItem(token,item));
    try{
      log('deleteItem started');
      dispatch({type:DELETE_ITEM_STARTED, payload: { item:item }});
      const deletedItem = await promiseOrTimeout;
      log('deleteItem succeeded');
      dispatch({ type: DELETE_ITEM_SUCCEEDED, payload: { item:deletedItem } });
    }
    catch(error){
      log('deleteItem failed');
      dispatch({ type: DELETE_ITEM_FAILED, payload: {item, error } });
    }
    finally{
      clearTimeout(timeoutId);
    }
  }


  function wsEffect() {
    let canceled = false;
    log('wsEffect - connecting');
    let closeWebSocket: () => void;
    if (token?.trim()) {
      closeWebSocket = newWebSocket(token, message => {
        if (canceled) {
          return;
        }
        const { type, payload: item } = message;
        log(`ws message, item ${type}`);
        if (type === 'created' || type === 'updated') {
          // dispatch({ type: SAVE_ITEM_SUCCEEDED, payload: { item } });
        }
        if (type === 'deleted' ) {
          dispatch({ type: DELETE_ITEM_SUCCEEDED, payload: { item } });
        }
      });
    }
    return () => {
      log('wsEffect - disconnecting');
      canceled = true;
      closeWebSocket?.();
    }
  }
};

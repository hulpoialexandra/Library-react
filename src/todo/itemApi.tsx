import axios from 'axios';
import { authConfig, baseUrl, getLogger, withLogs } from '../core';
import { ItemProps } from './ItemProps';

const log = getLogger('itemApi');

const itemUrl = `http://${baseUrl}/api/item`;


export const getItems: (token:string) => Promise<ItemProps[]> = token => {
  log(token)
  return withLogs(axios.get(itemUrl, authConfig(token)), 'getItems');
}

export function promiseWithTimeout(promise:Promise<ItemProps[]>) {
  var timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error('Request timed out'));
    }, 3000);
  });
  return {
    promiseOrTimeout: Promise.race([promise, timeoutPromise]),
    timeoutId,
  };
}

export function promiseWithTimeout2(promise:Promise<ItemProps[]>) {
  var timeoutId2;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId2 = setTimeout(() => {
      reject(new Error('Request timed out'));
    }, 3000);
  });
  return {
    promiseOrTimeout2: Promise.race([promise, timeoutPromise]),
    timeoutId2,
  };
}

export const createItem: (token:string,item: ItemProps) => Promise<ItemProps[]> = (token,item) => {
  console.log(item.version)
  return withLogs(axios.post(itemUrl, item, authConfig(token)), 'createItem');
}


export const updateItem: (token:string,item: ItemProps) => Promise<ItemProps[]> = (token,item) => {
  return withLogs(axios.put(`${itemUrl}/${item._id}`, item, authConfig(token)), 'updateItem');
}

export const removeItem: (token:string,item: ItemProps) => Promise<ItemProps[]> = (token,item) => {
  return withLogs(axios.delete(`${itemUrl}/${item._id}`, authConfig(token)), 'deleteItem');
}

interface MessageData {
  type: string;
  payload: {
    item: ItemProps;
  };
}

export const newWebSocket = (token:string,onMessage: (data: MessageData) => void) => {
  const ws = new WebSocket(`ws://${baseUrl}`)
  ws.onopen = () => {
    log('web socket onopen');
    ws.send(JSON.stringify({ type: 'authorization', payload: { token } }));
  };
  ws.onclose = () => {
    log('web socket onclose');
  };
  ws.onerror = error => {
    log('web socket onerror', error);
  };
  ws.onmessage = messageEvent => {
    log('web socket onmessage');
    onMessage(JSON.parse(messageEvent.data));
  };
  return () => {
    ws.close();
  }
}

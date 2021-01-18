import { useEffect } from 'react';
import { Plugins } from '@capacitor/core';
import { isUndefined } from 'util';

const { BackgroundTask } = Plugins;

export const useBackgroundTaskSaving = (asyncTask: () => Promise<void>,savingBackground:boolean) => {
  useEffect(() => {
    if(savingBackground==false){
      return;
    }
    let taskId = BackgroundTask.beforeExit(async () => {
      console.log('useBackgroundTask - executeTask started');
      await asyncTask();
      console.log('useBackgroundTask - executeTask finished');
      BackgroundTask.finish({ taskId });
    });
  }, [])
  return {};
};

export const useBackgroundTaskDeleting = (asyncTask: () => Promise<void>,deletingBackground:boolean) => {
  useEffect(() => {
    if(deletingBackground==false){
      return;
    }
    let taskId = BackgroundTask.beforeExit(async () => {
      console.log('useBackgroundTask - executeTask started');
      await asyncTask();
      console.log('useBackgroundTask - executeTask finished');
      BackgroundTask.finish({ taskId });
    });
  }, [])
  return {};
};

export const useBackgroundTaskFetching = (asyncTask: () => Promise<void>,fetchingBackgroung:boolean) => {
  useEffect(() => {
    if(fetchingBackgroung==false){
      return;
    }
    let taskId = BackgroundTask.beforeExit(async () => {
      console.log('useBackgroundTask - executeTask started');
      await asyncTask();
      console.log('useBackgroundTask - executeTask finished');
      BackgroundTask.finish({ taskId });
    });
  }, [])
  return {};
};

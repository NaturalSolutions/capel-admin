import { NgModule } from '@angular/core';
import { config } from '../settings';

import { combineReducers } from 'redux';
import { NgRedux, DevToolsExtension } from '@angular-redux/store';
import { createLogger } from 'redux-logger';
import * as persistState from 'redux-localstorage';

import { SessionModule } from '../models/session.model';
import { SessionActionsService } from './session/session-actions.service';
import { sessionReducer } from './session/session-reducer.service';
import { AppActionsService } from './app/app-actions.service';
import { AppModel } from '../models/app.model';
import { appReducer } from './app/app-reducer.service';



export class IAppState {
  app?: AppModel;
  session?: SessionModule;
}

@NgModule({
  providers: [SessionActionsService, AppActionsService]
})
export class StoreModule {
  constructor(
    private ngRedux: NgRedux<IAppState>,
    public devTool: DevToolsExtension
  ) {
    const initialState: any = JSON.parse(localStorage.getItem(config.appName));

    const enhancers = [persistState(['session', 'app'], {
      key: config.appName
    })];

    this.ngRedux.configureStore(
      combineReducers<IAppState>({
        app: appReducer,
        session: sessionReducer
      }),
      initialState || {},
      [createLogger()],
      [...enhancers, devTool.isEnabled() ? devTool.enhancer() : f => f]
    );
  }
}

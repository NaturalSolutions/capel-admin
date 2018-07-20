import { Component } from '@angular/core';
import {NgRedux} from '@angular-redux/store';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  checkUserState;
  public constructor(
    private ngRedux: NgRedux<any>
  ) {
    const appState = this.ngRedux.getState()
    this.checkUserState = appState.session.profile;
    console.log(this.checkUserState);
  }
}

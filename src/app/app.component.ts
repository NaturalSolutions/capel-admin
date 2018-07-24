import {Component, OnInit} from '@angular/core';
import {NgRedux} from '@angular-redux/store';
import {Router} from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  showSidenav;
  pageNoSidenav;
  public constructor(
    private ngRedux: NgRedux<any>,
    private router: Router
  ) {
    const appState = this.ngRedux.getState();
  }
  ngOnInit() {
    this.router.events.subscribe(value => {
      console.log(this.pageNoSidenav)
      this.pageNoSidenav = ['/login', '/register'].indexOf(this.router.routerState.snapshot.url) > -1;
      console.log(this.pageNoSidenav)

      if (this.pageNoSidenav)
        this.showSidenav = false;
      else
        this.showSidenav = true;
    });
  }
}

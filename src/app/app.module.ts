import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ChartModule } from 'angular2-highcharts';

import { AppComponent } from './app.component';
import {InitGuard} from './services/init-guard';
import {AuthGuard} from './services/auth-guard';
import {UserService} from './services/user.service';
import {AuthInterceptorService} from './services/auth-interceptor.service';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {LoginComponent} from './login/login.component';
import {AppMaterialModule} from './app-material/app-material.module';
import {AppRoutingModule} from './app-routing.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgReduxModule} from '@angular-redux/store';
import {StoreModule} from './store/store.module';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {AppDialogsModule} from './app-dialogs/app-dialogs.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MatGridListModule, MatCardModule, MatMenuModule, MatIconModule, MatButtonModule, MatToolbarModule, MatSidenavModule, MatListModule } from '@angular/material';
import { LayoutModule } from '@angular/cdk/layout';
import { AdminNavComponent } from './admin-nav/admin-nav.component';
import { UsersComponent, MoodRendererComponent} from './users/users.component';
import { DivesComponent } from './dives/dives.component';
import {AgGridModule} from 'ag-grid-angular';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {LeafletModule} from '@asymmetrik/ngx-leaflet';
import {LeafletMarkerClusterModule} from '@asymmetrik/ngx-leaflet-markercluster';
import {PermitService} from './services/permit.service';
import {DashboardService} from './services/dashboard.service';
import { HighchartsStatic } from 'angular2-highcharts/dist/HighchartsService';
import { DialogComponent } from './dialog/dialog.component';
import { BoatsComponent } from './boats/boats.component';
import {TypePermitFormComponent} from './type-permit-form/type-permit-form.component';
import {TypePermitsComponent} from './type-permits/type-permits.component';
import {PermitsComponent} from './permits/permits.component';
import {OffenseComponent} from './offense/offense.component';
import { ExportComponent } from './export/export.component';
declare var require: any;
export function highchartsFactory() {
  const hc = require('highcharts/highstock');
  const dd = require('highcharts/modules/exporting');
  dd(hc);
  return hc;
}
@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardComponent,
    AdminNavComponent,
    UsersComponent,
    TypePermitFormComponent,
    DivesComponent,
    TypePermitsComponent,
    DialogComponent,
    MoodRendererComponent,
    BoatsComponent,
    PermitsComponent,
    OffenseComponent,
    ExportComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppMaterialModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgReduxModule,
    StoreModule,
    HttpClientModule,
    AppDialogsModule,
    MatGridListModule,
    MatCardModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    LayoutModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    NgbModule.forRoot(),
    AgGridModule.withComponents([MoodRendererComponent]),
    LeafletModule.forRoot(),
    LeafletMarkerClusterModule.forRoot(),
    ChartModule
  ],
  entryComponents: [
    DialogComponent,
    OffenseComponent
  ],
  providers: [
    AuthGuard,
    PermitService,
    UserService,
    DashboardService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptorService,
      multi: true,
    },
    {
      provide: HighchartsStatic,
      useFactory: highchartsFactory
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

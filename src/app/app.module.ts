import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

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
import { UsersComponent } from './users/users.component';
import { DivesComponent } from './dives/dives.component';
import {AgGridModule} from 'ag-grid-angular';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {LeafletModule} from '@asymmetrik/ngx-leaflet';
import {LeafletMarkerClusterModule} from '@asymmetrik/ngx-leaflet-markercluster';
import {PermitService} from './services/permit.service';
import {PermitFormComponent} from './permit-form/permit-form.component';
import { PermitsComponent } from './permits/permits.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardComponent,
    AdminNavComponent,
    UsersComponent,
    PermitFormComponent,
    DivesComponent,
    PermitsComponent
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
    AgGridModule.withComponents([]),
    LeafletModule.forRoot(),
    LeafletMarkerClusterModule.forRoot(),
  ],
  entryComponents: [
],
  providers: [
    AuthGuard,
    PermitService,
    UserService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptorService,
      multi: true,
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

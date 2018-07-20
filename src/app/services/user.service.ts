import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams, HttpResponse} from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { NgRedux } from '@angular-redux/store';
import 'rxjs/add/operator/share';

import { SessionActionsService } from '../store/session/session-actions.service';
import { config } from '../settings';

@Injectable()
export class UserService {

  constructor(
      private http: HttpClient,
      private ngRedux: NgRedux<any>,
      private sessionActionsService: SessionActionsService) {
    }

  login(data: any): Promise<any> {
    return this.http.post<any>(config.serverURL + '/api/users/login', data)
      .toPromise();
  }

  logout() {
    this.sessionActionsService.close();
  }

  getProfile(): Promise<any> {
    return this.http.get<any>(config.serverURL + '/api/users/me')
      .toPromise();
  }
  setPassword(email:any): Promise<any> {
    return this.http.get<any>(config.serverURL + '/api/users/' + email + '/password/recover')
      .toPromise();
  }
  getUsers(): Promise<any> {
    return this.http.get<any>(config.serverURL + '/api/users')
      .toPromise();
  }
  getDiveHearts(): Promise<any> {
    return this.http.get<any>(config.serverURL + '/api/users/divehearts')
      .toPromise();
  }
  getCheckedPointHearts(data: any): Promise<any> {
    console.log(data);
    return this.http.post<any>(config.serverURL + '/api/users/divehearts/checkpoint', data)
      .toPromise();
  }
  post(data: any): Promise<any> {
    return this.http.post<any>(config.serverURL + '/api/users', data)
      .toPromise();
  }
  delete(data: any): Promise<any> {
    let body = new HttpParams();
    for (const user of data)
    body = body.append('id[]', user.id);
    return this.http.delete<any>(config.serverURL + '/api/users', {params: body})
      .toPromise();
  }
  patch(data: any): Promise<any> {
    return this.http.patch<any>(config.serverURL + '/api/users', data)
      .toPromise();
  }
  patchMe(data: any): Promise<any> {
    return this.http.patch<any>(config.serverURL + '/api/users/me', data)
      .toPromise();
  }

  private extractData(res: Response) {
    return res || {};
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }

  getPermit(uid: number): Observable<HttpResponse<Blob>> {
    console.log('req permit');
    const headers = new HttpHeaders(
      {'Content-Type': 'application/pdf', 'Accept': 'application/pdf'})
    return this.http.get(`${config.serverURL}/api/users/${uid}/permit.pdf`,
                         {headers, observe: 'response', responseType: 'blob'})
  }
}

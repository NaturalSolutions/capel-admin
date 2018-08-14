import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {config} from '../settings';

@Injectable()
export class DashboardService {
  constructor(
    private http: HttpClient
  ) {}
  getCntDive(): Promise<any> {
    return this.http.get<any>(config.serverURL + '/api/dives/count')
      .toPromise();
  }
  getCntFiltredDive(): Promise<any> {
    return this.http.get<any>(config.serverURL + '/api/dives/count/bydate')
      .toPromise();
  }
  getCntFiltredDiveBySite(): Promise<any> {
    return this.http.get<any>(config.serverURL + '/api/dives/count/bysite')
      .toPromise();
  }
  getCntPermits(): Promise<any> {
    return this.http.get<any>(config.serverURL + '/api/permits/count')
      .toPromise();
  }
  getCntUsers(): Promise<any> {
    return this.http.get<any>(config.serverURL + '/api/users/count')
      .toPromise();
  }
  getCntDiveSites(): Promise<any> {
    return this.http.get<any>(config.serverURL + '/api/divesites/count')
      .toPromise();
  }
  getDives(): Promise<any> {
    return this.http.get<any>(config.serverURL + '/api/dives')
      .toPromise();
  }
  getPermits(): Promise<any> {
    return this.http.get<any>(config.serverURL + '/api/permits')
      .toPromise();
  }
  getBoats(): Promise<any> {
    return this.http.get<any>(config.serverURL + '/api/boats')
      .toPromise();
  }
  getDiveSites(): Promise<any> {
    return this.http.get<any>(config.serverURL + '/api/users/divesites')
      .toPromise();
  }
  getDiveHearts(): Promise<any> {
    return this.http.get<any>(config.serverURL + '/api/users/divehearts')
      .toPromise();
  }
  getCheckedPointHearts(data: any): Promise<any> {
    return this.http.post<any>(config.serverURL + '/api/users/divehearts/checkpoint', data)
      .toPromise();
  }


}

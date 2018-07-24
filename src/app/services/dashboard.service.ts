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

}

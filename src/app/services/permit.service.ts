import { Injectable } from '@angular/core';
import {config} from '../settings';
import {HttpClient} from '@angular/common/http';

@Injectable()
export class PermitService {
  constructor(
    private http: HttpClient
  ) {}
  post(data: any): Promise<any> {
      return this.http.post<any>(config.serverURL + '/api/permits', data)
        .toPromise();
  }
}

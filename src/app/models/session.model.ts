import {UserModel} from './user.model';
import * as _ from 'lodash';


export class SessionModule {

  token: string;
  profile:any;
  user: UserModel;
  appVersion: string;
  nbAddedDives: number;

  constructor(data: any = null) {
    this.nbAddedDives = 0;
    if (data) {
      this.patch(data);
    }
  }

  patch(data: any) {
    _.assign(this, data);
    if (_.isPlainObject(this.user)) {
      this.user = new UserModel(this.user);
    }
  }

  toJSON(): any {
    const data: any = _.toPlainObject(this);
    return data;
  }

}

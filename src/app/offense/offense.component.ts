import {Component, Input, OnInit} from '@angular/core';

import {NgbModal, NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import * as Ajv from 'ajv';
import {LoadingDialogComponent} from '../app-dialogs/loading-dialog/loading-dialog.component';
import {UserService} from '../services/user.service';
import {MatSnackBar} from '@angular/material';

@Component({
  selector: 'app-offense-content',
  template: `
    <div class="modal-header">
      <h4 class="modal-title">Infraction pour {{user.lastname}} {{user.firstname}} </h4>
      <button type="button" class="close" aria-label="Close" (click)="activeModal.dismiss('Cross click')">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
    <div class="modal-body">
      <form [formGroup]="offenseForm">
        <div class="form-group">
          <label>Date de Debut</label>
          <div class="input-group">
            <input class="form-control" placeholder="yyyy-mm-dd" name="dp1" formControlName="start_at" ngbDatepicker #startDate="ngbDatepicker">
            <div class="input-group-append">
              <button class="btn btn-outline-secondary" (click)="startDate.toggle()" type="button">
                <i class="fa fa-calendar" aria-hidden="true"></i>        </button>
            </div>
          </div>
        </div>
        <div class="form-group">
          <label>Date de Fin</label>
          <div class="input-group">
            <input class="form-control" placeholder="yyyy-mm-dd" name="dp" formControlName="end_at" ngbDatepicker #endDate="ngbDatepicker">
            <div class="input-group-append">
              <button class="btn btn-outline-secondary" (click)="endDate.toggle()" type="button">
                <i class="fa fa-calendar" aria-hidden="true"></i> </button>
            </div>
          </div>
        </div>
        <div class="form-group">
          <label for="exampleSelect1">Status</label>
          <select class="form-control" id="exampleSelect1" formControlName="status">
            <option value="enabled">Activé</option>
            <option value="disabled">Disactivé</option>
          </select>
        </div>
        <button (click)="save()" class="btn btn-primary"> Enregistrer </button>
      </form>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-outline-dark" (click)="activeModal.close('Close click')">Fermer</button>
    </div>
  `
})
export class OffenseComponent implements OnInit{
  @Input() user;
  errors;
  offenseForm: FormGroup;
  constructor(public activeModal: NgbActiveModal,
              private userService: UserService,
              private snackBar: MatSnackBar) {

  }
  ngOnInit(){
    const start_at = this.user.offenses.length > 0?{
      year: new Date(this.user.offenses[0].start_at).getFullYear(),
      month: new Date(this.user.offenses[0].start_at).getMonth() + 1,
      day: new Date(this.user.offenses[0].start_at).getDate(),
    } : '';
    const end_at = this.user.offenses.length > 0 ?{
      year: new Date(this.user.offenses[0].end_at).getFullYear(),
      month: new Date(this.user.offenses[0].end_at).getMonth() + 1,
      day: new Date(this.user.offenses[0].end_at).getDate(),
    } : '';
    const status = this.user.offenses.length > 0 ? this.user.offenses[0].status : 'enabled'
    this.offenseForm = new FormGroup({
      start_at: new FormControl(start_at, Validators.required),
      end_at: new FormControl(end_at, Validators.required),
      user_id: new FormControl(this.user.id, Validators.required),
      status: new FormControl(status)
    });
  }
  toDate(date): String {
    if( (typeof date === "object") && (date !== null) )
      return new Date('' + date.year + '-' + date.month + '-' + date.day).toISOString();
    return date;
  }
  save(){
    let schema = {
      '$schema': 'http://json-schema.org/draft-07/schema#',
      'type': 'object',
      'properties': {
        'start_at': {
          'type': 'string',
          'format': 'date-time'
        },
        'end_at': {
          'type': 'string',
          'format': 'date-time'
        }
      }
    };
    const formData: any = this.offenseForm.getRawValue();
    formData.start_at = this.toDate(this.offenseForm.controls['start_at'].value);
    formData.end_at = this.toDate(this.offenseForm.controls['end_at'].value);
    const validData = {
      start_at: formData.start_at,
      end_at: formData.end_at
    };

    const ajv = new Ajv({allErrors: true, format:'full'}); // options can be passed, e.g. {allErrors: true}
    const validate = ajv.compile(schema);
    this.errors = validate.errors;
    if (!this.errors) {
      this.userService.postOffense(formData).then(data => {
        console.log(data);
        this.snackBar.open('Modification enregistée','ok', {
          duration: 3000
        });
        this.activeModal.close('Close click');
      });
    }
  }
}

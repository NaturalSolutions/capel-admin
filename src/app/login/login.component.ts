import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {UserService} from '../services/user.service';
import {SessionActionsService} from '../store/session/session-actions.service';
import * as _ from 'lodash';
import {MatDialog, MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition} from '@angular/material';
import { LoadingDialogComponent } from '../app-dialogs/loading-dialog/loading-dialog.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class LoginComponent implements OnInit {

  fg:FormGroup;
  setPass=false;
  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  verticalPosition: MatSnackBarVerticalPosition = 'top';
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private userService: UserService,
    private snackBar: MatSnackBar,
    private sessionActionsService: SessionActionsService,
    public dialog: MatDialog,
  ) {}

  ngOnInit() {
    this.fg = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  onSubmit() {
    const dialogRef = this.dialog.open(LoadingDialogComponent, {
      disableClose: true
    });
    if(!this.setPass) {
      this.userService.login(this.fg.value).then(data => {
          dialogRef.close();
          console.log(data);
          if(data.profile.role !== 'admin'){
            this.snackBar.open("vous devez disposer des droits d'administrateur pour se connecter a cet espace", "OK", {
              duration: 5000,
              horizontalPosition: this.horizontalPosition,
              verticalPosition: this.verticalPosition,
            });
            return;
          }
          this.sessionActionsService.open(data);
          this.router.navigate(['/dashboard']);
        }, error => {
          dialogRef.close();
          console.error(error);
          if (_.get(error, 'error.error') == 'user_draft') {
            this.snackBar.open("Veuillez valider votre email", "OK", {
              duration: 5000
            });
          }
          if (_.get(error, 'error.error') == 'Wrong credentials.' || _.get(error, 'error.error') == 'Not registered.') {
            this.snackBar.open("Login/Mot de passe incorrect", "OK", {
              duration: 5000
            });
          }
        }
      );
    } else {
        this.userService.setPassword(this.fg.get('username').value).then(data => {
          console.log(data);
          this.snackBar.open("Veuillez vérifier votre email pour récuprérer votre mot de passe temporaire", "OK", {
            duration: 8000
          });
          dialogRef.close();
          this.setPass = false;
        }, error => {
          this.snackBar.open("Email n'existe pas", "OK", {
            duration: 5000
          });
          dialogRef.close();
        });
    }
  }

  setPassword() {
    this.setPass = true;
  }
}

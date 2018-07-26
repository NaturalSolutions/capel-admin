import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
@Component({
  selector: 'app-dialog',
  template: `
    <h4>Attention !</h4>
    <mat-dialog-content>
      {{data.msg}}<br/>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-raised-button mat-dialog-close color="primary" (click)="ok()">
        {{data.cnfBtn}}
      </button>
      <button mat-raised-button mat-dialog-close color="warning" (click)="cancel()">
        {{data.cnlBtn}}
      </button>
    </mat-dialog-actions>`
})
export class DialogComponent {
  constructor(public dialogRef: MatDialogRef<DialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) {
    console.log(data);
  }

  ok() {
    this.dialogRef.close(true);
  }

  cancel() {
    this.dialogRef.close(false);
  }
}

import {Component, NgZone, OnInit, ViewChild} from '@angular/core';
import {UserService} from '../services/user.service';
import {ColumnApi, GridApi, GridOptions} from 'ag-grid';
import {LoadingDialogComponent} from '../app-dialogs/loading-dialog/loading-dialog.component';
import {MatDialog} from '@angular/material';
import {DialogComponent} from '../dialog/dialog.component';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
   gridOptions: GridOptions;
   api: GridApi;
   columnApi: ColumnApi;
   columnDefs;
   defaultColDef;
   rowData = [];
  constructor(private userService: UserService,
              public dialog: MatDialog,
              private zone: NgZone
  ) {
    this.gridOptions = <GridOptions>{};
    this.defaultColDef = {
      editable: true
    };
    this.columnDefs = [
      {headerName: 'Id', field: 'id', checkboxSelection: true },
      {headerName: 'Status', field: 'status', cellClassRules:
          {
          'rag-green-outer': (params) => { return params.value === 'enabled' },
          'rag-amber-outer': (params) => { return params.value === 'draft' },
          'rag-red-outer': (params) => { return params.value === 'blocked' }
        },
        cellRenderer: function(params) {
          return '<span class="rag-element">' + params.value + '</span>';
        }
      },
      {headerName: 'Nom', field: 'firstname' },
      {headerName: 'Prénom', field: 'lastname'},
      {headerName: 'Catégorie', field: 'category'},
      {headerName: 'Email', field: 'email', cellStyle: { backgroundColor: "#aaffaa" }},
      {headerName: 'Addresse', field: 'address'}
    ];
  }
  deleteUsers() {
    const dialog = this.dialog.open(DialogComponent, {
      width: '500px',
      data: { msg: 'voulez-vous supprimer les utilisateurs sélectionnés', cnfBtn: 'Supprimer', cnlBtn: 'Annuler' }
    });

    dialog.afterClosed().subscribe(result => {
      if ( result ) {
        console.log('The dialog was closed');
        const dialogRef = this.dialog.open(LoadingDialogComponent, {
          disableClose: true
        });
        const selectedNodes = this.api.getSelectedNodes();
        const selectedData = selectedNodes.map(node => node.data);
        this.userService.delete(selectedData).then(data => {
          this.setUser();
          dialogRef.close();
        });
      }
    });
  }
  blockUser() {
    const dialog = this.dialog.open(DialogComponent, {
      width: '500px',
      data: { msg: 'voulez-vous bloquer les utilisateurs sélectionnés', cnfBtn: 'bloquer', cnlBtn: 'Annuler' }
    });

    dialog.afterClosed().subscribe(result => {
      if ( result ) {
        const dialogRef = this.dialog.open(LoadingDialogComponent, {
          disableClose: true
        });
        const selectedNodes = this.api.getSelectedNodes();
        const selectedData = selectedNodes.map(node => node.data);
        const users = [];
        for (const dataUser of selectedData)
          users.push({id: dataUser.id, status: 'blocked', boats: []});
        this.userService.patch(users).then(data => {
          console.log(data);
          this.setUser();
          dialogRef.close();
        });
      }
    });
  }
  unblockUsers() {
    const dialog = this.dialog.open(DialogComponent, {
      width: '500px',
      data: { msg: 'voulez-vous débloquer les utilisateurs sélectionnés', cnfBtn: 'Débloquer', cnlBtn: 'Annuler' }
    });

    dialog.afterClosed().subscribe(result => {
      if ( result ) {
        const dialogRef = this.dialog.open(LoadingDialogComponent, {
          disableClose: true
        });
        const selectedNodes = this.api.getSelectedNodes();
        const selectedData = selectedNodes.map(node => node.data);
        const users = [];
        for (const dataUser of selectedData)
          users.push({id: dataUser.id, status: 'enabled', boats: []});
        this.userService.patch(users).then(data => {
          console.log(data);
          this.setUser();
          dialogRef.close();
        });
      }
    });
  }
  onReady(params) {
    this.api = params.api;
    this.columnApi = params.columnApi;
    this.setUser();

  }
  ngOnInit() {

  }
  setUser() {
    this.userService.getUsers().then(data => {
      const users = []
      for (const user of data){
        users.push({id: user.id,
          firstname: user.firstname,
          lastname: user.lastname,
          category: user.category,
          email: user.email,
          status: user.status,
          address: user.address
        });
      }
      this.rowData = users;
    });
  }
  onEnter(value: any) {
    this.userService.searchUsers(value).then(data => {
      console.log(data);
      const users = []
      for (const user of data) {
        users.push({
          id: user.id,
          firstname: user.firstname,
          lastname: user.lastname,
          category: user.category,
          email: user.email,
          status: user.status,
          address: user.address
        });
      }
      this.rowData = users;
    });
  }

}

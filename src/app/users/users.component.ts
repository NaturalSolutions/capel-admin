import {Component, NgZone, OnInit, ViewChild} from '@angular/core';
import {UserService} from '../services/user.service';
import {ColumnApi, GridApi, GridOptions} from 'ag-grid';
import {LoadingDialogComponent} from '../app-dialogs/loading-dialog/loading-dialog.component';
import {MatDialog} from '@angular/material';
import {DialogComponent} from '../dialog/dialog.component';
import {ICellRendererAngularComp} from 'ag-grid-angular';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {OffenseComponent} from '../offense/offense.component';

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
   boats = []
  date_options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
  search_date;
  search_term;
  constructor(private userService: UserService,
              public dialog: MatDialog,
              private zone: NgZone,
              private modalService: NgbModal
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
      {headerName: 'Nom', field: 'lastname' },
      {headerName: 'Prénom', field: 'firstname'},
      {headerName: "Date d'inscription", field: 'created_at'},
      {headerName: 'Commentaire', field: 'review',  cellRendererFramework: MoodRendererComponent},
      {headerName: 'Catégorie', field: 'category'},
      {headerName: 'Email', field: 'email'},
      {headerName: 'Addresse', field: 'address'},
      {headerName: 'Bateaux', field: 'boats'},
      {headerName: 'Infractions', field: 'offenses'}
    ];
    this.setUser();
  }
  onSelectionChanged(event) {
    const selectedRows = this.api.getSelectedRows();
    for (const selectedRow of selectedRows){
      console.log(selectedRow);
      this.boats = selectedRow.boats;
      console.log(this.boats);
    }
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
  openOffense() {
    const modalRef = this.modalService.open(OffenseComponent);
    console.log(this.api.getSelectedNodes()[0].data);
    modalRef.componentInstance.user = this.api.getSelectedNodes()[0].data;
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


  }
  ngOnInit() {

  }
  setUser() {
    let loading = this.dialog.open(LoadingDialogComponent, {
      disableClose: true
    });
    this.userService.getUsers().then(data => {
      const users = []
      for (const user of data){
        users.push({id: user.id,
          lastname: user.lastname,
          firstname: user.firstname,
          category: user.category,
          created_at: new Date(user.created_at).toLocaleDateString('fr-FR', this.date_options),
          review: user.review,
          email: user.email,
          status: user.status,
          address: user.address,
          boats: user.boats,
          offenses: user.offenses
        });
      }
      loading.close();
      this.rowData = users;
    });
  }
  onEnter(value: any) {
    this.search_term = value;
  }
  filtre() {
    this.userService.searchUsers({'search_date' : this.search_date, 'search_tearm': this.search_term}).then(data => {
      console.log(data);
      const users = []
      for (const user of data) {
        users.push({
          id: user.id,
          lastname: user.lastname,
          firstname: user.firstname,
          category: user.category,
          created_at: new Date(user.created_at).toLocaleDateString('fr-FR', this.date_options),
          review: user.review,
          email: user.email,
          status: user.status,
          address: user.address,
          boats: user.boats
        });
      }
      this.rowData = users;
    });
  }
  onDateSelect(event){
    this.search_date = this.toDate(event);
  }

  toDate(date): String {
    return date.year + '-' + date.month + '-' + date.day;
  }
}
// create your cellRenderer as a Angular component
@Component({
  selector: 'square-cell',
  template: `<p>{{ params.data.review }}</p>`
})
export class MoodRendererComponent implements ICellRendererAngularComp {
   params: any;

  public constructor(private userService: UserService,
                     public dialog: MatDialog,
                     private zone: NgZone){}
  agInit(params: any): void {
    this.params = params;
    this.setMood(params);
  }

  refresh(params: any): boolean {
    this.params = params;
    this.setMood(params);
    return true;
  }

  private setMood(params) {
        const users = [];
        users.push({id: params.data.id, review: params.data.review, boats: []});
        this.userService.patch(users).then(data => {
          console.log(data);
        });

    }
}
// then reference the Component in your colDef like this

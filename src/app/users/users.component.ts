import {Component, NgZone, OnInit, ViewChild} from '@angular/core';
import {UserService} from '../services/user.service';
import {ColumnApi, GridApi, GridOptions} from 'ag-grid';
import {LoadingDialogComponent} from '../app-dialogs/loading-dialog/loading-dialog.component';
import {MatDialog, MatSnackBar} from '@angular/material';
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
   rowData = []
   boats = [];
   users;
   date_options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
   search_date;
   search_term;
   usersSv;
  constructor(private userService: UserService,
              public dialog: MatDialog,
              private zone: NgZone,
              private modalService: NgbModal,
              private snackBar: MatSnackBar
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
      {headerName: 'Role', field: 'role' },
      {headerName: 'Nom', field: 'lastname' },
      {headerName: 'Prénom', field: 'firstname'},
      {headerName: "Date d'inscription", field: 'created_at'},
      {headerName: 'Commentaire', field: 'review',  cellRendererFramework: MoodRendererComponent},
      {headerName: 'Catégorie', field: 'category'},
      {headerName: 'Email', field: 'email'},
      {headerName: 'Addresse', field: 'address'},
      /*{headerName: 'Bateaux', field: 'boats'},*/
      {headerName: 'Infractions', field: 'offenses'}
    ];
    this.setUser();
  }
  onSelectionChanged(event) {
    const selectedRows = this.api.getSelectedRows();
    let user;
    for (const selectedRow of selectedRows){
      for(const userN of this.users) {
        if (userN.id == selectedRow.id)
          user = userN
      }
      if(user)
      this.boats = user.boats;
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
    if(this.api.getSelectedNodes().length > 0) {
      const modalRef = this.modalService.open(OffenseComponent);
      console.log(this.api.getSelectedNodes()[0].data);
      let user = {}
      for (const userN of this.users) {
        if (userN.id == this.api.getSelectedNodes()[0].data.id)
          user = userN
      }
      modalRef.componentInstance.user = user;
    }else{
      this.snackBar.open('Veuillez sélectionner un utilisateur','ok', {
        duration: 3000
      });
    }
  }
  blockUser() {
    const dialog = this.dialog.open(DialogComponent, {
      width: '500px',
      data: { msg: 'voulez-vous bloquer les utilisateurs sélectionnés', cnfBtn: 'Bloquer', cnlBtn: 'Annuler' }
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
  adminUser() {
    const dialog = this.dialog.open(DialogComponent, {
      width: '500px',
      data: { msg: 'voulez-vous ajouter le status admin aux utilisateurs sélectionnés', cnfBtn: 'Confirmer', cnlBtn: 'Annuler' }
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
          users.push({id: dataUser.id, role: 'admin', boats: []});
        this.userService.patch(users).then(data => {
          console.log(data);
          this.setUser();
          dialogRef.close();

        });
      }
    });
  }
  exporter() {
    let exportParams = {
      skipHeader: false,
      allColumns: true,
      fileName: 'capel-plongeurs.csv'
    };
    this.api.exportDataAsCsv(exportParams);
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
      this.users = data;
      this.usersSv = data;
      const users = []
      for (const user of data){
        users.push({
          id: user.id,
          lastname: user.lastname,
          firstname: user.firstname,
          category: user.category,
          created_at: new Date(user.created_at).toLocaleDateString('fr-FR', this.date_options),
          review: user.review,
          email: user.email,
          role: user.role,
          status: user.status,
          address: user.address,
          offenses: user.offenses.length > 0 ? new Date(user.offenses[0].start_at).toLocaleDateString('fr-FR', this.date_options)
            + ' - '+ new Date(user.offenses[0].end_at).toLocaleDateString('fr-FR', this.date_options):''

        });
      }
      loading.close();
      this.rowData = users;
    });
  }
  onEnter(value: any) {
    this.search_term = value;
  }
  annuler() {
    const users = []
    for (const user of this.usersSv){
      users.push({
        id: user.id,
        lastname: user.lastname,
        firstname: user.firstname,
        category: user.category,
        created_at: new Date(user.created_at).toLocaleDateString('fr-FR', this.date_options),
        review: user.review,
        email: user.email,
        status: user.status,
        role: user.role,
        address: user.address,
        offenses: user.offenses.length > 0 ? new Date(user.offenses[0].start_at).toLocaleDateString('fr-FR', this.date_options)
          + ' - '+ new Date(user.offenses[0].end_at).toLocaleDateString('fr-FR', this.date_options):''

      });
    }
    this.rowData = users;
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
          role: user.role,
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

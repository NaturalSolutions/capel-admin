import { Component, OnInit } from '@angular/core';
import {PermitService} from '../services/permit.service';
import {ColumnApi, GridApi, GridOptions} from 'ag-grid';
import {LoadingDialogComponent} from '../app-dialogs/loading-dialog/loading-dialog.component';
import {MatDialog} from '@angular/material';
import {DialogComponent} from '../dialog/dialog.component';
@Component({
  selector: 'app-permits',
  templateUrl: './type-permits.component.html',
  styleUrls: ['./type-permits.component.css']
})
export class TypePermitsComponent implements OnInit {
   typePermits: any[] = [];
   gridOptions: GridOptions;
   api: GridApi;
   columnApi: ColumnApi;
   columnDefs;
   defaultColDef;
   rowData = [];
   date_options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
  constructor(private permitService: PermitService,
              private dialog: MatDialog
  ){
    this.defaultColDef = {
      editable: true
    };
    this.columnDefs = [
      { headerName: 'Id', field: 'id', checkboxSelection: true },
      { headerName: 'Date de dabut', field: 'start_at' },
      { headerName: 'Date de fin', field: 'end_at' },
      { headerName: 'Status', field: 'status',
      cellStyle: (params) => {
        if (params.value === 'enabled') {
          return {color: '#fff', backgroundColor: 'green'};
        } else {
          return {color: '#fff', backgroundColor: 'red'};
        }
      }
    },
      {headerName: 'Cours Marins', field: 'hearts', minWidth: 400, width: 'auto'}
    ];

  }
  onReady(params) {
    this.api = params.api;
    this.columnApi = params.columnApi;
    this.setTypePermits();

  }
  activate() {
    const dialog = this.dialog.open(DialogComponent, {
      width: '500px',
      data: { msg: "voulez-vous activer le type d'autorisation sélectionné", cnfBtn: 'Activer', cnlBtn: 'Annuler' }
    });

    dialog.afterClosed().subscribe(result => {
      if ( result ) {
        const dialogRef = this.dialog.open(LoadingDialogComponent, {
          disableClose: true
        });
        const selectedNodes = this.api.getSelectedNodes();
        const selectedData = selectedNodes.map(node => node.data);
        const typePermits = [];
        for (const typepermit of selectedData)
          typePermits.push({id: typepermit.id, status: 'enabled'});
        this.permitService.activate(typePermits).then(data => {
          console.log(data);
          this.setTypePermits();
          dialogRef.close();
        });
      }
    });
  }
  ngOnInit() {
    this.setTypePermits();
  }
  setTypePermits() {
    this.permitService.get().then( data => {
      const typePermits = []
      console.log(data);
      for (const type_permit of data){
        let hearts = '';
        for (const heart of type_permit.dive_sites)
          hearts += ', ' + heart.name;
        typePermits.push({id: type_permit.id,
          start_at: new Date(type_permit.start_at).toLocaleDateString('fr-FR', this.date_options),
          end_at: new Date(type_permit.end_at).toLocaleDateString('fr-FR', this.date_options),
          status: type_permit.status,
          hearts: hearts
        });
      }
      this.rowData = typePermits;
    });
  }

}

import { Component, OnInit } from '@angular/core';
import {PermitService} from '../services/permit.service';
import {ColumnApi, GridApi, GridOptions} from 'ag-grid';

@Component({
  selector: 'app-permits',
  templateUrl: './permits.component.html',
  styleUrls: ['./permits.component.css']
})
export class PermitsComponent implements OnInit {
  gridOptions: GridOptions;
  api: GridApi;
  columnApi: ColumnApi;
  columnDefs;
  defaultColDef;
  rowData = [];
  boats = []
  constructor(private permitService: PermitService) {
    this.columnDefs = [
      {headerName: 'Id', field: 'id', checkboxSelection: true},
      {
        headerName: 'Status', field: 'status', cellClassRules:
          {
            'rag-green-outer': (params) => {
              return params.value === 'signed'
            }
          },
        cellRenderer: function (params) {
          return '<span class="rag-element">' + params.value + '</span>';
        }
      },
      {headerName: 'Nom de signtaire', field: 'lastname'},
      {headerName: 'Prénom de signtaire', field: 'firstname'},
      {headerName: 'date de signture', field: 'created_at'},
      {headerName: "date de debut d'autorisation", field: 'tp_start_at'},
      {headerName: "date de fin d'autorisation", field: 'tp_end_at'}
    ];

  }
  ngOnInit() {
    this.permitService.getPermits().then(data => {
      console.log(data);
      const permits = []
      for (const permit of data){
        permits.push({id: permit.id,
          lastname: permit.user.lastname,
          firstname: permit.user.firstname,
          created_at: permit.created_at,
          status: permit.status?'not signed':'signed',
          tp_start_at: permit.typepermit.start_at,
          tp_end_at: permit.typepermit.end_at
        });
      }
      this.rowData = permits;
    });
  }

}

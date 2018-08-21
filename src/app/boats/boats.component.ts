import {Component, Input, OnInit} from '@angular/core';
import {ColumnApi, GridApi, GridOptions} from 'ag-grid';

@Component({
  selector: 'app-boats',
  templateUrl: './boats.component.html',
  styleUrls: ['./boats.component.css']
})
export class BoatsComponent implements  OnInit{
  @Input()
  _boats: any[];
  gridOptions: GridOptions;
  api: GridApi;
  columnApi: ColumnApi;
  columnDefs;
  defaultColDef;
  rowData = [];
  constructor() {
    this.gridOptions = <GridOptions>{};
    this.defaultColDef = {
      // set every column width
      width: 500,
      // make every column editable
      editable: true,
      // make every column use 'text' filter by default
      filter: 'agTextColumnFilter'
    };
    this.columnDefs = [
      {headerName: 'Id', field: 'id', checkboxSelection: true},
      {headerName: 'Nom', field: 'name'},
      {headerName: 'Immatriculation', field: 'matriculation'}
    ];

  }
  get boats(): any[] {
    // transform value for display
    return this._boats;
  }

  @Input()
  set boats(boats: any[]) {
    console.log('prev value: ', this._boats);
    console.log('got name: ', boats);
    this._boats = boats;
    const boatsAg = []
    if(this.boats)
      for (const boat of this.boats){
        boatsAg.push({id: boat.id,
          name: boat.name,
          matriculation: boat.matriculation
        });
      }
    this.rowData = boatsAg;
  }

  ngOnInit() {
    console.log('on init');
    console.log(this._boats);
  }
}

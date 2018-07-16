import { Component, OnInit, ViewChild } from '@angular/core';
import {UserService} from '../services/user.service';
import {ColumnApi, GridApi, GridOptions} from 'ag-grid';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  title = 'app';
  private gridOptions: GridOptions;
  private api: GridApi;
  private columnApi: ColumnApi;
  private columnDefs;
  private defaultColDef;
  private rowData = [];
  constructor(private userService: UserService) {
    this.gridOptions = <GridOptions>{};
    this.defaultColDef = {
      editable: true
    };
    this.columnDefs = [
      {headerName: 'Id', field: 'id', checkboxSelection: true },
      {headerName: 'Status', field: 'status', cellClassRules: {
          'rag-green-outer': function(params) { return params.value === 'enabled' },
          'rag-amber-outer': function(params) { return params.value === 'draft' },
          'rag-red-outer': function(params) { return params.value === 'blocked' }
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
    const selectedNodes = this.api.getSelectedNodes();
    const selectedData = selectedNodes.map( node => node.data );
    this.userService.delete(selectedData).then(data => {
      this.setUser();
    });
  }
  blockUser() {
    const selectedNodes = this.api.getSelectedNodes();
    const selectedData = selectedNodes.map( node => node.data );
    const users = [];
    for ( const dataUser of selectedData )
        users.push( {id: dataUser.id, status: 'blocked', boats: [] });
    this.userService.patch(users).then(data => {
      console.log(data);
      this.setUser();
    });
  }
  unblockUsers() {
    const selectedNodes = this.api.getSelectedNodes();
    const selectedData = selectedNodes.map( node => node.data );
    const users = [];
    for ( const dataUser of selectedData )
      users.push( {id: dataUser.id, status: 'enabled', boats: [] });
    this.userService.patch(users).then(data => {
      console.log(data);
      this.setUser();
    });
  }
  private onReady(params) {
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

}

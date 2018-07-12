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
  private icons: any;
  public rowCount: string;
  private api: GridApi;
  private columnApi: ColumnApi;
  private columnDefs = [
    {headerName: 'Id', field: 'id', checkboxSelection: true },
    {headerName: 'Status', field: 'status'},
    {headerName: 'Nom', field: 'firstname' },
    {headerName: 'Prénom', field: 'lastname'},
    {headerName: 'Catégorie', field: 'category'},
    {headerName: 'Email', field: 'email'},
    {headerName: 'Addresse', field: 'address'}
  ];

  private rowData = [];
  constructor(private userService: UserService) {
    this.gridOptions = <GridOptions>{};
  }
  deleteUsers() {
    const selectedNodes = this.api.getSelectedNodes();
    const selectedData = selectedNodes.map( node => node.data );
    //const selectedDataStringPresentation = selectedData.map( node => node.make + ' ' + node.model).join(', ');
    console.log(selectedData);
    //alert(`Selected nodes: ${selectedDataStringPresentation}`);
    this.userService.delete(selectedData).then(data => {
      console.log(data);
      this.setUser();
    });
  }
  blockUser() {
    const selectedNodes = this.api.getSelectedNodes();
    const selectedData = selectedNodes.map( node => node.data );
    const users = [];
    for ( const dataUser of selectedData )
        users.push( {id: dataUser.id, status: 'blocked', boats: [] } )
    this.userService.patch(users).then(data => {
      console.log(data);
      this.setUser();
    })
  }
  unblockUsers(){
    const selectedNodes = this.api.getSelectedNodes();
    const selectedData = selectedNodes.map( node => node.data );
    const users = [];
    for ( const dataUser of selectedData )
      users.push( {id: dataUser.id, status: 'enabled', boats: [] } )
    this.userService.patch(users).then(data => {
      console.log(data);
      this.setUser();
    })
  }
  private onReady(params) {
    this.api = params.api;
    this.columnApi = params.columnApi;
  }
  ngOnInit() {
    this.setUser();
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

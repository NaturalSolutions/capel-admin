import { Component, OnInit } from '@angular/core';
import {DashboardService} from '../services/dashboard.service';
import {ColumnApi, GridApi, GridOptions} from 'ag-grid';
import {LoadingDialogComponent} from '../app-dialogs/loading-dialog/loading-dialog.component';
import {UserService} from '../services/user.service';
import {MatDialog} from '@angular/material';

@Component({
  selector: 'app-export',
  templateUrl: './export.component.html',
  styleUrls: ['./export.component.css']
})
export class ExportComponent implements OnInit {
  gridOptions: GridOptions;
  api: GridApi;
  columnApi: ColumnApi;
  columnDefs;
  defaultColDef;
  rowData = []
  diveHearts
  date_options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
  constructor(
    private  dashboardService: DashboardService,
    private userService: UserService,
    private dialog: MatDialog
  ) {
    this.dashboardService.getDiveHearts().then(data => {
      this.diveHearts = data;
    });
  }

  ngOnInit() {
    this.setUsers('all');
  }

  export() {
   this.api.exportDataAsCsv();
  }
  getZoneName(id){
    for(const heart of this.diveHearts){
      if (heart.id === id)
        return heart.name;
    }
    return "";
  }
  onChange(value) {
    if (value === 'dives')
      this.setDives();
    else if (value === 'allDivers')
      this.setUsers('all');
    else if (value === 'parDivers')
      this.setUsers('particulier');
    else if (value === 'structDivers')
      this.setUsers('structure');

  }
  setDives() {
    this.columnDefs = [
      {headerName: 'Id', field: 'id', checkboxSelection: true },
      {headerName: 'date de plongée', field: 'divingDate'},
      {headerName: 'site de plongée', field: 'dive_site' },
      {headerName: 'Zone', field: 'dive_heart' },
      {headerName: 'Avec structure', field: 'shop'},
      {headerName: "Horaires", field: 'times'},
      {headerName: 'Utilisateur', field: 'user'},
      {headerName: 'bateaux', field: 'boats'},
      {headerName: 'Commentaire', field: 'review'}
    ];
    const loading = this.dialog.open(LoadingDialogComponent, {
      disableClose: true
    });
    this.dashboardService.getDives().then(data => {
      const dives = []
      for (const dive of data){
        let boats = ''
        for (const boat of dive.boats){
          boats += boat.name + ' ';
        }
        dives.push({
          id: dive.id,
          divingDate: new Date(dive.divingDate).toLocaleDateString('fr-FR', this.date_options),
          dive_site: dive.dive_site.name,
          dive_heart: this.getZoneName(dive.dive_site.heart_id),
          shop: dive.shop ? dive.shop.firstname + ' ' + dive.shop.lastname : "",
          times: dive.times[0][0] + ' ' + dive.times[0][1],
          user: dive.user.lastname + ' ' + dive.user.firstname,
          boats: boats,
          review: dive.review
        });
      }
      this.rowData = dives;
      loading.close();
    });

  }
  onReady(params) {
    this.api = params.api;
    this.columnApi = params.columnApi;
  }
  setUsers(key){
    this.columnDefs = [
      {headerName: 'Id', field: 'id', checkboxSelection: true },
      {headerName: 'Statut', field: 'status'},
      {headerName: 'Nom', field: 'lastname' },
      {headerName: 'Prénom', field: 'firstname'},
      {headerName: "Date d'inscription", field: 'created_at'},
      {headerName: 'Commentaire', field: 'review'},
      {headerName: 'Catégorie', field: 'category'},
      {headerName: 'Email', field: 'email'},
      {headerName: 'Nombre de plongées', field: 'nbr_dives'},
      {headerName: 'Addresse', field: 'address'},
      /*{headerName: 'Bateaux', field: 'boats'},*/
      {headerName: 'Infractions', field: 'offenses'}
    ];
    let loading = this.dialog.open(LoadingDialogComponent, {
      disableClose: true
    });
    this.userService.getUsers().then(data => {
      const users = []
      if (key !== 'all')
        data = data.filter(item => {
          if (item.category == key)
            return item
        })
      for (const user of data){
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
          nbr_dives: user.nbr_dives,
          offenses: user.offenses.length > 0 ? new Date(user.offenses[0].start_at).toLocaleDateString('fr-FR', this.date_options)
            + ' - '+ new Date(user.offenses[0].end_at).toLocaleDateString('fr-FR', this.date_options):''

        });
      }
      loading.close();
      this.rowData = users;
    });
  }

  /*
  objectToCSVRow(dataObject) {
    let dataArray = new Array;
    for (const o in dataObject) {
      const innerValue = dataObject[o]===null?'':dataObject[o].toString();
      let result = innerValue.replace(/"/g, '""');
      result = '"' + result + '"';
      dataArray.push(result);
    }
    return dataArray.join(' ') + '\r\n';
  }

  exportToCSV(arrayOfObjects) {
    let csvContent = "data:text/csv;charset=utf-8,";

    if (!arrayOfObjects.length) {
      return;
    }
    // headers
    csvContent += this.objectToCSVRow(Object.keys(arrayOfObjects[0]));
    for(let item of arrayOfObjects){
      csvContent += this.objectToCSVRow(item);
    }
    let encodedUri = encodeURI(csvContent);
    let link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "customers.csv");
    document.body.appendChild(link); // Required for FF
    link.click();
    document.body.removeChild(link);

  }
  */

}

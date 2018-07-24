import { Component } from '@angular/core';
import {DashboardService} from '../services/dashboard.service';
import localeFr from '@angular/common/locales/fr';
import { registerLocaleData } from '@angular/common';

registerLocaleData(localeFr);

@Component({
  selector: 'dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  nbrDives;
  nbrUsers;
  nbrPermits;
  nbrDivesSites;
  options: any;
  constructor(private dashboardService: DashboardService) {
    this.dashboardService.getCntDive().then( data => {
      this.nbrDives  = data;
    });
    this.dashboardService.getCntDiveSites().then( data => {
      this.nbrDivesSites = data;
    });
    this.dashboardService.getCntPermits().then( data => {
      this.nbrPermits = data;
    });
    this.dashboardService.getCntUsers().then( data => {
      this.nbrUsers = data;
    });
    this.dashboardService.getCntFiltredDive().then( data => {
      const columns = [];
      const lines = [];
      const date_options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
      for (const item of data){
        columns.push(new Date(item[0]).toLocaleDateString('fr-FR', date_options));
        lines.push(item[1]);
      }

      this.options = {
        chart: {
          type: 'areaspline'
        },
        title: {
          text: 'statistiques du nombre de plongées'
        },
        legend: {
          layout: 'vertical',
          align: 'left',
          verticalAlign: 'top',
          x: 150,
          y: 100,
          floating: true,
          borderWidth: 1
        },
        xAxis: {
          categories: columns
        },
        yAxis: {
          title: {
            text: 'Capel'
          }
        },
        tooltip: {
          shared: true,
          valueSuffix: ' plongées'
        },
        credits: {
          enabled: false
        },
        series: [{
          name: 'Plongées',
          data: lines
        }]
      };
    });

  }
  cards = [
    { title: 'Card 1', cols: 2, rows: 1 },
    { title: 'Card 2', cols: 1, rows: 1 },
    { title: 'Card 3', cols: 1, rows: 2 },
    { title: 'Card 4', cols: 1, rows: 1 }
  ];
}

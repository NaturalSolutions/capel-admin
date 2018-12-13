import { Component } from '@angular/core';
import {DashboardService} from '../services/dashboard.service';
import localeFr from '@angular/common/locales/fr';
import { registerLocaleData } from '@angular/common';
import {UserService} from '../services/user.service';
import {LoadingDialogComponent} from '../app-dialogs/loading-dialog/loading-dialog.component';
import {MatDialog} from '@angular/material';

registerLocaleData(localeFr);

@Component({
  selector: 'dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {

  options: any;
  optionsSites: any;
  optionsHearts: any;
  optionsHours: any;
  optionsSignatairebyHours: any;
  users: any[];
  dives: any[];
  permits: any[];
  boats: any[];
  diveSites: any[];
  usersSV: any[];
  divesSV: any[];
  permitsSV: any[];
  boatsSV: any[];
  diveHearts: any[];
  groupedDiveSites: any[];
  groupedDiveHearts: any[] = [];
  nbrDivesDays: any;

  startDatePModel: any = {year: new Date().getFullYear(), month: new Date().getMonth() + 1, day: new Date().getDate() };
  endDatePModel: any = {year: new Date().getFullYear(), month: new Date().getMonth() + 1, day: new Date().getDate() };
  someHeartsDive: any = 0;
  typeDives: any[];
  optionstypeDives= {
    chart: {
      plotBackgroundColor: null,
      plotBorderWidth: null,
      plotShadow: false,
      type: 'pie'
    },
    title:
      {
        text: 'Nombre de plongée par type de plongée'
      }
    ,
    tooltip: {
      pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
    }
    ,
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor
          :
          'pointer',
        dataLabels
          :
          {
            enabled: true,
            format
              :
              '<b>{point.name}</b>: {point.percentage:.1f} %'
          }
      }
    }
    , series: [{
      name: 'Plongées',
      colorByPoint: true,
      data: [{
        name: 'Chrome',
        y: 61.41
      }, {
        name: 'Internet Explorer',
        y: 11.84
      }, {
        name: 'Firefox',
        y: 10.85
      }, {
        name: 'Edge',
        y: 4.67
      }, {
        name: 'Safari',
        y: 4.18
      }, {
        name: 'Sogou Explorer',
        y: 1.64
      }, {
        name: 'Opera',
        y: 1.6
      }, {
        name: 'QQ',
        y: 1.2
      }, {
        name: 'Other',
        y: 2.61
      }]
    }]
  };
  date_options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
  fl_heart: any = 'tous';
  fl_month: any = 'tous';
  fl_year: any = 'tous';
  fl_site: any = 'tous';
  fl_user: any = 'tous';
  constructor(
    private dashboardService: DashboardService,
    private userService: UserService,
    public dialog: MatDialog,
  )
  {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);// show stats of last 7 days
    this.startDatePModel = {year: startDate.getFullYear(), month: startDate.getMonth() + 1, day: startDate.getDate() };

    let loading = this.dialog.open(LoadingDialogComponent, {
      disableClose: true
    });
    this.userService.getUsers().then( data => {
      this.users = data;
      this.usersSV  = data;
    })
    this.dashboardService.getPermits().then( data => {
      this.permits = data;
      this.permitsSV = data;
      this.fillFrequenceSignataire('d');
    })
    this.dashboardService.getBoats().then( data => {
      this.boats = data;
      this.boatsSV = data;

    })
    this.dashboardService.getDiveSites().then( data => {
      this.diveSites = data;
    });
    this.userService.getDiveTypes().then(data => {
      this.typeDives = data;
    })
    this.dashboardService.getDives().then( data => {
      this.dives = data;
      console.log(data);
      let first_date = new Date(this.dives[0].divingDate);
      let last_date = new Date(this.dives[this.dives.length - 1].divingDate);
      let timeDiff = Math.abs(last_date.getTime() - first_date.getTime());
      this.nbrDivesDays = (timeDiff / (1000*60*60*24));
      console.log(this.nbrDivesDays);
      this.divesSV = data;
      this.groupeDives_naive();
      this.fillSiteChart();
      this.fillFrequenceHours('d');
      this.setStatsDive('w');
      this.fillTypeDiveChart();
      let groupedDiveHeart : any = {};
      groupedDiveHeart.nbrDive = 0;
      groupedDiveHeart.dive_heart = [];
      loading.close();
      this.dashboardService.getDiveHearts().then(datah => {

        this.diveHearts = datah;
        this.fillHearChart();
      })
    })

    /*
    this.dashboardService.getCntFiltredDive().then( data => {
      this.filredDivebyDate = data;

    });
    */

  }
  fillAllChart(){
    this.groupeDives_naive();
    this.fillSiteChart();
    this.fillFrequenceHours('d');
    this.setStatsDive('d');
    this.fillTypeDiveChart();
    this.fillHearChart();
  }
  fillTypeDiveChart(){
    let data = [];
    for(let typeDive of this.typeDives){
      let cnt = 0;
      for(let dive of this.dives){
        for(let divetypedive of dive.divetypedives)
          if(divetypedive.typeDive.id === typeDive.id)
            cnt++;
      }
      data.push({name: typeDive.name,y: cnt});
    }
    this.optionstypeDives = {
      chart: {
        plotBackgroundColor: null,
        plotBorderWidth: null,
        plotShadow: false,
        type: 'pie'
      },
      title:
        {
          text: 'Nombre de plongée par type de plongée'
        }
      ,
      tooltip: {
        pointFormat: '{series.name}: <b>{point.y:.1f}</b>'
      }
      ,
      plotOptions: {
        pie: {
          allowPointSelect: true,
          cursor
            :
            'pointer',
          dataLabels
            :
            {
              enabled: true,
              format
                :
                '<b>{point.name}</b>: {point.y}'
            }
        }
      }
      , series: [{
        name: 'Plongées',
        colorByPoint: true,
        data: data
      }]
    };
  }
  getNbrDiveInHeart(heart){
    let nbr = 0;
    for(const gDiveSite of this.groupedDiveSites){
      if(gDiveSite.dive.dive_site.heart_id === heart.id) {
        nbr += gDiveSite.dives.length;
        this.someHeartsDive += gDiveSite.dives.length;
      }
    }
    return nbr;
  }
  fillHearChart() {
    const columns = [];
    const lines = [];
    for (const item of this.diveHearts){
      columns.push(item.name);
      lines.push(this.getNbrDiveInHeart(item));
    }
    this.optionsHearts = {
      chart: {
        type: 'areaspline'
      },
      title: {
        text: 'Statistiques du nombre de plongées'
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
          text: 'Nombre de plongée'
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
        showInLegend: false,
        data: lines
      }]
    };
  }
  getNbrDiveByHours(i, startDateP, endDateP) {
    let cnt = 0;
    for(let dive of this.dives){
      if(dive.times[0][0].split(':')[0] == i && new Date(dive.divingDate).getTime() == startDateP.getTime()) {
        cnt++;

      }
    }
    return cnt;
  }
  getNbrDiveBydate(dateP, key) {
    let cnt = 0;
    for(let dive of this.dives){
      if(key === 'm') {
        if (new Date(dive.divingDate).getFullYear() == dateP.getFullYear() && new Date(dive.divingDate).getMonth() == dateP.getMonth()) {
          cnt++;
        }
      }else if(key === 'y'){
        if (new Date(dive.divingDate).getFullYear()  == dateP) {
          cnt++;

        }
      } else {
        if (new Date(dive.divingDate).getTime() == dateP.getTime()) {
          cnt++;

        }
      }
    }
    return cnt;
  }
  getNbrpermitByHour(i) {
    let cnt = 0;
    for(const permit of this.permits){
      if(new Date(permit.created_at).getHours() == i && new Date(permit.created_at).setHours(0,0,0,0) == new Date().setHours(0,0,0,0)) {
        cnt++;

      }
    }
    return cnt;
  }
  setStatistics(event) {
    this.someHeartsDive = 0;
    this.dives = this.divesSV;
    this.dives =  this.divesSV.filter(dive => {
      if (
        (this.fl_site !== 'tous' ? this.fl_site.id === dive.dive_site.id : true)
        &&
        (this.fl_heart !== 'tous' ? this.fl_heart.id === dive.dive_site.heart_id : true)
        &&
        (this.fl_year !== 'tous' ? new Date(dive.divingDate).getFullYear() === this.fl_year : true)
        &&
        (this.fl_user !== 'tous' ? dive.user.category === this.fl_user : true)
      )
        return dive;
    });
    this.fillAllChart();
  }
  setStatisticsHeart(event) {
    this.someHeartsDive = 0;
    if (event.value === 'tous') {
      this.dives = this.divesSV;
    } else {
      this.dives =  this.divesSV.filter(dive => {
        if (dive.dive_site.heart_id == event.value.id)
          return dive;
      });
    }
    this.fillAllChart();
  }

  fillFrequenceHours(key: any) {

    const startDateP = new Date('' + this.startDatePModel.year + '-' + this.startDatePModel.month + '-' + this.startDatePModel.day);
    const endDateP = new Date('' + this.endDatePModel.year + '-' + this.endDatePModel.month + '-' + this.endDatePModel.day);
    const columns = [];
    const lines = [];
    if (key == 'd') {
      for (let i = 0; i < 24 ; i++) {
        columns.push(i + ' : 00');
        lines.push(this.getNbrDiveByHours(i, startDateP, endDateP));
      }
    }else if ( key == 'w') {
      this.date_options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      let oldDate;
      for (const dive of this.dives) {
        if(new Date(dive.divingDate).getTime() == oldDate)
          continue;
        if (  new Date(dive.divingDate).setHours(0,0,0,0)
                >=
              startDateP.getTime()
          &&
              new Date(dive.divingDate).setHours(0,0,0,0)
                <=
              endDateP.getTime()
        ) {
          columns.push(new Date(dive.divingDate).toLocaleDateString('fr-FR', this.date_options));
          lines.push(this.getNbrDiveBydate(new Date(dive.divingDate), key));
          oldDate = new Date(dive.divingDate).getTime();
        }
      }
    }else if ( key == 'm') {

      const startDateP = new Date(this.startDatePModel.year, this.startDatePModel.month, 0);
      const endDateP = new Date( this.endDatePModel.year, this.endDatePModel.month ,0);
      let oldDate;
      for (const dive of this.dives) {
        const dive_date = new Date(new Date(dive.divingDate).getFullYear(), new Date(dive.divingDate).getMonth() + 1, 0);
        if(dive_date.getTime() == oldDate)
          continue;
        if ((dive_date.getFullYear() >= this.startDatePModel.year && dive_date.getMonth() + 1 >= this.startDatePModel.month)
            &&
          (dive_date.getFullYear() <= this.endDatePModel.year && dive_date.getMonth() + 1 <= this.endDatePModel.month)) {
          columns.push(dive_date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long'}));
          lines.push(this.getNbrDiveBydate(dive_date, key));
          oldDate = dive_date.getTime();
        }
      }
    }else if ( key == 'y') {
      let oldDate;
      for (const dive of this.dives) {
        const dive_date = new Date(dive.divingDate).getFullYear();
        if(dive_date == oldDate)
          continue;
        if (dive_date >= this.startDatePModel.year && dive_date <= this.endDatePModel.year) {
          columns.push(dive_date);
          lines.push(this.getNbrDiveBydate(dive_date, key));
          oldDate = dive_date;
        }
      }
    }
    this.optionsHours = {
      chart: {
        type: 'areaspline'
      },
      title: {
        text: 'Statistiques du nombre de plongées'
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
          text: 'Nombre de plongée'
        }
      },
      tooltip: {
        shared: true,
        valueSuffix: 'plongées'
      },
      credits: {
        enabled: false
      },
      series: [{
        name: 'Plongées',
        showInLegend: false,
        data: lines
      }]
    };
  }
  setStatsDive(key: any){
    this.fillFrequenceHours(key);
  }
  fillFrequenceSignataire(key:any) {
    const columns = [];
    const lines = [];
    for (let i = 0; i < 24 ; i++) {
      columns.push( i + ' : 00');
      lines.push(this.getNbrpermitByHour(i));
    }
    this.optionsSignatairebyHours = {
      chart: {
        type: 'areaspline'
      },
      title: {
        text: 'Statistiques du nombre de signataires'
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
          text: 'Nombre de signataire'
        }
      },
      tooltip: {
        shared: true,
        valueSuffix: ' Signataires'
      },
      credits: {
        enabled: false
      },
      series: [{
        name: 'Signataires',
        showInLegend: false,
        data: lines
      }]
    };
  }
  fillSiteChart(){
    const columns = [];
    const lines = [];
    for (const item of this.groupedDiveSites){
      columns.push(item.dive.dive_site.name);
      lines.push(item.dives.length + 1);
    }
    this.optionsSites = {
      chart: {
        type: 'areaspline'
      },
      title: {
        text: 'Statistiques du nombre de plongées'
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
          text: 'Nombre de plongée'
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
        showInLegend: false,
        data: lines
      }]
    };
  }
  groupeDives_naive() {
    this.groupedDiveSites = []
    for (const dive of this.dives) {
      let obj: any = {};
      obj.dives = [];
      let exists = this.groupedDiveSites.find((groupedDive) => {
        return dive.dive_site.id === groupedDive.dive.dive_site.id;
      })
      if (exists)
        exists.dives.push(dive)
      else {
        obj.dive = dive;
        this.groupedDiveSites.push(obj);
      }
    }
  }
  getCntUsersByType(users: any[], type: any) {
    const usersCnt = users.filter(user => {
      if ( user.category === type ) {
        return user;
      }
    });
    return usersCnt.length;
  }
  getCntPermit( key: any ) {
    if ( key === 'boats') {
        let cntBoats:any = 0;
        for(const permit of this.permits)
          cntBoats+= permit.user.boats.length;
        return cntBoats;
    }else if(key == 'particulier' || key == 'structure') {
      const permitCnt = this.permits.filter(permit => {
        if ( permit.user.category === key ) {
          return permit;
        }
      });
      return permitCnt.length;
    }
  }

  setTypeUser(event) {
    this.users = this.usersSV;
    if(event.value !== 'tous')
      this.users = this.users.filter(user => {
        if ( user.category === event.value ) {
          return user;
        }
      });
  }
}

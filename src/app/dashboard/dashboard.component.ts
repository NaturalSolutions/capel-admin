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
  nbrDives;
  nbrUsers;
  nbrPermits;
  nbrDivesSites;
  options: any;
  optionsSites: any;
  optionsHearts: any;
  optionsHours: any;
  optionsSignatairebyHours: any;
  users:any[];
  dives:any[];
  permits:any[];
  boats: any[];
  diveSites: any[];
  usersSV:any[];
  divesSV:any[];
  permitsSV:any[];
  boatsSV: any[];
  diveHearts: any[];
  groupedDiveSites:any[];
  groupedDiveHearts: any[] = [];
  nbrDivesDays:any;
  startDatePModel: any = {year: new Date().getFullYear(), month: new Date().getMonth() + 1, day: new Date().getDate() };
  endDatePModel: any = {year: new Date().getFullYear(), month: new Date().getMonth() + 1, day: new Date().getDate() };
  filredDivebyDate : any[];
  optionstypeDives:any;
  date_options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
  constructor(
    private dashboardService: DashboardService,
    private userService: UserService,
    public dialog: MatDialog,
  )
  {
    let loading = this.dialog.open(LoadingDialogComponent, {
      disableClose: true
    });
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
    this.userService.getUsers().then( data => {
      this.users = data;
      this.usersSV  = data;
    })
    this.dashboardService.getDives().then( data => {
      this.dives = data;
      let date1 = new Date(this.dives[0].divingDate);
      let date2 = new Date(this.dives[this.dives.length - 1].divingDate);
      let timeDiff = Math.abs(date2.getTime() - date1.getTime());
      this.nbrDivesDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
      this.divesSV = data;
      this.groupeDives_naive();
      this.fillSiteChart();
      this.fillFrequenceHours('d');
      this.setStatsDive('d');
      let groupedDiveHeart : any = {};
      groupedDiveHeart.nbrDive = 0;
      groupedDiveHeart.dive_heart = [];
      loading.close();
      this.dashboardService.getDiveHearts().then(datah => {
        this.diveHearts = datah;
        for (const grDiveSite of this.groupedDiveSites)
          this.dashboardService.getCheckedPointHearts(
            {
            'lat': grDiveSite.dive.dive_site.latitude,
            'lng': grDiveSite.dive.dive_site.longitude
            })
            .then(dataHearts => {
              for(let itemH of dataHearts){
                let exists = this.groupedDiveHearts.filter(item => {
                  if(item.dive_hearts && itemH)
                  return item.dive_hearts.id === itemH.id;
                  else return []
                })
                if(exists.length > 0) {
                  groupedDiveHeart.nbrDive += grDiveSite.dives.length;
                }else {
                  groupedDiveHeart = {}
                  groupedDiveHeart.nbrDive = grDiveSite.dives.length + 1;
                  groupedDiveHeart.dive_heart = itemH;
                  this.groupedDiveHearts.push(groupedDiveHeart);
                  for(let item of datah ) {
                    groupedDiveHeart = {}
                    groupedDiveHeart.nbrDive = 0;
                    groupedDiveHeart.dive_heart = item;
                    let exists = this.groupedDiveHearts.filter(itemH =>{
                      return itemH.dive_heart.id === item.id;
                    })
                    if( exists.length === 0 )
                    this.groupedDiveHearts.push(groupedDiveHeart);
                  }
                  this.fillHearChart();
                }
              }
          })

      })
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
    this.dashboardService.getCntFiltredDive().then( data => {
      this.filredDivebyDate = data;
      /*
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
      */
    });

  }
  getHeatsDivesMoy() {
    let nbr = 0;
    for(let groupedDiveheart of this.groupedDiveHearts) {
      nbr += groupedDiveheart.nbrDive;
    }

    return nbr/this.diveHearts.length;

  }
  fillHearChart() {
    const columns = [];
    const lines = [];
    for (const item of this.groupedDiveHearts){
      columns.push(item.dive_heart.name);
      lines.push(item.nbrDive);
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
    console.log(event.value);
    if (event.value === 'tous') {
      this.dives = this.divesSV;
    } else {
      this.dives =  this.divesSV.filter(dive => {
        if (dive.dive_site.id == event.value.id)
          return dive;
      });
    }
  }

  fillFrequenceHours(key: any) {
    console.log(this.dives);
    console.log(this.divesSV);
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
  }
  setStatsDive(key: any){
    console.log(this.startDatePModel);
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
        text: 'Statistiques du nombre de signataire'
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
        valueSuffix: ' Signataires'
      },
      credits: {
        enabled: false
      },
      series: [{
        name: 'Signataires',
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
        obj.dives.push(dive)
      else {
        obj.dive = dive;
        this.groupedDiveSites.push(obj);
      }
    }
  }
  getCntUsersByType(users:any[], type: any){
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

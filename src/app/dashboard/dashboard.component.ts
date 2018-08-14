import { Component } from '@angular/core';
import {DashboardService} from '../services/dashboard.service';
import localeFr from '@angular/common/locales/fr';
import { registerLocaleData } from '@angular/common';
import {UserService} from '../services/user.service';

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
  constructor(
    private dashboardService: DashboardService,
    private userService: UserService)
  {
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
      this.divesSV = data;
      this.groupeDives_naive();
      this.fillSiteChart();
      let groupedDiveHeart : any = {};
      groupedDiveHeart.nbrDive = 0;
      groupedDiveHeart.dive_heart = [];
      this.dashboardService.getDiveHearts().then(datah => {
        for (const grDiveSite of this.groupedDiveSites)
          this.dashboardService.getCheckedPointHearts(
            {
            'lat': grDiveSite.dive.dive_site.latitude,
            'lng': grDiveSite.dive.dive_site.longitude
            })
            .then(dataHearts => {
              for(let itemH of dataHearts){
                let exists = this.groupedDiveHearts.filter(item => {
                  return item.dive_hearts.id === itemH.id;
                })
                if(exists) {
                  groupedDiveHeart.nbrDive += grDiveSite.dives.length;
                  console.log(this.groupedDiveHearts);
                }else {
                  groupedDiveHeart = {}
                  groupedDiveHeart.nbrDive = grDiveSite.dives.length + 1;
                  groupedDiveHeart.dive_heart = itemH;
                  this.groupedDiveHearts.push(groupedDiveHeart);
                  console.log(this.groupedDiveHearts);
                  const columns = [];
                  const lines = [];
                  for(let item of datah ) {
                    groupedDiveHeart = {}
                    groupedDiveHeart.nbrDive = 0;
                    groupedDiveHeart.dive_heart = item;
                    let exists = this.groupedDiveHearts.filter(itemH =>{
                      return itemH.dive_heart.id === item.id;
                    })
                    console.log(exists)
                    if( exists.length === 0 )
                    this.groupedDiveHearts.push(groupedDiveHeart);
                  }
                  for (const item of this.groupedDiveHearts){
                    columns.push(item.dive_heart.name);
                    lines.push(item.nbrDive);
                  }
                  this.optionsHearts = {
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

                }
              }
          })

      })
    })
    this.dashboardService.getPermits().then( data => {
      this.permits = data;
      this.permitsSV = data;
    })
    this.dashboardService.getBoats().then( data => {
      this.boats = data;
      this.boatsSV = data;

    })
    this.dashboardService.getDiveSites().then( data => {
      this.diveSites = data;
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

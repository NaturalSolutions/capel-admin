import {Component, NgZone, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {UserService} from '../services/user.service';
import * as L from 'leaflet';
import {PermitService} from '../services/permit.service';
import {Router} from '@angular/router';
import Ajv from 'ajv';
import {LoadingDialogComponent} from '../app-dialogs/loading-dialog/loading-dialog.component';
import {MatDialog} from '@angular/material';
@Component({
  selector: 'app-permits',
  templateUrl: './permit-form.component.html',
  styleUrls: ['./permit-form.component.css']
})
export class PermitFormComponent implements OnInit {
  permitForm: FormGroup;
  diveHearts = [];
  map: L.Map;
  errors;
  leafletOptions = {
    layers: [
      L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '...' })
    ],
    zoom: 7,
    center: L.latLng(43, 6.3833),
    dragging: true,
    scrollWheelZoom: false
  };
  iconUser = L.icon({
    iconUrl: 'assets/icon-marker-user.png',
    iconSize: [49, 50], // size of the icon
    iconAnchor: [17, 50],
    popupAnchor: [0, -50]
  });
  constructor(private userService: UserService,
              private permitService: PermitService,
              private zone: NgZone,
              private router:Router,
              private dialog: MatDialog) {}
  onMapReady(map: L.Map) {
    this.map = map;
    map.on('click', this.checkPoint.bind(this));
  }
  upload(e) {
    const reader = new FileReader();
    const file = e.target.files[0];
    reader.readAsDataURL(file);
    reader.onload = () => {
      this.permitForm.controls['template'].setValue({
        filename: file.name,
        filetype: file.type,
        value: reader.result.split(',')[1]
      });
    }
  }
  checkPoint(e) {
    this.zone.run(() => {
      this.userService.getCheckedPointHearts(e.latlng).then(hearts => {
        if ( hearts.length ) {
          for (const heart of hearts) {
            const exist = this.diveHearts.filter(diveHeart => {
              return diveHeart.id === heart.id;
            });
            if (!exist.length)
              this.diveHearts.push(heart);
          }
        }
      });
    });
  }
  delete(heart) {
    this.diveHearts = this.diveHearts.filter(item => item.id !== heart.id);
  }

  ngOnInit() {
    this.permitForm = new FormGroup({
      start_at: new FormControl('', Validators.required),
      end_at: new FormControl('', Validators.required),
      template: new FormControl('', Validators.required),
      status: new FormControl('disabled')
    });
    this.userService.getDiveHearts().then(data => {
      for (let heart of data) {
        heart.geom_poly = JSON.parse(heart.geom_poly);
        let geojsonFeature = {
          'type': 'Feature',
          'properties': {
            'name': 'Coors Field',
            'amenity': 'Baseball Stadium',
            'popupContent': 'This is where the Rockies play!'
          },
          'geometry': heart.geom_poly
        };
        new L.geoJSON(geojsonFeature, {
          style: function (feature) {
            return feature.properties.style;
          }
        }).addTo(this.map);

      }
    });
  }
  toDate(date): String {
    if( (typeof date === "object") && (date !== null) )
      return new Date('' + date.year + '-' + date.month + '-' + date.day).toISOString();
    return date;
  }
  save() {

    const formData: any = this.permitForm.getRawValue();
    //let ajv = new Ajv({$data: true});

    let schema = {
      '$schema': 'http://json-schema.org/draft-07/schema#',
      'type': 'object',
      'properties': {
        'start_at': {
          'type': 'string',
          'format': 'date-time'
        },
        'end_at': {
          'type': 'string',
          'format': 'date-time'
        }, 'template' : {
          'type': 'string'
        }, 'divesites' : {
          'type': 'array',
           'minItems': 1
        }
      }
    };
    formData.divesites = this.diveHearts;
    formData.start_at = this.toDate(this.permitForm.controls['start_at'].value);
    formData.end_at = this.toDate(this.permitForm.controls['end_at'].value);
    console.log(formData.template['value']);
    const validData = {
      start_at: formData.start_at,
      end_at: formData.end_at,
      template: formData.template['value'],
      divesites: formData.divesites
    };
    formData.template = formData.template['value'];

    const ajv = new Ajv({allErrors: true, format:'full'}); // options can be passed, e.g. {allErrors: true}
    const validate = ajv.compile(schema);
    const valid = validate(validData);
    this.errors = validate.errors;
    if (!this.errors) {
      const dialogRef = this.dialog.open(LoadingDialogComponent, {
        disableClose: true
      });
      this.permitService.post(formData).then(data => {
        this.router.navigate(['/permits']);
        dialogRef.close();
      });
    }
  }

}

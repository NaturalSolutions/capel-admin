import {Component, NgZone, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {UserService} from '../services/user.service';
import * as L from 'leaflet';
import {PermitService} from '../services/permit.service';
import {NgbDateStruct} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-permits',
  templateUrl: './permit-form.component.html',
  styleUrls: ['./permit-form.component.css']
})
export class PermitFormComponent implements OnInit {
  permitForm: FormGroup;
  diveHearts = [];
  map: L.Map;
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
              private zone: NgZone) {}
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
      console.log( this.permitForm.controls['template'].value);
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
      template: new FormControl('', Validators.required)
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
  toModel(date: NgbDateStruct): Date {
    return date ? new Date('' + date.year + '-' + date.month + '-' + date.day) : null;
  }
  save() {
    const formData: any = this.permitForm.getRawValue();
    formData.divesites = this.diveHearts;
    formData.start_at = this.toModel(this.permitForm.controls['start_at'].value);
    formData.end_at = this.toModel(this.permitForm.controls['end_at'].value);
    console.log(formData);
    this.permitService.post(formData).then( data => {
      console.log(data);
    });
  }

}

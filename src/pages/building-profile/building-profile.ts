import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams, ItemSliding} from 'ionic-angular';
import {BuildingProvider} from '../../providers/building/building';
import {AngularFireDatabase} from 'angularfire2/database';
import {LoadingController, Loading} from 'ionic-angular';

/**
 * Generated class for the BuildingProfilePage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
    selector: 'page-building-profile',
    templateUrl: 'building-profile.html',
})
export class BuildingProfilePage {

    building: any;
    buildingId: any;
    offices: any;
    loading: Loading;
    floorId: any;
    floor: any;

    constructor(public navCtrl: NavController, public navParams: NavParams, private buildingService: BuildingProvider, private db: AngularFireDatabase, private loadingCtrl: LoadingController) {
        this.buildingId = navParams.get('buildingId');
        this.floorId = navParams.get('floorId');
        let buildings = this.buildingService.list();
        this.building = {
            name: ''
        };
        this.floor = {
            name: ''
        };
        for (let i = 0; i < buildings.length; i ++) {
            if (buildings[i].id == this.buildingId) {
                this.building = buildings[i];
                break;
            }
        }
        if (this.floorId) {
            for (let i = 0; i < this.building.floors.length; i ++) {
                if (this.building.floors[i].id == this.floorId) {
                    this.floor = this.building.floors[i];
                    break;
                }
            }
        }
        this.offices = [];
    }

    ionViewDidEnter() {
        this.loading = this.loadingCtrl.create();
        this.loading.present();

        let offices = this.db.list('/offices', {
            preserveSnapshot: true,
            query: {
                orderByChild: 'buildingId',
                equalTo: this.buildingId
            }
        });

        offices.subscribe(snapshots => {

            this.loading.dismiss();
            this.offices = [];

            snapshots.forEach(snapshot => {
                console.log(snapshot.key);
                console.log(snapshot.val());

                let office = snapshot.val();
                office['$id'] = snapshot.key;
                if (this.floorId) {
                    if (this.floorId != office['floorId']) {
                        return;
                    }
                }
                this.offices.push(office);
            });
        });
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad BuildingProfilePage');
    }

    public viewOffice(office) {
        this.navCtrl.push('OfficeProfilePage', {officeId: office.$id});
    }

    public editOffice(office, slidingItem: ItemSliding) {
        slidingItem.close();
        this.navCtrl.push('EditOfficePage', {officeId: office.$id});
    }
}

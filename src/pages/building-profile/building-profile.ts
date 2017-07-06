import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams} from 'ionic-angular';
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

    constructor(public navCtrl: NavController, public navParams: NavParams, private buildingService: BuildingProvider, private db: AngularFireDatabase, private loadingCtrl: LoadingController) {
        this.buildingId = navParams.get('buildingId');
        let buildings = this.buildingService.list();
        this.building = {
            name: ''
        };
        for (let i = 0; i < buildings.length; i ++) {
            if (buildings[i].id == this.buildingId) {
                this.building = buildings[i];
                break;
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
}

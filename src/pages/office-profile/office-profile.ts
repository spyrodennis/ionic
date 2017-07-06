import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams} from 'ionic-angular';
import {AngularFireDatabase} from 'angularfire2/database';
import {LoadingController, Loading} from 'ionic-angular';
import {BuildingProvider} from '../../providers/building/building';

/**
 * Generated class for the OfficeProfilePage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
    selector: 'page-office-profile',
    templateUrl: 'office-profile.html',
})
export class OfficeProfilePage {

    loading: Loading;
    officeId: any;
    office: any;
    employee: any;

    constructor(public navCtrl: NavController, public navParams: NavParams, private db: AngularFireDatabase, private loadingCtrl: LoadingController, private buildingService: BuildingProvider) {
        this.officeId = navParams.get('officeId');
        this.office = {
            owner: {},
            renter: {}
        };
        this.employee = {};
    }

    ionViewDidEnter() {
        this.init();

        this.loading = this.loadingCtrl.create();
        this.loading.present();

        let offices = this.db.list('/offices', {
            preserveSnapshot: true,
            query: {
                orderByKey: true,
                equalTo: this.officeId
            }
        });

        offices.subscribe(snapshots => {

            this.loading.dismiss();

            snapshots.forEach(snapshot => {
                console.log(snapshot.key);
                console.log(snapshot.val());

                this.office = snapshot.val();

                let buildings = this.buildingService.list();
                for (let i = 0; i < buildings.length; i ++) {
                    if (buildings[i].id == this.office.buildingId) {
                        this.office.buildingName = buildings[i].name;

                        for (let j = 0; j < buildings[i].floors.length; j ++) {
                            if (this.office.floorId == buildings[i].floors[j].id) {
                                this.office.floorName = buildings[i].floors[j].name;
                            }
                        }
                    }
                }
            });
        });
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad OfficeProfilePage');
    }


    private init() {
        this.employee = {
            first_name: '',
            last_name: '',
            phone_number: '',
            email: '',
            id: '',
            blood_type: ''
        };
    }
}

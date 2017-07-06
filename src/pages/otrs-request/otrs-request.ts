import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams} from 'ionic-angular';
import {AuthProvider} from '../../providers/auth/auth';
import {AngularFireDatabase} from 'angularfire2/database';
import {LoadingController, Loading} from 'ionic-angular';
import {BuildingProvider} from '../../providers/building/building';
import {CommonProvider} from '../../providers/common/common';

/**
 * Generated class for the OtrsRequestPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
    selector: 'page-otrs-request',
    templateUrl: 'otrs-request.html',
})
export class OtrsRequestPage {

    office: any;
    loading: Loading;
    officeKey: any;
    otrsRequest: any;

    constructor(public navCtrl: NavController, public navParams: NavParams, private auth: AuthProvider, private db: AngularFireDatabase, private loadingCtrl: LoadingController, private buildingService: BuildingProvider, private common: CommonProvider) {
        this.auth.getUser().then(user => {
            this.officeKey = user['officeKey'];
        });
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad OtrsRequestPage');
    }

    ionViewDidEnter() {
        this.loading = this.loadingCtrl.create();
        this.loading.present();

        let offices = this.db.list('/offices', {
            preserveSnapshot: true,
            query: {
                orderByKey: true,
                equalTo: this.officeKey
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

}

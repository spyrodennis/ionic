import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams} from 'ionic-angular';
import {AngularFireDatabase} from 'angularfire2/database';
import {LoadingController, Loading} from 'ionic-angular';
import {AuthProvider} from '../../providers/auth/auth';
import {BuildingProvider} from '../../providers/building/building';

/**
 * Generated class for the MaintenanceTrackerPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
    selector: 'page-maintenance-tracker',
    templateUrl: 'maintenance-tracker.html',
})
export class MaintenanceTrackerPage {

    requestKey: any;
    request: any;
    office: any;
    user: any;
    loading: Loading;
    authUser: any;
    viewRequest: any;

    constructor(public navCtrl: NavController, public navParams: NavParams, private db: AngularFireDatabase, private loadingCtrl: LoadingController, private auth: AuthProvider, private buildingService: BuildingProvider) {
        this.requestKey = this.navParams.get('requestKey');
        this.request = {};
        this.office = {};
        this.user = {};
        this.authUser = {
            level: 4
        };
        this.viewRequest = false;
        this.auth.getUser().then(user => {
            this.authUser = user;
        });
    }

    ionViewDidEnter() {
        this.loading = this.loadingCtrl.create();
        this.loading.present();

        let requests = this.db.list('/maintenance_requests', {
            preserveSnapshot: true,
            query: {
                orderByKey: true,
                equalTo: this.requestKey
            }
        });

        requests.subscribe(snapshots => {

            this.loading.dismiss();

            let steps = [
                {
                    current: 'Received',
                    next: 'SEND QUOTE'
                }, {
                    current: 'Quote',
                    next: 'TECHNICIAN'
                }, {
                    current: 'Tech',
                    next: 'COMPLETED'
                }, {
                    current: 'Completed',
                    next: 'INVOICE'
                }, {
                    current: 'Paid',
                    next: 'CLOSE'
                }, {
                    current: 'Closed',
                    next: ''
                }
            ];

            snapshots.forEach(snapshot => {
                console.log(snapshot.key);
                console.log(snapshot.val());

                this.request = snapshot.val();

                this.request.stepText = 'Step ' + this.request.step;

                if (this.authUser['level'] != 4) {
                    this.request.stepText += ' - ' + steps[this.request.step - 1].current;
                    this.request.stepNext = steps[this.request.step - 1].next;
                }

                this.loadUser();
                this.loadOffice();
            });
        });
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad MaintenanceTrackerPage');
    }

    private loadUser() {
        let users = this.db.list('/users', {
            preserveSnapshot: true,
            query: {
                orderByKey: true,
                equalTo: this.request['userKey']
            }
        });

        users.subscribe(snapshots => {

            snapshots.forEach(snapshot => {
                console.log(snapshot.key);
                console.log(snapshot.val());

                this.user = snapshot.val();
            });
        });
    }

    private loadOffice() {
        let offices = this.db.list('/offices', {
            preserveSnapshot: true,
            query: {
                orderByKey: true,
                equalTo: this.request['officeKey']
            }
        });

        offices.subscribe(snapshots => {

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

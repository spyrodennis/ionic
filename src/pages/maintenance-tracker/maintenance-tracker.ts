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
    requestDetail: any;
    requestDetailKey: any;

    //step 1
    showQuote: any;
    quote: any;

    //step 2
    quoteAccept: any;
    showSchedule: any;
    technician_date: any;
    technician_time: any;
    technician_name: any;
    technician_company: any;
    technician_phone: any;

    //step 3
    scheduleAccept: any;
    is_completed: any;

    //step 4
    is_paid: any;

    constructor(public navCtrl: NavController, public navParams: NavParams, private db: AngularFireDatabase, private loadingCtrl: LoadingController, private auth: AuthProvider, private buildingService: BuildingProvider) {
        this.requestKey = this.navParams.get('requestKey');
        this.request = {};
        this.requestDetail = {
            1: {
                status: 0,
                quote: '',
                updated_at: ''
            },
            2: {
                status: 0,
                technician_date: '',
                technician_time: '',
                technician_name: '',
                technician_company: '',
                technician_phone: '',
                updated_at: ''
            },
            3: {
                status: 0,
                is_completed: false,
                updated_at: ''
            },
            4: {
                is_paid: false,
                status: 0,
                updated_at: ''
            },
            5: {
                star: '',
                comment: '',
                status: 0,
                updated_at: ''
            }
        };
        this.office = {};
        this.user = {};
        this.authUser = {
            level: 4
        };
        this.viewRequest = false;
        this.auth.getUser().then(user => {
            this.authUser = user;
        });
        this.requestDetailKey = '';

        //step1
        this.showQuote = false;
        this.quote = '';

        //step2
        this.quoteAccept = false;
        this.showSchedule = false;
        this.technician_date = '';
        this.technician_time = '';
        this.technician_name = '';
        this.technician_company = '';
        this.technician_phone = '';

        //step 3
        this.scheduleAccept = false;
        this.is_completed = false;

        //step 4
        this.is_paid = false;
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

                this.loadStepDetail();
                this.loadUser();
                this.loadOffice();
            });
        });
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad MaintenanceTrackerPage');
    }

    private loadStepDetail() {
        let steps = this.db.list('/maintenance_steps', {
            preserveSnapshot: true,
            query: {
                orderByChild: 'maintenanceKey',
                equalTo: this.requestKey
            }
        });

        steps.subscribe(snapshots => {

            snapshots.forEach(snapshot => {
                console.log(snapshot.key);
                console.log(snapshot.val());

                this.requestDetailKey = snapshot.key;
                this.requestDetail = snapshot.val();

                if (this.requestDetail['1']['status'] == 1) {
                    this.quoteAccept = true;
                }

                if (this.requestDetail['2']['status'] == 1) {
                    this.scheduleAccept = true;
                }

                if (this.requestDetail['3']['status'] == 1) {
                    this.is_paid = true;
                }
            });
        });
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

    public goToStep2() {
        let step = this.db.object('/maintenance_steps/'+this.requestDetailKey+'/1');

        console.log(step);

        step.update({
            quote: this.quote,
        });

        let request = this.db.object('/maintenance_requests/'+this.requestKey);
        request.update({
            step: 2
        });
    }

    public goToStep3() {
        if (this.authUser.level == 4) {
            let step = this.db.object('/maintenance_steps/'+this.requestDetailKey+'/1');

            step.update({
                status: 1,
            });
        }else {
            let step = this.db.object('/maintenance_steps/'+this.requestDetailKey+'/2');
            step.update({
                technician_company: this.technician_company,
                technician_date: this.technician_date,
                technician_name: this.technician_name,
                technician_phone: this.technician_phone,
                technician_time: this.technician_time
            });

            let request = this.db.object('/maintenance_requests/'+this.requestKey);
            request.update({
                step: 3
            });
        }
    }

    public goToStep4() {
        if (this.authUser.level == 4) {
            let step = this.db.object('/maintenance_steps/'+this.requestDetailKey+'/2');

            step.update({
                status: 1,
            });
        }else {
            let step = this.db.object('/maintenance_steps/'+this.requestDetailKey+'/3');
            step.update({
                is_completed: true
            });

            let request = this.db.object('/maintenance_requests/'+this.requestKey);
            request.update({
                step: 4
            });
        }
    }

    public payInvoice() {
        let step = this.db.object('/maintenance_steps/'+this.requestDetailKey+'/3');

        step.update({
            status: 1,
        });
    }

    public paidInvoice() {
        let step = this.db.object('/maintenance_steps/'+this.requestDetailKey+'/4');
        step.update({
            is_paid: true
        });

        let request = this.db.object('/maintenance_requests/'+this.requestKey);
        request.update({
            step: 5
        });
    }


}

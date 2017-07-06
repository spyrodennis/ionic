import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams} from 'ionic-angular';
import {BuildingProvider} from '../../providers/building/building';
import {AngularFireDatabase, FirebaseListObservable} from 'angularfire2/database';
import {CommonProvider} from '../../providers/common/common';
import {LoadingController, Loading} from 'ionic-angular';

/**
 * Generated class for the CreateOfficePage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
    selector: 'page-create-office',
    templateUrl: 'create-office.html',
})
export class CreateOfficePage {

    buildings: any;
    floors: any;
    office: any;
    loading: Loading;
    offices: FirebaseListObservable<any>;

    constructor(public navCtrl: NavController, public navParams: NavParams, private buildingService: BuildingProvider, private db: AngularFireDatabase, private common: CommonProvider, private loadingCtrl: LoadingController) {
        this.offices = this.db.list('/offices', {preserveSnapshot: true});
        this.init();
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad CreateOfficePage');
    }

    private init() {
        this.buildings = this.buildingService.list();
        this.floors = this.buildings[0].floors;
        this.office = {
            name: '',
            buildingId: 1,
            floorId: 1,
            company: '',
            area: '',
            garages: '',
            coPay: '',
            is_rented: false,
            can_create_employee: false,
            can_pre_authorize: false,
            can_maintenance: false,
            can_mail_view: false,
            employees: {},
            owner: {
                first_name: '',
                last_name: '',
                phone_number: '',
                email: '',
                id: '',
                blood_type: ''
            },
            renter: {
                first_name: '',
                last_name: '',
                phone_number: '',
                email: '',
                id: '',
                blood_type: ''
            }
        }
    }

    public updateFloors() {
        for (let i = 0; i < this.buildings.length; i ++) {
            if (this.buildings[i].id == this.office.buildingId) {
                this.floors = this.buildings[i].floors;
                break;
            }
        }
    }

    public createOffice() {
        this.loading = this.loadingCtrl.create();
        this.loading.present();
        this.offices.push(this.office).then(_ => {
            this.loading.dismiss();
            this.common.showAlert('Office is created successfully!');
            this.navCtrl.pop();
        })
    }
}

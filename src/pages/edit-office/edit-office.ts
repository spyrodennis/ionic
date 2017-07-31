import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams} from 'ionic-angular';
import {AngularFireDatabase} from 'angularfire2/database';
import {LoadingController, Loading} from 'ionic-angular';
import {BuildingProvider} from '../../providers/building/building';
import {CommonProvider} from '../../providers/common/common';

/**
 * Generated class for the EditOfficePage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
    selector: 'page-edit-office',
    templateUrl: 'edit-office.html',
})
export class EditOfficePage {

    loading: Loading;
    officeId: any;
    office: any;
    owner: any;
    renter: any;
    buildings: any;
    floors: any;

    constructor(public navCtrl: NavController, public navParams: NavParams, private db: AngularFireDatabase, private loadingCtrl: LoadingController, private buildingService: BuildingProvider, private common: CommonProvider) {
        this.officeId = navParams.get('officeId');
        this.office = {};
        this.owner = {};
        this.renter = {};
    }

    ionViewDidEnter() {
        this.loading = this.loadingCtrl.create();
        this.loading.present();
        this.buildings = this.buildingService.list();
        this.floors = this.buildings[0].floors;

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

        this.loadOwnerAndRenter();
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad EditOfficePage');
    }

    private loadOwnerAndRenter() {
        let users = this.db.list('/users',  {
            preserveSnapshot: true,
            query: {
                orderByChild: 'officeKey',
                equalTo: this.officeId
            }
        });

        users.subscribe(snapshots => {

            snapshots.forEach(snapshot => {
                console.log(snapshot.key);
                console.log(snapshot.val());

                let user = snapshot.val();
                user.$id = snapshot.key;

                if (user.level == 3.1) {
                    this.owner = user;
                }else if (user.level == 3.2) {
                    this.renter = user;
                }
            });
        });
    }

    public updateOffice() {
        let office = this.db.object('/offices/'+this.officeId);
        office.update({
            name: this.office['name'],
            company: this.office['company'],
            area: this.office['area'],
            garages: this.office['garages'],
            coPay: this.office['coPay'],
        });

        let owner = this.db.object('/users/'+this.owner.$id);
        owner.update({
            first_name: this.owner['first_name'],
            last_name: this.owner['last_name'],
            phone_number: this.owner['phone_number'],
            email: this.owner['email'],
            blood_type: this.owner['blood_type'],
            password: this.owner['password']
        });

        let renter = this.db.object('/users/'+this.renter.$id);
        renter.update({
            first_name: this.renter['first_name'],
            last_name: this.renter['last_name'],
            phone_number: this.renter['phone_number'],
            email: this.renter['email'],
            blood_type: this.renter['blood_type'],
            password: this.renter['password']
        });

        this.common.showAlert("Information updated successfully!");
    }

}

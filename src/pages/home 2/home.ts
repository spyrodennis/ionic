import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';
import {AngularFireDatabase} from 'angularfire2/database';
import {LoadingController, Loading} from 'ionic-angular';

@Component({
    selector: 'page-home',
    templateUrl: 'home.html'
})
export class HomePage {

    loading: Loading;
    offices: any;

    constructor(public navCtrl: NavController, private db: AngularFireDatabase, private loadingCtrl: LoadingController) {
        this.offices = [];
    }

    ionViewDidEnter() {
        this.loading = this.loadingCtrl.create();
        this.loading.present();

        let offices = this.db.list('/offices', {
            preserveSnapshot: true,
            query: {
                orderByChild: "floorId"
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

    public buildingOffices(buildingId) {
        let offices = [];
        for (let i = 0; i < this.offices.length; i ++) {
            if (this.offices[i]['buildingId'] == buildingId) {
                offices.push(this.offices[i]);
            }
        }

        return offices;
    }

    public viewOffice(office) {
        this.navCtrl.push('OfficeProfilePage', {officeId: office.$id});
    }

    public viewBuildingList() {
        this.navCtrl.push('BuildingListPage');
    }

}

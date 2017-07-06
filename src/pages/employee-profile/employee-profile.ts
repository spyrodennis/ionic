import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams} from 'ionic-angular';
import {AngularFireDatabase} from 'angularfire2/database';
import {LoadingController, Loading} from 'ionic-angular';
import {CommonProvider} from '../../providers/common/common';

/**
 * Generated class for the EmployeeProfilePage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
    selector: 'page-employee-profile',
    templateUrl: 'employee-profile.html',
})
export class EmployeeProfilePage {

    employeeId: any;
    employee: any;
    loading: Loading;

    constructor(public navCtrl: NavController, public navParams: NavParams, private db: AngularFireDatabase, private loadingCtrl: LoadingController, private common: CommonProvider) {
        this.employeeId = navParams.get('employeeId');
        this.employee = {
            first_name: '',
            last_name: '',
            phone_number: '',
            email: '',
            blood_type: '',
            can_create_employee: false,
            can_pre_authorize: false,
            can_maintenance: false,
            can_mail_view: false,
        };
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad EmployeeProfilePage');
    }

    ionViewDidEnter() {
        this.loadEmployee();
    }


    private loadEmployee() {
        this.loading = this.loadingCtrl.create();
        this.loading.present();

        let employees = this.db.list('/users',  {
            preserveSnapshot: true,
            query: {
                orderByKey: true,
                equalTo: this.employeeId
            }
        });

        employees.subscribe(snapshots => {

            this.loading.dismiss();

            snapshots.forEach(snapshot => {
                console.log(snapshot.key);
                console.log(snapshot.val());

                let employee = snapshot.val();

                this.employee = employee;
            });
        });
    }

    public updateEmployee() {
        let employee = this.db.object('/users/'+this.employeeId);

        employee.update(this.employee);

        this.common.showAlert('Information updated successfully!');
    }
}

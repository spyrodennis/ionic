import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams, ItemSliding} from 'ionic-angular';
import {AngularFireDatabase} from 'angularfire2/database';
import {LoadingController, Loading} from 'ionic-angular';
import {BuildingProvider} from '../../providers/building/building';
import {CommonProvider} from '../../providers/common/common';

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
    employees: any;
    owner: any;
    renter: any;

    constructor(public navCtrl: NavController, public navParams: NavParams, private db: AngularFireDatabase, private loadingCtrl: LoadingController, private buildingService: BuildingProvider, private common: CommonProvider) {
        this.officeId = navParams.get('officeId');
        this.office = {};
        this.owner = {};
        this.renter = {};
        this.employee = {};
        this.employees = [];
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

        this.loadEmployees();
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad OfficeProfilePage');
    }

    private makePassword() {
        let text = "";
        let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (let i = 0; i < 5; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    }

    private init() {
        this.employee = {
            first_name: '',
            last_name: '',
            password: this.makePassword(),
            phone_number: '',
            email: '',
            level: 4,  // Office Employee + Assigned Access
            blood_type: '',
            officeKey: this.officeId,
            can_create_employee: false,
            can_pre_authorize: false,
            can_maintenance: false,
            can_mail_view: false,
        };
    }

    private loadEmployees() {
        this.employees = [];

        let employees = this.db.list('/users',  {
            preserveSnapshot: true,
            query: {
                orderByChild: 'officeKey',
                equalTo: this.officeId
            }
        });

        employees.subscribe(snapshots => {

            snapshots.forEach(snapshot => {
                console.log(snapshot.key);
                console.log(snapshot.val());

                let employee = snapshot.val();
                employee.$id = snapshot.key;

                if (employee.level == 3.1) {
                    this.owner = employee;
                }else if (employee.level == 3.2) {
                    this.renter = employee;
                }else if (employee.level == 4) {
                    this.employees.push(employee);
                }
            });
        });
    }

    public updateOffice() {
        let office = this.db.object('/offices/'+this.officeId);

        office.update({
            is_rented: this.office.is_rented
        });

        if (this.employee.first_name != '' && this.employee.last_name != '') {
            let employees = this.db.list('/users', {preserveSnapshot: true});
            console.log(this.employee);
            employees.push(this.employee).then(_ => {
                this.loadEmployees();
                this.init();
            })
        }

        this.common.showAlert('Office updated successfully!');
    }

    public editEmployee(employee, slidingItem: ItemSliding) {
        slidingItem.close();
        this.navCtrl.push('EmployeeProfilePage', {employeeId: employee.$id})
    }
}

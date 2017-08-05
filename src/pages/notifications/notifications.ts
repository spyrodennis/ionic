import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams} from 'ionic-angular';
import {PushServiceProvider} from "../../providers/push-service/push-service"
import {LoadingController, Loading} from 'ionic-angular';

/**
 * Generated class for the NotificationsPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
    selector: 'page-notifications',
    templateUrl: 'notifications.html',
})
export class NotificationsPage {

    loading: Loading;

    constructor(public navCtrl: NavController, public navParams: NavParams, private pushService: PushServiceProvider, private loadingCtrl: LoadingController) {
    }

    ionViewDidEnter() {
        this.loading = this.loadingCtrl.create();
        this.loading.present();

        this.pushService.getNotifiactionList().then(res => {
            this.loading.dismiss();
            console.log(res);
        }).catch(err => {
            this.loading.dismiss();
            console.log(err);
        })
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad NotificationsPage');
    }

}

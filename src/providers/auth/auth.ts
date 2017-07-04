import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import 'rxjs/add/operator/map';
import {Storage} from '@ionic/storage';

/*
 Generated class for the AuthProvider provider.

 See https://angular.io/docs/ts/latest/guide/dependency-injection.html
 for more info on providers and Angular DI.
 */
@Injectable()
export class AuthProvider {

    public userKey: any;

    constructor(public http: Http, private storage: Storage) {
        console.log('Hello AuthProvider Provider');

        storage.ready().then(() => {
            storage.get('user_key').then(userKey => {
                this.userKey = userKey;
            }).catch(console.log);
        });
    }


    public isAuthenticated() {
        return new Promise((resolve, reject) => {
            this.storage.ready().then(() => {
                this.storage.get('user_key').then(userKey => {
                    if (userKey)
                        resolve(userKey);
                    else
                        reject(false);
                }).catch(console.log);
            });
        });
    }
}

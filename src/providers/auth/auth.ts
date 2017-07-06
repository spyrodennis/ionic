import {Injectable} from '@angular/core';
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

    constructor(private storage: Storage) {
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

    public setToken(token) {
        return new Promise((resolve, reject) => {
            this.storage.set('user_key', token).then(() => {
                this.userKey = token;

                resolve(true);
            });
        });
    }

    public logout() {
        return new Promise((resolve, reject) => {
            this.storage.remove('user_key').then(() => {
                resolve(true);
            })
        });
    }
}

import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { UtilsProvider } from '../../providers/utils/utils';

import * as firebase from "firebase";

@IonicPage()
@Component({
  selector: 'page-admin-users',
  templateUrl: 'admin-users.html',
})
export class AdminUsersPage {

  admins: Array<any> = [];

  constructor(public navCtrl: NavController, 
    public utils: UtilsProvider,
    public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AdminUsersPage');
  }

  ionViewWillEnter(){
    this.admins = [];
    this.getAdmins();
  }

  getAdmins(){
    this.utils.presentLoading();
    firebase.database().ref().child('users').orderByChild("isAdmin").equalTo(true)
      .once('value', (snapshot) => {
        var users = snapshot.val();
        for (var key in users){
          var user = users[key];
          if (user.isAdmin && user.uid !== localStorage.getItem("uid")) {
            this.admins.push(user);
          }
        }
        this.utils.stopLoading();
    });
}

}

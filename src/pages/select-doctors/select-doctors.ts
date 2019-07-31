import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { UtilsProvider } from '../../providers/utils/utils';

import * as firebase from "firebase";

@IonicPage()
@Component({
  selector: 'page-select-doctors',
  templateUrl: 'select-doctors.html',
})
export class SelectDoctorsPage {

  allDoctors: Array<any> = [];
  client: any = {};

  constructor(public navCtrl: NavController,
    public utils: UtilsProvider,
    public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SelectDoctorsPage');
    this.client = this.navParams.get("client");

    if(!this.client.doctors) {
      this.client.doctors = {};
    }
  }

  ionViewWillEnter() {
    this.allDoctors = [];
    this.getAllDoctors();
  }

  getAllDoctors() {
    this.utils.presentLoading();
    firebase.database().ref().child('users')
      .once('value', (snapshot) => {
        var users = snapshot.val();
        for (var key in users) {
          var user = users[key];
          if(!user.clients) {
            user.clients = {};
          }

          if (!user.isAdmin && !user.clients[this.client.key]) {
            this.allDoctors.push(user);
          }
        }
        this.utils.stopLoading();
      });
  }

  addDoctors() {
    var selectedDoctors = this.allDoctors.filter(x => x.isSelected);

    if (selectedDoctors.length < 1) {
      this.navCtrl.pop();

      return;
    }

    this.utils.presentLoading();

    var updates = {};

    var username = localStorage.getItem("name");

    selectedDoctors.forEach(doctor => {
      updates[`/clients/${this.client.key}/doctors/${doctor.uid}`] = true;
      updates[`/users/${doctor.uid}/clients/${this.client.key}`] = true;

      var commentKey = firebase.database().ref().child(`comments/${this.client.key}`).push().key;
      var comment = {
        comment: `${username} added ${doctor.name} to discussion.`,
        timestamp: Number(new Date())
      }

      updates[`/comments/${this.client.key}/${commentKey}`] = comment;

      this.utils.sendNotification(doctor.uid, "", `${username} added you to discussion of ${this.client.name}.`);
    });

    firebase.database().ref().update(updates)
      .then(() => {
        this.utils.stopLoading();
        this.navCtrl.pop();
      })
  }

}

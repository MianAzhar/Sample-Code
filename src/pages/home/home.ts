import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { DiscussionPage } from '../discussion/discussion';

import * as firebase from "firebase";
import { UtilsProvider } from '../../providers/utils/utils';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  approvedClients: Array<any> = [];
  pendingClients: Array<any> = [];

  isAdmin: boolean = false;
  uid: string = "";

  constructor(public navCtrl: NavController,
    public utils: UtilsProvider) {

  }

  ionViewDidLoad() {
    this.isAdmin = localStorage.getItem("isAdmin") ? true : false;
    this.uid = localStorage.getItem("uid");
  }

  ionViewWillEnter() {
    this.approvedClients = [];
    this.pendingClients = [];
    if (localStorage.getItem("isAdmin")) {
      this.getAdminClients();
    } else {
      this.getClients();
    }
  }

  getClients() {
    //this.utils.presentLoading();

    firebase.database().ref(`/users/${this.uid}/clients`)
      .once("value")
      .then((snapshot) => {
        var clients = snapshot.val();

        if (!clients) {
          return;
        }

        for (var key in clients) {
          this.getClient(key);
        }
      });
  }

  getClient(id) {
    firebase.database().ref().child(`clients/${id}`)
      .once("value")
      .then((snapshot) => {

        var client = snapshot.val();
        client.key = id;

        if (client.isApproved) {
          this.approvedClients.push(client);
        }
      })
      .catch(err => {
        console.log(err);
        alert(err.message);
        this.utils.stopLoading();
      });
  }

  getAdminClients() {
    firebase.database().ref().child("clients")
      .once("value")
      .then((snapshot) => {

        var clients = snapshot.val();

        for (var key in clients) {
          var client = clients[key];

          client.key = key;

          if (client.isApproved) {
            this.approvedClients.push(client);
          } else if (this.isAdmin) {
            this.pendingClients.push(client);
          }
        }

        this.utils.stopLoading();
      })
      .catch(err => {
        console.log(err);
        alert(err.message);
        this.utils.stopLoading();
      })
  }

  details(client) {
    this.navCtrl.push(DiscussionPage, { client: client });
  }

  toDiscussion() {
    this.navCtrl.push(DiscussionPage);
  }

}

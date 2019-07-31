import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Events } from 'ionic-angular';
import { HomePage } from '../home/home';

import * as firebase from "firebase";
import { UtilsProvider } from '../../providers/utils/utils';

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  user: any = {
    email: "",
    password: ""
  }

  constructor(public navCtrl: NavController,
    public utils: UtilsProvider,
    public events: Events,
    public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LoginPage');
  }

  login() {
    if (!this.user.email) {
      return alert("Email required!");
    } else if (!this.user.password) {
      return alert("Password required!");
    } else if (!this.utils.validateEmail(this.user.email)) {
      return alert("Invallid email!");
    }

    this.utils.presentLoading();

    firebase.auth().signInWithEmailAndPassword(this.user.email, this.user.password)
      .then((user) => {
        var uid = user.user.uid;
        this.getUserProfile(uid);
      })
      .catch(err => {
        this.utils.stopLoading();
        alert(err.message);
      })
  }

  getUserProfile(uid) {
    firebase.database().ref().child(`users/${uid}`)
      .once("value")
      .then((snapshot) => {
        var profile = snapshot.val();

        if(localStorage.getItem("deviceToken")) {
          var token: string = localStorage.getItem("deviceToken");

          var tokens: Array<any> = profile.deviceTokens || [];

          if(tokens.indexOf(token) < 0) {
            tokens.push(token);
            firebase.database().ref().child(`users/${uid}/deviceTokens`).set(tokens);
          }
        }

        localStorage.setItem("uid", uid);
        localStorage.setItem("name", profile.name);
        localStorage.setItem("isAdmin", profile.isAdmin ? "true" : "");
        localStorage.setItem("profileURL" , profile.profileURL || "");
        localStorage.setItem("user_loggedIn" , "true");
        this.events.publish("userUpdated");
        this.utils.stopLoading();

        this.navCtrl.setRoot(HomePage);
      })
      .catch(err => {
        this.utils.stopLoading();
        alert(err.message);
      })
  }

}

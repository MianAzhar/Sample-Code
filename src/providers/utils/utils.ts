import { Injectable } from '@angular/core';
import { LoadingController } from 'ionic-angular';

import * as firebase from "firebase";

@Injectable()
export class UtilsProvider {

  private loader: any;

  constructor(public loadingCtrl: LoadingController) {
    console.log('Hello UtilsProvider Provider');
  }

  public presentLoading() {
    if (this.loader)
      return;

    this.loader = this.loadingCtrl.create({
      content: "Please wait..."
    });
    this.loader.onDidDismiss(() => {
      this.loader = undefined;
    });

    this.loader.present();
  }

  public stopLoading() {
    if (this.loader) {
      this.loader.dismiss();
      this.loader = undefined;
    }
  }

  validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

  public sendNotification(uid, title, message) {
    firebase.database().ref().child(`users/${uid}/deviceTokens`)
      .once("value")
      .then(snapshot => {
        var tokens = snapshot.val();

        if (!tokens) {
          return;
        }

        var func = firebase.functions().httpsCallable('sendNotification');

        func({
          title: title,
          message: message,
          deviceToken: tokens
        })
          .then(res => {
            console.log("Notification sent!");
          })
          .catch(err => {
            console.log(err.message);
          })
      })
  }

}

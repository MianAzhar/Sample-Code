import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import * as firebase from "firebase";
import { UtilsProvider } from '../../providers/utils/utils';
import { CallNumber } from '@ionic-native/call-number';
import { EmailComposer } from '@ionic-native/email-composer';

@IonicPage()
@Component({
  selector: 'page-doctors',
  templateUrl: 'doctors.html',
})
export class DoctorsPage {

  public allDoctors: Array<any> = [];

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private callNumber: CallNumber,
    private emailComposer: EmailComposer,
    public utils: UtilsProvider, ) {
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
          if (!user.isAdmin && user.uid !== localStorage.getItem("uid")) {
            this.allDoctors.push(user);
          }
        }
        this.utils.stopLoading();
      });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad DoctorsPage');
  }

  call(doctor) {
    this.callNumber.callNumber(doctor.contact, true)
      .then(res => console.log('Launched dialer!', res))
      .catch(err => console.log('Error launching dialer', err));
  }

  openEmail(doctor) {
    this.emailComposer.isAvailable().then((available: boolean) => {
      if (available) {
        let email = {
          to: doctor.email
        };

        // Send a text message using default options
        this.emailComposer.open(email);
      }
    });
  }

}

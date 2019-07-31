import { Component, ViewChild } from '@angular/core';
import { Nav, Platform, Events } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { UtilsProvider } from '../providers/utils/utils';
import * as firebase from "firebase";
import { Firebase } from '@ionic-native/firebase';

import { HomePage } from '../pages/home/home';
import { ListPage } from '../pages/list/list';
import { AddClientsPage } from '../pages/add-clients/add-clients';
import { AdminUsersPage } from '../pages/admin-users/admin-users';
import { DiscussionPage } from '../pages/discussion/discussion';
import { LoginPage } from '../pages/login/login';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  public rootPage: any = LoginPage;
  public isAdmin = localStorage.getItem("isAdmin");
  public profileURL: any;
  public displayName: any;
  public profileUrl: any = localStorage.getItem("profileURL") || "";

  pages: Array<{ title: string, component: any }>;
  appPages: any;

  constructor(public platform: Platform,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen,
    public events: Events,
    public fb: Firebase,
    public utils: UtilsProvider) {
    this.initializeApp();

    // used for an example of ngFor and navigation
    this.pages = [
      { title: 'Home', component: HomePage },
      { title: 'List', component: ListPage }
    ];

    this.events.subscribe('userUpdated', (val) => {
      this.displayName = localStorage.getItem("name");
      this.profileURL = localStorage.getItem("profileURL") || "";
      this.isAdmin = localStorage.getItem("isAdmin");
    });

    if (localStorage.getItem("user_loggedIn") == "true") {
      this.rootPage = HomePage;
    }

    this.appPages = {
      homePage: HomePage,
      addClientsPage: AddClientsPage,
      adminUsersPage: AdminUsersPage,
      loginPage: LoginPage,
      discussionPage: DiscussionPage,
    }
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.splashScreen.hide();

      if (this.platform.is("cordova")) {

        this.fb.hasPermission()
          .then((isEnabled) => {
            if (!isEnabled.isEnabled) {
              this.fb.grantPermission();
            }
          })

        this.fb.getToken()
          .then(token => {
            console.log(`The token is ${token}`);
            //alert("get " + token);
            if (localStorage.getItem("deviceToken") !== token) {
              localStorage.setItem("deviceToken", token);
              if (localStorage.getItem("uid")) {
                this.setUserToken(token);
              }
            }
          })
          .catch(error => console.error('Error getting token', error));

        this.fb.onTokenRefresh()
          .subscribe((token: string) => {
            console.log(`Got a new token ${token}`);

            if (localStorage.getItem("deviceToken") !== token) {
              localStorage.setItem("deviceToken", token);
              if (localStorage.getItem("uid")) {
                this.setUserToken(token);
              }
            }
          });

        this.fb.onNotificationOpen()
          .subscribe((data) => {

            //alert(JSON.stringify(data));
          });
      }
    });
  }

  setUserToken(token) {
    var uid = localStorage.getItem("uid");

    firebase.database().ref().child(`users/${uid}/deviceTokens`)
      .once("value")
      .then(snapshot => {
        var tokens: Array<any> = snapshot.val() || [];

        tokens.push(token);

        firebase.database().ref().child(`users/${uid}/deviceTokens`).set(tokens);
      })
      .catch(err => {
        console.log(err.message);
      })
  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(page.component);
  }

  logoutUser() {
    var self = this;
    self.utils.presentLoading();
    //localStorage.clear();
    var user = firebase.auth().currentUser;
    this.removeCurrentTokenFromUser();
    if (user != null) {
      firebase.auth().signOut().then(function () {
        // Sign-out successful.
        localStorage.setItem("user_logged_in", "false");
        var token = localStorage.getItem("deviceToken") || "";
        localStorage.clear();
        localStorage.setItem("deviceToken", token);
        self.utils.stopLoading();
        self.nav.setRoot(LoginPage);
      }, function (error) {
        self.utils.stopLoading();
        alert("Error Signing Out");
      });
    } else {
      self.utils.stopLoading();
      alert("No User");
    }
  }

  removeCurrentTokenFromUser() {
    var uid = localStorage.getItem("uid");
    var token = localStorage.getItem("deviceToken");

    firebase.database().ref().child(`users/${uid}/deviceTokens`)
      .once("value")
      .then(snapshot => {
        var tokens: Array<any> = snapshot.val() || [];

        var index = tokens.indexOf(token);

        if (index >= 0) {
          tokens.splice(index, 1);

          if(tokens.length > 0) {
            firebase.database().ref().child(`users/${uid}/deviceTokens`).set(tokens);
          } else {
            firebase.database().ref().child(`users/${uid}/deviceTokens`).set(null);
          }
        }
      })
      .catch(err => {
        console.log(err.message);
      })
  }
}

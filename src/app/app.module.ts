import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import * as firebase from "firebase";
import { Camera } from '@ionic-native/camera/';
import { Dialogs } from '@ionic-native/dialogs';
import { Firebase } from '@ionic-native/firebase';
import { CallNumber } from '@ionic-native/call-number';
import { EmailComposer } from '@ionic-native/email-composer';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { ListPage } from '../pages/list/list';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { AddClientsPage } from '../pages/add-clients/add-clients';
import { AdminUsersPage } from '../pages/admin-users/admin-users';
import { DiscussionPage } from '../pages/discussion/discussion';
import { LoginPage } from '../pages/login/login';
import { SelectDoctorsPage } from '../pages/select-doctors/select-doctors';
import { UtilsProvider } from '../providers/utils/utils';

// Initialize Firebase
var config = {
  apiKey: "XXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "XXXXXXXXXX.firebaseapp.com",
  databaseURL: "https://XXXXXXXXXXXXXXX.firebaseio.com",
  projectId: "XXXXXXXXX",
  storageBucket: "XXXXXXXXX.appspot.com",
  messagingSenderId: "XXXXXXXXXXXXXXX"
};
firebase.initializeApp(config);

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    ListPage,
    AddClientsPage,
    AdminUsersPage,
    DiscussionPage,
    LoginPage,
    SelectDoctorsPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    ListPage,
    AddClientsPage,
    AdminUsersPage,
    DiscussionPage,
    LoginPage,
    SelectDoctorsPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    Camera,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    UtilsProvider,
    Dialogs,
    Firebase,
    CallNumber,
    EmailComposer
  ]
})
export class AppModule {}

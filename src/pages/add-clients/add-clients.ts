import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { HomePage } from '../home/home';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { Dialogs } from '@ionic-native/dialogs';

import * as firebase from "firebase";
import { UtilsProvider } from '../../providers/utils/utils';

@IonicPage()
@Component({
  selector: 'page-add-clients',
  templateUrl: 'add-clients.html',
})
export class AddClientsPage {

  client: any = {
    name: "",
    injury: "",
    location: "",
    description: "",
    photo: "",
    isApproved: false,
    uid: ""
  }

  photoData: any = "";

  uid: string = "";

  constructor(public navCtrl: NavController,
    private dialogs: Dialogs,
    public camera: Camera,
    public utils: UtilsProvider,
    public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AddClientsPage');
    this.uid = localStorage.getItem("uid");
    this.client.uid = this.uid;
  }

  createClient() {
    if (!this.client.name) {
      return alert("Please enter client name!");
    }

    if (!this.client.injury) {
      return alert("Please enter client injury!");
    }

    if (!this.client.location) {
      return alert("Please enter client location!");
    }

    if (!this.client.description) {
      return alert("Please enter description!");
    }

    if(this.photoData) {
      this.uploadPhoto();
    } else {
      this.saveClientToFirebase();
    }
  }

  uploadPhoto() {
    this.utils.presentLoading();

    let storageRef = firebase.storage().ref();

    // Create a timestamp as filename
    const filename = Math.floor(Date.now() / 1000);

    // Create a reference to 'images/todays-date.jpg'
    const imageRef = storageRef.child(`userImages/${filename}.jpg`);

    imageRef.putString(this.photoData, firebase.storage.StringFormat.DATA_URL).then((snapshot) => {
      snapshot.ref.getDownloadURL().then((url) => {

        this.client.photo = url;
        this.saveClientToFirebase();
      });
    });
  }

  saveClientToFirebase() {
    this.utils.presentLoading();

    var key = firebase.database().ref().child("clients").push().key;

    this.client.timestamp = Number(new Date());

    this.client.doctors = {};

    this.client.doctors[this.uid] = true;

    var updates = {};
    updates[`/clients/${key}`] = this.client;
    updates[`/users/${this.uid}/clients/${key}`] = true;

    firebase.database().ref().update(updates)
    .then(() => {
      alert("Request sent to admin for approval.");
      this.utils.stopLoading();

      this.navCtrl.setRoot(HomePage);
    })
    .catch(err => {
      console.log(err);
      alert(err.message);
      this.utils.stopLoading();
    })
  }

  chooseImage() {
    this.dialogs.confirm("Choose photo from", "Profile Photo", ["Camera", "Gallery", "Cancel"])
      .then((index) => {
        if (index === 1) {
          this.openCamera();
        } else if (index === 2) {
          this.openGallery();
        }
      });
  }

  openCamera() {
    const options: CameraOptions = {
      quality: 50,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      correctOrientation: true,
      sourceType: 1,
    }

    this.camera.getPicture(options).then((imageData) => {
      let base64Image = 'data:image/jpeg;base64,' + imageData;
      this.photoData = base64Image;
      //this.uploadPhoto();
    }, (err) => {
      // Handle error
    });
  }


  openGallery() {
    const options: CameraOptions = {
      quality: 50,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      correctOrientation: true,
      sourceType: 2,
    }

    this.camera.getPicture(options).then((imageData) => {
      let base64Image = 'data:image/jpeg;base64,' + imageData;
      this.photoData = base64Image;
      //this.uploadPhoto();
    }, (err) => {
      // Handle error
    });
  }

  toHome() {
    this.navCtrl.push(HomePage);
  }

}

import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { UtilsProvider } from '../../providers/utils/utils';
import { Camera, CameraOptions } from '@ionic-native/camera';
import * as firebase from "firebase";
import { HomePage } from '../home/home';

@IonicPage()
@Component({
  selector: 'page-add-doctor',
  templateUrl: 'add-doctor.html',
})
export class AddDoctorPage {

  public imagePath: any;
  public newfile: any;
  public profileURL: any;
  doctor: any = {
    name: "",
    email: "",
    contact: "",
    password: "",
    confirmPassword: "",
    profileURL: ""
  }

  constructor(public navCtrl: NavController,
    public utils: UtilsProvider,
    public navParams: NavParams,
    public camera: Camera, public alertCtrl: AlertController) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AddDoctorPage');
  }


  showConfirm() {
    let confirm = this.alertCtrl.create({
      title: 'Select',
      buttons: [
        {
          text: 'Camera',
          handler: () => {
            this.openCamera();
          }
        },
        {
          text: 'Gallery',
          handler: () => {
            this.openGallery();
          }
        }
      ]
    });
    confirm.present();
  }


  uploadfile() {

    var self = this;
    let storageRef = firebase.storage().ref();

    // Create a timestamp as filename
    const filename = Math.floor(Date.now() / 1000);

    // Create a reference to 'images/todays-date.jpg'
    const imageRef = storageRef.child(`profileImages/${filename}.jpg`);

    imageRef.putString(self.imagePath, firebase.storage.StringFormat.DATA_URL).then((snapshot) => {

      console.log(JSON.stringify(snapshot.metadata));
      console.log(snapshot.metadata.name);

      firebase.storage().ref('profileImages/' + snapshot.metadata.name).getDownloadURL().then(function (url) {
        self.profileURL = url;
        self.createUserCloudCode();
      });
    });
  }


  openCamera() {

    var self = this;
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
      self.imagePath = base64Image;
      self.newfile = true;
    }, (err) => {
      // Handle error
    });
  }

  openGallery() {

    var self = this;
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
      self.imagePath = base64Image;
      self.newfile = true;
    }, (err) => {
      // Handle error
    });
  }


  saveDoctor() {
    if (!this.doctor.name) {
      return alert("Name required!");
    }
    if (!this.doctor.email) {
      return alert("Email required!");
    }
    if (!this.doctor.contact) {
      return alert("Contact required!");
    }
    if (!this.doctor.password) {
      return alert("Password required!");
    } else if (this.doctor.password.length < 6) {
      return alert("Password must have atleast 6 characters!");
    } else if (this.doctor.password !== this.doctor.confirmPassword) {
      return alert("Password does not match!");
    }

    this.createUser();
  }


  createUser() {
    this.utils.presentLoading();
    if (this.newfile) {
      this.uploadfile();
    } else {
      this.createUserCloudCode();
    }
  }


  createUserCloudCode() {
    var func = firebase.functions().httpsCallable('createUser');
    func(this.doctor).then((result) => {
      debugger;
      var data = result.data;

      if (data.success) {
        debugger;
        this.saveData(data.data.uid);
      } else {
        this.utils.stopLoading();
        alert(data.data);
      }

    }, (error) => {
      this.utils.stopLoading();
      alert(error.message);
      debugger;
    });
  }

  saveData(uid) {
    var updates = {};

    delete this.doctor.password;
    delete this.doctor.confirmPassword;
    if (this.profileURL && this.newfile) {
      this.doctor.profileURL = this.profileURL;
    }

    this.doctor.uid = uid;

    updates[`/users/${uid}`] = this.doctor;

    firebase.database().ref().update(updates)
      .then(() => {
        this.utils.stopLoading();

        alert("Health Care Provider created.");
        this.navCtrl.push(HomePage);
      })
      .catch(err => {
        this.utils.stopLoading();

        alert(err.message);
      })
  }

}

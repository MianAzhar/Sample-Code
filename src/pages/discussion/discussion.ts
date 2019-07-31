import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { SelectDoctorsPage } from '../select-doctors/select-doctors';

import * as firebase from "firebase";

import * as moment from "moment";
import { UtilsProvider } from '../../providers/utils/utils';

@IonicPage()
@Component({
  selector: 'page-discussion',
  templateUrl: 'discussion.html',
})
export class DiscussionPage {

  client: any = {};

  comments: Array<any> = [];

  users: any = {};

  newComment: any = {
    comment: "",
    timestamp: Number(new Date()),
    senderId: ""
  };

  constructor(public navCtrl: NavController,
    public utils: UtilsProvider,
    public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad DiscussionPage');

    this.client = this.navParams.get("client");

    this.newComment.senderId = localStorage.getItem("uid");
  }

  ionViewWillEnter() {
    this.comments = [];
    this.users = {};
    if (this.client.isApproved) {
      this.getComments();
    }
  }

  approveClient() {
    var updates = {};

    updates[`clients/${this.client.key}/isApproved`] = true;

    firebase.database().ref().update(updates);

    this.utils.sendNotification(this.client.uid, "Client Request Approved", `Your client '${this.client.name}' is approved by admin.`);

    this.client.isApproved = true;
  }

  getComments() {

    this.users[localStorage.getItem("uid")] = {
      name: localStorage.getItem("name"),
      profileURL: localStorage.getItem("profileURL")
    };

    firebase.database().ref().child(`comments/${this.client.key}`)
      .once("value")
      .then((snapshot) => {
        var comments = snapshot.val();

        if (!comments) {
          return;
        }

        for (var key in comments) {
          comments[key].date = moment(comments[key].timestamp).format("DD-MM-YY")
          this.comments.push(comments[key]);
          if (comments[key].senderId) {
            this.getUser(comments[key].senderId);
          }
        }

      });
  }

  getUser(uid) {
    if (this.users[uid]) {
      return;
    }

    this.users[uid] = {
      name: "",
      profileURL: ""
    }

    firebase.database().ref().child(`users/${uid}`)
      .once("value")
      .then((snapshot) => {
        var user = snapshot.val();

        this.users[uid].name = user.name;
        this.users[uid].profileURL = user.profileURL;
      });
  }

  postComment() {
    if (!this.newComment.comment) {
      return;
    }

    var updates = {};

    this.newComment.timestamp = Number(new Date());

    var commentKey = firebase.database().ref().child(`comments/${this.client.key}`).push().key;

    updates[`/comments/${this.client.key}/${commentKey}`] = this.newComment;

    firebase.database().ref().update(updates);

    this.newComment.date = moment(this.newComment.timestamp).format("DD-MM-YY")

    this.comments.push(this.newComment);

    this.newComment = {
      comment: "",
      timestamp: Number(new Date()),
      senderId: localStorage.getItem("uid"),
    }
  }

  toSelectDoctors() {
    this.navCtrl.push(SelectDoctorsPage, { client: this.client });
  }

}

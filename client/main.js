import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import {Meteor} from 'meteor/meteor'
import { Accounts } from 'meteor/accounts-base';

import './main.html';
Meteor.startup(function() {
  GoogleMaps.load({key: "AIzaSyDK_WE6H2MK6KUwKXWj5_GKNk7PI7Rg1yc"});
});
Session.set('location', {"lat":100, "lng":100});
Session.set('submit', false);
Session.set('error', false);
Accounts.ui.config({
  passwordSignupFields: 'USERNAME_ONLY',
});
Accounts.onLogin(function() {
    Meteor.call('getNew', (err, result) => {
      console.log(err);
      console.log("My result:", result);
      Session.set('q', result);
    });
});
Accounts.onLogout(function() {
  Session.set('q', null);
});
const assert = require('assert');
Template.body.onCreated(function helloOnCreated() {
  Meteor.call('getNew', (err, result) => {
    console.log(err);
    console.log("My result:", result);
    Session.set('q', result);
  });
  return Session.get('q');
});
Template.map.onCreated(function() {
  var self = this;

  GoogleMaps.ready('map', function(map) {
    var marker;
    self.autorun(function() {
      var latLng = Session.get('location');
      if (! latLng)
        return;
      if (! marker) {
        marker = new google.maps.Marker({
          position: new google.maps.LatLng(latLng.lat, latLng.lng),
          map: map.instance
        });
      }
      else {
        marker.setPosition(latLng);
      }
      map.instance.setCenter(marker.getPosition());
      map.instance.setZoom(15);
    });
  });
});
Template.map.helpers({
  mapOptions: function() {
    var latLng = Session.get('location');
    // Initialize the map once we have the latLng.
    if (GoogleMaps.loaded() && latLng) {
      return {
        center: new google.maps.LatLng(latLng.lat, latLng.lng),
        zoom: 15
      };
    }
  }
});
Template.body.helpers({
  counter() {
    return Session.get('q');
  },
  returnAllUsers() {
    return Meteor.users.find();
  },
  returnForm() {
    return Session.get('submit');
  },
  errorReturn() {
    return Session.get('error');
  }
});




Template.body.events({
  'submit .issuenew'(val) {
    val.preventDefault();

    const target = val.target;
    text = target.text.value;
    Meteor.call('geoLocate', text, (err, result) => {
      console.log("Error", err);
      if(!err) {
        console.log(err);
        Session.set('location', result.geometry.location);
        Session.set('asset', text);
        Session.set('submit', true);
        Session.set('error', false);
      }
    });
    target.text.value='';
  },
  'click .issueasset'() {
    console.log(Session.get('asset'));
    Meteor.call('issueNew', Session.get('asset'), (err, res) =>{
      if(err) {
        Session.set('error', true);
      }
      else {
        Session.set('error', false);
      }
    });
    Meteor.call('getNew', (err, result) => {
      console.log(err);
      console.log("My result:", result);
      Session.set('q', result);
    });
    Session.set('submit', false);
  },
  'click .list-group'(input) {
    console.log("yeet");
    const target = input.target;
    const text = target.value;
    console.log(text);
    Session.set('z', text);
    Meteor.call('geoLocate', text, (err, result) => {
      console.log("Error", err);
      if(!err) {
        console.log(err);
        console.log("My result:", result.lat, result.lng);
        Session.set('location', result);
      }
    });
  },
  'submit .transactasset'(val) {
    val.preventDefault();
    const target = val.target;
    const number = target.user.selectedIndex;
    const text = target.user.options[number].text;
    console.log(text);
    Meteor.call('transact', Session.get('z'), text, (err, res) => {
      console.log(res);
    });
  }
});

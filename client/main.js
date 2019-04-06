import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import {Meteor} from 'meteor/meteor'
import { Accounts } from 'meteor/accounts-base';

import './main.html';
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

Template.body.helpers({
  counter() {
    return Session.get('q');
  },
  returnAllUsers() {
    return Meteor.users.find();
  }
});




Template.body.events({
  'submit .issuenew'(val) {
    val.preventDefault();

    const target = val.target;
    const text = target.text.value;

    Meteor.call('issueNew', text);
    target.text.value='';
    Meteor.call('getNew', (err, result) => {
      console.log(err);
      console.log("My result:", result);
      Session.set('q', result);
    });
    Meteor.call('geoLocate');
  },
  'click .list-group'(input) {
    console.log("yeet");
    const target = input.target;
    const text = target.value;
    console.log(text);
    Session.set('z', text);
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

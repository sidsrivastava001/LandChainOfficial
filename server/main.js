import { Meteor } from 'meteor/meteor';
import { Promise } from 'meteor/promise';
import { Accounts } from 'meteor/accounts-base';
import { Mongo } from 'meteor/mongo';

const connection = {
    port: 4772,
    host: '127.0.0.1',
    user: "multichainrpc",
    pass: "Bot53WZ4bJ1iaDxUWyjtuqUyq5MEtdMYdFKM8HtoAqiC"
};

const googleMapsClient = require('@google/maps').createClient({
  key: "AIzaSyDK_WE6H2MK6KUwKXWj5_GKNk7PI7Rg1yc",
  Promise: Promise
});
Accounts.onCreateUser((options, user) => {
  const new_address = Promise.await(multichain.getNewAddress());
  //console.log(new_address);
  user.multichain_address = new_address;
  return user;
})
const multichain = require('multichain-node')(connection);
Meteor.methods({
    getNew() {
      //console.log(Meteor.user());
      if(!Meteor.userId()) {
        throw new Meteor.Error(401, 'you must be logged in!');
      }
      //console.log(Meteor.user().multichain_address);
      const mine = Promise.await(multichain.getAddressBalances({minconf: 0, address: Meteor.user().multichain_address}));
    //  console.log(mine);
      return mine;
    },
    issueNew(name) {
      console.log(Meteor.user());
      if(!Meteor.userId()) {
        throw new Meteor.Error(401, 'you must be logged in!');
      }
      const newAsset = Promise.await(multichain.issue({address: Meteor.user().multichain_address, asset: name, qty: 1, units: 1, details: {hello: "world"}}));
      return newAsset;
    },
    transact(assetName, user) {
      //console.log("User", user);
      user_object = Accounts.findUserByUsername(user);
      user_address=user_object.multichain_address;
      //console.log("User", user_address);
    //  console.log("Asset", assetName);
      multichain.sendAssetFrom({from: Meteor.user().multichain_address, to: user_address, asset: assetName, qty: 1}, (err, tx) => {
      //  console.log(tx);
      //  console.log(err);
      })
    },
    geoLocate(assetAddress) {
      const myLatLong = Promise.await(googleMapsClient.geocode({address: assetAddress}).asPromise());
      console.log(myLatLong.json.results[0].geometry.location);
      return myLatLong.json.results[0];
    },
  getAsset(asset) {
    const assetInfo = multichain.getAssetInfo({address: asset});
    return assetInfo;
  }
})
Meteor.startup(() => {
  // code to run on server at startup

});

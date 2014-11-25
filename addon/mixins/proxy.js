import Ember from 'ember';
// Ember < 1.8.0 doesn't have ProxyMixin
export default Ember._ProxyMixin || Ember.Mixin.create(Ember.ObjectProxy.prototype);
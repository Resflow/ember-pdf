import Ember from 'ember';

const { get, set, on } = Ember;

let ViewMixin = Ember.Mixin.create({
  isInDOM: false,
  setInDOM: on('didInsertElement', function () {
    set(this, 'isInDOM', true);
  }),

  scrollIntoViewIfNeeded: function (spot) {
    let element = get(this, 'element');
    let parent = element.offsetParent;

    switch (true) {
      // Is over top?
      case (element.offsetTop - parent.offsetTop < parent.scrollTop):
      // Is over bottom?
      case (element.offsetTop - parent.offsetTop + element.clientHeight) > (parent.scrollTop + parent.clientHeight):
      // Is over left?
      case (element.offsetLeft - parent.offsetLeft < parent.scrollLeft):
      // Is over right?
      case (element.offsetLeft - parent.offsetLeft + element.clientWidth) > (parent.scrollLeft + parent.clientWidth):
        this.scrollIntoView(spot);
    }
  },

  scrollIntoView: function (spot) {
    // Assuming offsetParent is available (it's not available when viewer is in
    // hidden iframe or object). We have to scroll: if the offsetParent is not set
    // producing the error. See also animationStartedClosure.
    let element = get(this, 'element');
    let parent = element.offsetParent;
    let offsetY = element.offsetTop + element.clientTop;
    let offsetX = element.offsetLeft + element.clientLeft;

    Ember.assert('offsetParent is not set -- cannot scroll', parent);

    while (parent.clientHeight === parent.scrollHeight) {
      offsetY += parent.offsetTop;
      offsetX += parent.offsetLeft;
      parent = parent.offsetParent;

      // If there's no more offsetParent, there's nothing to scroll
      if (!parent) {
        return;
      }
    }

    if (spot) {
      if (spot.top !== undefined) {
        offsetY += spot.top;
      }

      if (spot.left !== undefined) {
        offsetX += spot.left;
        parent.scrollLeft = offsetX;
      }
    }
    parent.scrollTop = offsetY;
  }
});

export default ViewMixin;

import { before, getScrollTop, getOffset, outerHeight, selfHeight } from '../lib/util';

const assign = require('es6-object-assign').assign;

const defaults = {
  container: 'body',
  condition: () => true,
  offsetTop: 0,
  breakpoint: 767
};

export default class ShadowScroll {
  constructor(ele, option) {
    this.opt = assign({}, defaults, option);
    this.scrollAmount = -this.opt.offsetTop;
    this.scrollOld = 0;
    this.containerElement = document.querySelector(this.opt.container);
    this.targetElement = document.querySelector(ele);
    this.targetWidth = this.targetElement.style.width;
    before(this.targetElement, '<div class="js-shadowscroll-before"></div>');
    this.beforeElement = this.targetElement.previousElementSibling;
    this.targetElement.parentElement.style.position = 'relative';
    window.addEventListener('scroll', () => {
      this.onScroll();
    });
    window.addEventListener('resize', () => {
      this.onScroll();
    });
  }

  applyStyle(style) {
    const target = this.targetElement;
    for (const key in style) {
      target.style[key] = style[key];
    }
  }

  onScroll() {
    const scroll = getScrollTop();
    const { beforeElement, containerElement, targetElement, targetWidth } = this;
    const { offsetTop, condition, breakpoint } = this.opt;
    const windowHeight = window.innerHeight;
    const windowWidth = window.innerWidth;
    const thisHeight = outerHeight(targetElement);
    const beforeBottom = getOffset(beforeElement).top;
    const containerHeight = outerHeight(containerElement);
    const containerOffset = getOffset(containerElement).top;
    const containerBottom = containerHeight + containerOffset;
    const limitHeight = windowHeight > thisHeight ? thisHeight : windowHeight;
    const offsetHeight = thisHeight - windowHeight;
    const style = {};

    if (!condition()) {
      this.applyStyle({
        position: 'static',
        width: targetWidth
      });
      return;
    }

    if (breakpoint >= windowWidth) {
      this.applyStyle({
        position: 'static',
        width: targetWidth
      });
      return;
    }

    // when side column is larger than container
    if (beforeElement.offsetTop + thisHeight >= selfHeight(containerElement)) {
      this.applyStyle({
        position: 'static',
        width: targetWidth
      });
      return;
    }

    if (beforeBottom + thisHeight > containerBottom) {
      this.applyStyle({
        position: 'static',
        width: targetWidth
      });
      return;
    }

    if (scroll < beforeBottom - offsetTop) {
      this.applyStyle({
        position: 'static',
        width: targetWidth
      });
      this.scrollOld = scroll;
      return;
    }
    style.width = `${beforeElement.offsetWidth}px`;
    if (scroll + limitHeight <= containerBottom) {
      this.scrollAmount += scroll - this.scrollOld;
      this.scrollOld = scroll;
      if (this.scrollAmount > offsetHeight) {
        this.scrollAmount = offsetHeight;
      } else if (this.scrollAmount < -offsetTop) {
        this.scrollAmount = -offsetTop;
      }
      if (this.scrollAmount === offsetHeight || this.scrollAmount === -offsetTop) {
        style.position = 'fixed';
        if (this.scrollAmount === -offsetTop || thisHeight < windowHeight) {
          style.top = `${offsetTop}px`;
        } else {
          style.top = `${windowHeight - thisHeight}px`;
        }
        style.left = `${getOffset(beforeElement).left}px`;
      } else {
        style.position = 'absolute';
        if (scroll - this.scrollAmount < beforeBottom) {
          style.top = `${beforeElement.offsetTop}px`;
        } else {
          style.top = `${scroll - this.scrollAmount - beforeBottom}px`;
        }
        style.left = `${beforeElement.offsetLeft}px`;
      }
    } else {
      style.position = 'absolute';
      style.top = `${containerHeight - thisHeight}px`;
      style.left = `${beforeElement.offsetLeft}px`;
    }
    this.applyStyle(style);
  }
}

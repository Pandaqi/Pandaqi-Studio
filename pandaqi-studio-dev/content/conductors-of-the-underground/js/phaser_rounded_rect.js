!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?module.exports=e():"function"==typeof define&&define.amd?define(e):(t="undefined"!=typeof globalThis?globalThis:t||self).rexroundrectangleplugin=e()}(this,function(){"use strict";function u(t){return(u="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t})(t)}function y(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function r(t,e){for(var i=0;i<e.length;i++){var r=e[i];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}function t(t,e,i){return e&&r(t.prototype,e),i&&r(t,i),t}function e(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function");t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,writable:!0,configurable:!0}}),e&&i(t,e)}function o(t){return(o=Object.setPrototypeOf?Object.getPrototypeOf:function(t){return t.__proto__||Object.getPrototypeOf(t)})(t)}function i(t,e){return(i=Object.setPrototypeOf||function(t,e){return t.__proto__=e,t})(t,e)}function s(t,e){if(e&&("object"==typeof e||"function"==typeof e))return e;if(void 0!==e)throw new TypeError("Derived constructors may only return object or undefined");return function(t){if(void 0===t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return t}(t)}function n(r){var n=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],function(){})),!0}catch(t){return!1}}();return function(){var t,e=o(r);if(n){var i=o(this).constructor;t=Reflect.construct(e,arguments,i)}else t=e.apply(this,arguments);return s(this,t)}}function p(t,e,i){var r=i.length;if(2<=r){var n=i[r-2],o=i[r-1];if(t===n&&e===o)return i}return i.push(t,e),i}function a(t,e,i,r,n,o,s,a,u){s&&n<o?o-=360:!s&&o<n&&(o+=360);var h=g(o-n)/a;n=g(n);for(var l=0;l<=a;l++){var c=n+h*l,f=t+i*Math.cos(c),d=e+r*Math.sin(c);p(f,d,u)}return u}var h=Phaser.Utils.Objects.GetValue,v=function(){function o(t,e,i,r,n){y(this,o),this.cornerRadius={},this._width=0,this._height=0,this.setTo(t,e,i,r,n)}return t(o,[{key:"setTo",value:function(t,e,i,r,n){return this.setPosition(t,e),this.setRadius(n),this.setSize(i,r),this}},{key:"setPosition",value:function(t,e){return void 0===t&&(t=0),void 0===e&&(e=t),this.x=t,this.y=e,this}},{key:"setRadius",value:function(t){var e,i;void 0===t&&(t=0),i="number"==typeof t?e=t:(e=h(t,"x",0),h(t,"y",0));var r=this.cornerRadius;return r.tl=l(h(t,"tl",void 0),e,i),r.tr=l(h(t,"tr",void 0),e,i),r.bl=l(h(t,"bl",void 0),e,i),r.br=l(h(t,"br",void 0),e,i),this}},{key:"setSize",value:function(t,e){return this.width=t,this.height=e,this}},{key:"minWidth",get:function(){var t=this.cornerRadius;return Math.max(t.tl.x+t.tr.x,t.bl.x+t.br.x)}},{key:"minHeight",get:function(){var t=this.cornerRadius;return Math.max(t.tl.y+t.bl.y,t.tr.y+t.br.y)}},{key:"width",get:function(){return this._width},set:function(t){null==t&&(t=0),this._width=Math.max(t,this.minWidth)}},{key:"height",get:function(){return this._height},set:function(t){null==t&&(t=0),this._height=Math.max(t,this.minHeight)}},{key:"radius",get:function(){var t=this.cornerRadius;return Math.max(t.tl.x,t.tl.y,t.tr.x,t.tr.y,t.bl.x,t.bl.y,t.br.x,t.br.y)}}]),o}(),l=function(t,e,i){return void 0===t?{x:e,y:i}:"number"==typeof t?{x:t,y:t}:t},g=Phaser.Math.DegToRad,O=Phaser.Renderer.WebGL.Utils,b=Phaser.Renderer.WebGL.Utils,c=Phaser.GameObjects.Components.TransformMatrix,m=new c,x=new c,R=new c,w={camera:m,sprite:x,calc:R},D=Phaser.Renderer.Canvas.SetTransform,f={renderWebGL:function(t,e,i,r){e.dirty&&(e.updateData(),e.dirty=!1),i.addToRenderList(e);var n,o,s,a,u,h,l=t.pipelines.set(e.pipeline),c=(n=e,o=i,s=r,a=m,h=R,(u=x).applyITRS(n.x,n.y,n.rotation,n.scaleX,n.scaleY),a.copyFrom(o.matrix),s?(a.multiplyWithOffset(s,-o.scrollX*n.scrollFactorX,-o.scrollY*n.scrollFactorY),u.e=n.x,u.f=n.y):(u.e-=o.scrollX*n.scrollFactorX,u.f-=o.scrollY*n.scrollFactorY),a.multiply(u,h),w),f=l.calcMatrix.copyFrom(c.calc),d=e._displayOriginX,y=e._displayOriginY,p=i.alpha*e.alpha;t.pipelines.preBatch(e),e.isFilled&&function(t,e,i,r,n,o){for(var s=O.getTintAppendFloatAlpha(i.fillColor,i.fillAlpha*r),a=i.pathData,u=i.pathIndexes,h=0;h<u.length;h+=3){var l=2*u[h],c=2*u[h+1],f=2*u[h+2],d=a[0+l]-n,y=a[1+l]-o,p=a[0+c]-n,v=a[1+c]-o,g=a[0+f]-n,b=a[1+f]-o,m=e.getX(d,y),x=e.getY(d,y),R=e.getX(p,v),w=e.getY(p,v),P=e.getX(g,b),k=e.getY(g,b);t.batchTri(i,m,x,R,w,P,k,0,0,1,1,s,s,s,2)}}(l,f,e,p,d,y),e.isStroked&&function(t,e,i,r,n){var o=t.strokeTint,s=b.getTintAppendFloatAlpha(e.strokeColor,e.strokeAlpha*i);o.TL=s,o.TR=s,o.BL=s,o.BR=s;var a=e.pathData,u=a.length-1,h=e.lineWidth,l=h/2,c=a[0]-r,f=a[1]-n;e.closePath||(u-=2);for(var d=2;d<u;d+=2){var y=a[d]-r,p=a[d+1]-n;t.batchLine(c,f,y,p,l,l,h,d-2,!!e.closePath&&d===u-1),c=y,f=p}}(l,e,p,d,y),t.pipelines.postBatch(e)},renderCanvas:function(t,e,i,r){e.dirty&&(e.updateData(),e.dirty=!1),i.addToRenderList(e);var n,o,s,a,u,h,l,c,f,d,y,p,v,g,b,m,x,R,w=t.currentContext;if(D(t,w,e,i,r)){var P=e._displayOriginX,k=e._displayOriginY,O=e.pathData,j=O.length-1,_=O[0]-P,T=O[1]-k;w.beginPath(),w.moveTo(_,T),e.closePath||(j-=2);for(var S=2;S<j;S+=2){var G=O[S]-P,A=O[S+1]-k;w.lineTo(G,A)}w.closePath(),e.isFilled&&(d=w,y=e,g=p||y.fillColor,b=v||y.fillAlpha,m=(16711680&g)>>>16,x=(65280&g)>>>8,R=255&g,d.fillStyle="rgba("+m+","+x+","+R+","+b+")",w.fill()),e.isStroked&&(n=w,o=e,u=s||o.strokeColor,h=a||o.strokeAlpha,l=(16711680&u)>>>16,c=(65280&u)>>>8,f=255&u,n.strokeStyle="rgba("+l+","+c+","+f+","+h+")",n.lineWidth=o.lineWidth,w.stroke()),w.restore()}}},P=Phaser.GameObjects.Shape,k=Phaser.Utils.Objects.GetValue,j=Phaser.Geom.Polygon.Earcut,d=function(){e(d,P);var f=n(d);function d(t,e,i,r,n,o,s,a){var u;y(this,d),void 0===e&&(e=0),void 0===i&&(i=0);var h=new v;u=f.call(this,t,"rexRoundRectangleShape",h);var l=k(o,"radius",o);h.setTo(0,0,r,n,l);var c=k(o,"iteration",void 0);return u.setIteration(c),u.setPosition(e,i),void 0!==s&&u.setFillStyle(s,a),u.updateDisplayOrigin(),u.dirty=!0,u}return t(d,[{key:"updateData",value:function(){var t=this.geom,e=this.pathData;e.length=0;var i,r=t.cornerRadius,n=this.iteration+1;if(i=r.br,_(i)){var o=t.width-i.x,s=t.height-i.y;a(o,s,i.x,i.y,0,90,!1,n,e)}else p(t.width,t.height,e);if(i=r.bl,_(i)){o=i.x,s=t.height-i.y;a(o,s,i.x,i.y,90,180,!1,n,e)}else p(0,t.height,e);if(i=r.tl,_(i)){o=i.x,s=i.y;a(o,s,i.x,i.y,180,270,!1,n,e)}else p(0,0,e);if(i=r.tr,_(i)){o=t.width-i.x,s=i.y;a(o,s,i.x,i.y,270,360,!1,n,e)}else p(t.width,0,e);return e.push(e[0],e[1]),this.pathIndexes=j(e),this}},{key:"width",get:function(){return this.geom.width},set:function(t){this.resize(t,this.height)}},{key:"height",get:function(){return this.geom.height},set:function(t){this.resize(this.width,t)}},{key:"resize",value:function(t,e){if(void 0===e&&(e=t),this.geom.width===t&&this.geom.height===e)return this;this.geom.height=e,this.geom.width=t,this.updateDisplayOrigin(),this.dirty=!0;var i=this.input;return i&&!i.customHitArea&&(i.hitArea.width=t,i.hitArea.height=e),this}},{key:"iteration",get:function(){return this._iteration},set:function(t){void 0!==this._iteration?this._iteration!==t&&(this._iteration=t,this.dirty=!0):this._iteration=t}},{key:"setIteration",value:function(t){return void 0===t&&(t=6),this.iteration=t,this}},{key:"radius",get:function(){return this.geom.radius},set:function(t){this.geom.setRadius(t),this.updateDisplayOrigin(),this.dirty=!0}},{key:"setRadius",value:function(t){return void 0===t&&(t=0),this.radius=t,this}},{key:"cornerRadius",get:function(){return this.geom.cornerRadius},set:function(t){this.radius=t}},{key:"setCornerRadius",value:function(t){return this.setRadius(t)}}]),d}(),_=function(t){return 0!==t.x&&0!==t.y};function T(t,e,i,r,n,o,s){var a=new d(this.scene,t,e,i,r,n,o,s);return this.scene.add.existing(a),a}Object.assign(d.prototype,f);var S=Phaser.Utils.Objects.GetAdvancedValue,G=Phaser.Utils.Objects.GetValue,A=Phaser.GameObjects.BuildGameObject;function C(t,e){void 0===t&&(t={}),void 0!==e&&(t.add=e);var i=S(t,"width",void 0),r=S(t,"height",i),n=G(t,"radius",void 0),o=S(t,"fillColor",void 0),s=S(t,"fillAlpha",void 0),a=new d(this.scene,0,0,i,r,n,o,s);return A(this.scene,a,t),a}function F(t){return null==t||""===t||0===t.length}var M=function(){e(r,Phaser.Plugins.BasePlugin);var i=n(r);function r(t){var e;return y(this,r),e=i.call(this,t),t.registerGameObject("rexRoundRectangle",T,C),e}return t(r,[{key:"start",value:function(){this.game.events.on("destroy",this.destroy,this)}}]),r}();return function(t,e,i){if("object"===u(t)){if(F(e)){if(null==i)return;"object"===u(i)&&(t=i)}else{"string"==typeof e&&(e=e.split("."));var r=e.pop();(function(t,e,i){var r=t;if(!F(e)){var n;"string"==typeof e&&(e=e.split("."));for(var o=0,s=e.length;o<s;o++){var a;if(null==r[n=e[o]]||"object"!==u(r[n]))a=o!==s-1||void 0===i?{}:i,r[n]=a;r=r[n]}}return r})(t,e)[r]=i}}}(window,"RexPlugins.GameObjects.RoundRectangle",d),M});
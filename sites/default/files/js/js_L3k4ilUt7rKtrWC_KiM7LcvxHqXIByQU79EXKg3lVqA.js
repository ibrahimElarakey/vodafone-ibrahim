/**
 * @file
 * Attaches behaviors for the Chosen module.
 */

(function($, Drupal, drupalSettings) {
  'use strict';

  // Temporal workaround while  https://github.com/harvesthq/chosen/issues/515
  // is fixed. This fix was taken from:
  // https://github.com/harvesthq/chosen/issues/515#issuecomment-104602031
  $.fn.oldChosen = $.fn.chosen;
  $.fn.chosen = function(options) {
    var select = $(this)
      , is_creating_chosen = !!options;

    if (is_creating_chosen && select.css('position') === 'absolute') {
      // if we are creating a chosen and the select already has the appropriate styles added
      // we remove those (so that the select hasn't got a crazy width), then create the chosen
      // then we re-add them later
      select.removeAttr('style');
    }

    var ret = select.oldChosen(options);

    // only act if the select has display: none, otherwise chosen is unsupported (iPhone, etc)
    if (is_creating_chosen && select.css('display') === 'none') {
      // https://github.com/harvesthq/chosen/issues/515#issuecomment-33214050
      // only do this if we are initializing chosen (no params, or object params) not calling a method
      select.attr('style','display:visible; position:absolute; width:0px; height: 0px; clip:rect(0,0,0,0)');
      select.attr('tabindex', -1);
    }
    return ret;
  };

  // Update Chosen elements when state has changed.
  $(document).on('state:disabled', 'select', function (e) {
    $(e.target).trigger('chosen:updated');
  });

  Drupal.behaviors.chosen = {

    settings: {

      /**
       * Completely ignores elements that match one of these selectors.
       *
       * Disabled on:
       * - Field UI
       * - WYSIWYG elements
       * - Tabledrag weights
       * - Elements that have opted-out of Chosen
       * - Elements already processed by Chosen.
       *
       * @type {string}
       */
      ignoreSelector: '#field-ui-field-storage-add-form select, #entity-form-display-edit-form select, #entity-view-display-edit-form select, .wysiwyg, .draggable select[name$="[weight]"], .draggable select[name$="[position]"], .locale-translate-filter-form select, .chosen-disable, .chosen-processed',

      /**
       * Explicit "opt-in" selector.
       *
       * @type {string}
       */
      optedInSelector: 'select.chosen-enable',

      /**
       * The default selector, overridden by drupalSettings.
       *
       * @type {string}
       */
      selector: 'select:visible'
    },

    /**
     * Drupal attach behavior.
     */
    attach: function(context, settings) {
      this.settings = this.getSettings(settings);
      this.getElements(context).once('chosen').each(function (i, element) {
        this.createChosen(element);
      }.bind(this));
    },

    /**
     * Creates a Chosen instance for a specific element.
     *
     * @param {jQuery|HTMLElement} element
     *   The element.
     */
    createChosen: function(element) {
      var $element = $(element);
      $element.chosen(this.getElementOptions($element));
    },

    /**
     * Filter out elements that should not be converted into Chosen.
     *
     * @param {jQuery|HTMLElement} element
     *   The element.
     *
     * @return {boolean}
     *   TRUE if the element should stay, FALSE otherwise.
     */
    filterElements: function (element) {
      var $element = $(element);

      // Remove elements that should be ignored completely.
      if ($element.is(this.settings.ignoreSelector)) {
        return false;
      }

      // Zero value means no minimum.
      var minOptions = $element.attr('multiple') ? this.settings.minimum_multiple : this.settings.minimum_single;
      return !minOptions || $element.find('option').length >= minOptions;
    },

    /**
     * Retrieves the elements that should be converted into Chosen instances.
     *
     * @param {jQuery|Element} context
     *   A DOM Element, Document, or jQuery object to use as context.
     * @param {string} [selector]
     *   A selector to use, defaults to the default selector in the settings.
     */
    getElements: function (context, selector) {
      var $context = $(context || document);
      var $elements = $context.find(selector || this.settings.selector);

      // Remove elements that should not be converted into Chosen.
      $elements = $elements.filter(function(i, element) {
        return this.filterElements(element);
      }.bind(this));

      // Add elements that have explicitly opted in to Chosen.
      $elements = $elements.add($context.find(this.settings.optedInSelector));

      return $elements;
    },

    /**
     * Retrieves options used to create a Chosen instance based on an element.
     *
     * @param {jQuery|HTMLElement} element
     *   The element to process.
     *
     * @return {Object}
     *   The options object used to instantiate a Chosen instance with.
     */
    getElementOptions: function (element) {
      var $element = $(element);
      var options = $.extend({}, this.settings.options);

      // The width default option is considered the minimum width, so this
      // must be evaluated for every option.
      if (this.settings.minimum_width > 0) {
        var dimension = this.settings.use_relative_width ? '%' : 'px';

        if ($element.width() < this.settings.minimum_width) {
          options.width = this.settings.minimum_width + dimension;
        }
        else {
          options.width = $element.width() + dimension;
        }
      }

      // Some field widgets have cardinality, so we must respect that.
      // @see chosen_pre_render_select()
      var cardinality;
      if ($element.attr('multiple') && (cardinality = $element.data('cardinality'))) {
        options.max_selected_options = cardinality;
      }

      return options;
    },

    /**
     * Retrieves the settings passed from Drupal.
     *
     * @param {Object} [settings]
     *   Passed Drupal settings object, if any.
     */
    getSettings: function (settings) {
      return $.extend(true, {}, this.settings, settings && settings.chosen || drupalSettings.chosen);
    }

};

})(jQuery, Drupal, drupalSettings);
;
/*!
 * jQuery Form Plugin
 * version: 4.2.2
 * Requires jQuery v1.7.2 or later
 * Project repository: https://github.com/jquery-form/form

 * Copyright 2017 Kevin Morris
 * Copyright 2006 M. Alsup

 * Dual licensed under the LGPL-2.1+ or MIT licenses
 * https://github.com/jquery-form/form#license

 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 */
!function(e){"function"==typeof define&&define.amd?define(["jquery"],e):"object"==typeof module&&module.exports?module.exports=function(t,r){return void 0===r&&(r="undefined"!=typeof window?require("jquery"):require("jquery")(t)),e(r),r}:e(jQuery)}(function(e){"use strict";function t(t){var r=t.data;t.isDefaultPrevented()||(t.preventDefault(),e(t.target).closest("form").ajaxSubmit(r))}function r(t){var r=t.target,a=e(r);if(!a.is("[type=submit],[type=image]")){var n=a.closest("[type=submit]");if(0===n.length)return;r=n[0]}var i=r.form;if(i.clk=r,"image"===r.type)if(void 0!==t.offsetX)i.clk_x=t.offsetX,i.clk_y=t.offsetY;else if("function"==typeof e.fn.offset){var o=a.offset();i.clk_x=t.pageX-o.left,i.clk_y=t.pageY-o.top}else i.clk_x=t.pageX-r.offsetLeft,i.clk_y=t.pageY-r.offsetTop;setTimeout(function(){i.clk=i.clk_x=i.clk_y=null},100)}function a(){if(e.fn.ajaxSubmit.debug){var t="[jquery.form] "+Array.prototype.join.call(arguments,"");window.console&&window.console.log?window.console.log(t):window.opera&&window.opera.postError&&window.opera.postError(t)}}var n=/\r?\n/g,i={};i.fileapi=void 0!==e('<input type="file">').get(0).files,i.formdata=void 0!==window.FormData;var o=!!e.fn.prop;e.fn.attr2=function(){if(!o)return this.attr.apply(this,arguments);var e=this.prop.apply(this,arguments);return e&&e.jquery||"string"==typeof e?e:this.attr.apply(this,arguments)},e.fn.ajaxSubmit=function(t,r,n,s){function u(r){var a,n,i=e.param(r,t.traditional).split("&"),o=i.length,s=[];for(a=0;a<o;a++)i[a]=i[a].replace(/\+/g," "),n=i[a].split("="),s.push([decodeURIComponent(n[0]),decodeURIComponent(n[1])]);return s}function c(r){function n(e){var t=null;try{e.contentWindow&&(t=e.contentWindow.document)}catch(e){a("cannot get iframe.contentWindow document: "+e)}if(t)return t;try{t=e.contentDocument?e.contentDocument:e.document}catch(r){a("cannot get iframe.contentDocument: "+r),t=e.document}return t}function i(){function t(){try{var e=n(v).readyState;a("state = "+e),e&&"uninitialized"===e.toLowerCase()&&setTimeout(t,50)}catch(e){a("Server abort: ",e," (",e.name,")"),s(L),j&&clearTimeout(j),j=void 0}}var r=p.attr2("target"),i=p.attr2("action"),o=p.attr("enctype")||p.attr("encoding")||"multipart/form-data";w.setAttribute("target",m),l&&!/post/i.test(l)||w.setAttribute("method","POST"),i!==f.url&&w.setAttribute("action",f.url),f.skipEncodingOverride||l&&!/post/i.test(l)||p.attr({encoding:"multipart/form-data",enctype:"multipart/form-data"}),f.timeout&&(j=setTimeout(function(){T=!0,s(A)},f.timeout));var u=[];try{if(f.extraData)for(var c in f.extraData)f.extraData.hasOwnProperty(c)&&(e.isPlainObject(f.extraData[c])&&f.extraData[c].hasOwnProperty("name")&&f.extraData[c].hasOwnProperty("value")?u.push(e('<input type="hidden" name="'+f.extraData[c].name+'">',k).val(f.extraData[c].value).appendTo(w)[0]):u.push(e('<input type="hidden" name="'+c+'">',k).val(f.extraData[c]).appendTo(w)[0]));f.iframeTarget||h.appendTo(D),v.attachEvent?v.attachEvent("onload",s):v.addEventListener("load",s,!1),setTimeout(t,15);try{w.submit()}catch(e){document.createElement("form").submit.apply(w)}}finally{w.setAttribute("action",i),w.setAttribute("enctype",o),r?w.setAttribute("target",r):p.removeAttr("target"),e(u).remove()}}function s(t){if(!x.aborted&&!X){if((O=n(v))||(a("cannot access response document"),t=L),t===A&&x)return x.abort("timeout"),void S.reject(x,"timeout");if(t===L&&x)return x.abort("server abort"),void S.reject(x,"error","server abort");if(O&&O.location.href!==f.iframeSrc||T){v.detachEvent?v.detachEvent("onload",s):v.removeEventListener("load",s,!1);var r,i="success";try{if(T)throw"timeout";var o="xml"===f.dataType||O.XMLDocument||e.isXMLDoc(O);if(a("isXml="+o),!o&&window.opera&&(null===O.body||!O.body.innerHTML)&&--C)return a("requeing onLoad callback, DOM not available"),void setTimeout(s,250);var u=O.body?O.body:O.documentElement;x.responseText=u?u.innerHTML:null,x.responseXML=O.XMLDocument?O.XMLDocument:O,o&&(f.dataType="xml"),x.getResponseHeader=function(e){return{"content-type":f.dataType}[e.toLowerCase()]},u&&(x.status=Number(u.getAttribute("status"))||x.status,x.statusText=u.getAttribute("statusText")||x.statusText);var c=(f.dataType||"").toLowerCase(),l=/(json|script|text)/.test(c);if(l||f.textarea){var p=O.getElementsByTagName("textarea")[0];if(p)x.responseText=p.value,x.status=Number(p.getAttribute("status"))||x.status,x.statusText=p.getAttribute("statusText")||x.statusText;else if(l){var m=O.getElementsByTagName("pre")[0],g=O.getElementsByTagName("body")[0];m?x.responseText=m.textContent?m.textContent:m.innerText:g&&(x.responseText=g.textContent?g.textContent:g.innerText)}}else"xml"===c&&!x.responseXML&&x.responseText&&(x.responseXML=q(x.responseText));try{M=N(x,c,f)}catch(e){i="parsererror",x.error=r=e||i}}catch(e){a("error caught: ",e),i="error",x.error=r=e||i}x.aborted&&(a("upload aborted"),i=null),x.status&&(i=x.status>=200&&x.status<300||304===x.status?"success":"error"),"success"===i?(f.success&&f.success.call(f.context,M,"success",x),S.resolve(x.responseText,"success",x),d&&e.event.trigger("ajaxSuccess",[x,f])):i&&(void 0===r&&(r=x.statusText),f.error&&f.error.call(f.context,x,i,r),S.reject(x,"error",r),d&&e.event.trigger("ajaxError",[x,f,r])),d&&e.event.trigger("ajaxComplete",[x,f]),d&&!--e.active&&e.event.trigger("ajaxStop"),f.complete&&f.complete.call(f.context,x,i),X=!0,f.timeout&&clearTimeout(j),setTimeout(function(){f.iframeTarget?h.attr("src",f.iframeSrc):h.remove(),x.responseXML=null},100)}}}var u,c,f,d,m,h,v,x,y,b,T,j,w=p[0],S=e.Deferred();if(S.abort=function(e){x.abort(e)},r)for(c=0;c<g.length;c++)u=e(g[c]),o?u.prop("disabled",!1):u.removeAttr("disabled");(f=e.extend(!0,{},e.ajaxSettings,t)).context=f.context||f,m="jqFormIO"+(new Date).getTime();var k=w.ownerDocument,D=p.closest("body");if(f.iframeTarget?(b=(h=e(f.iframeTarget,k)).attr2("name"))?m=b:h.attr2("name",m):(h=e('<iframe name="'+m+'" src="'+f.iframeSrc+'" />',k)).css({position:"absolute",top:"-1000px",left:"-1000px"}),v=h[0],x={aborted:0,responseText:null,responseXML:null,status:0,statusText:"n/a",getAllResponseHeaders:function(){},getResponseHeader:function(){},setRequestHeader:function(){},abort:function(t){var r="timeout"===t?"timeout":"aborted";a("aborting upload... "+r),this.aborted=1;try{v.contentWindow.document.execCommand&&v.contentWindow.document.execCommand("Stop")}catch(e){}h.attr("src",f.iframeSrc),x.error=r,f.error&&f.error.call(f.context,x,r,t),d&&e.event.trigger("ajaxError",[x,f,r]),f.complete&&f.complete.call(f.context,x,r)}},(d=f.global)&&0==e.active++&&e.event.trigger("ajaxStart"),d&&e.event.trigger("ajaxSend",[x,f]),f.beforeSend&&!1===f.beforeSend.call(f.context,x,f))return f.global&&e.active--,S.reject(),S;if(x.aborted)return S.reject(),S;(y=w.clk)&&(b=y.name)&&!y.disabled&&(f.extraData=f.extraData||{},f.extraData[b]=y.value,"image"===y.type&&(f.extraData[b+".x"]=w.clk_x,f.extraData[b+".y"]=w.clk_y));var A=1,L=2,F=e("meta[name=csrf-token]").attr("content"),E=e("meta[name=csrf-param]").attr("content");E&&F&&(f.extraData=f.extraData||{},f.extraData[E]=F),f.forceSync?i():setTimeout(i,10);var M,O,X,C=50,q=e.parseXML||function(e,t){return window.ActiveXObject?((t=new ActiveXObject("Microsoft.XMLDOM")).async="false",t.loadXML(e)):t=(new DOMParser).parseFromString(e,"text/xml"),t&&t.documentElement&&"parsererror"!==t.documentElement.nodeName?t:null},_=e.parseJSON||function(e){return window.eval("("+e+")")},N=function(t,r,a){var n=t.getResponseHeader("content-type")||"",i=("xml"===r||!r)&&n.indexOf("xml")>=0,o=i?t.responseXML:t.responseText;return i&&"parsererror"===o.documentElement.nodeName&&e.error&&e.error("parsererror"),a&&a.dataFilter&&(o=a.dataFilter(o,r)),"string"==typeof o&&(("json"===r||!r)&&n.indexOf("json")>=0?o=_(o):("script"===r||!r)&&n.indexOf("javascript")>=0&&e.globalEval(o)),o};return S}if(!this.length)return a("ajaxSubmit: skipping submit process - no element selected"),this;var l,f,d,p=this;"function"==typeof t?t={success:t}:"string"==typeof t||!1===t&&arguments.length>0?(t={url:t,data:r,dataType:n},"function"==typeof s&&(t.success=s)):void 0===t&&(t={}),l=t.method||t.type||this.attr2("method"),(d=(d="string"==typeof(f=t.url||this.attr2("action"))?e.trim(f):"")||window.location.href||"")&&(d=(d.match(/^([^#]+)/)||[])[1]),t=e.extend(!0,{url:d,success:e.ajaxSettings.success,type:l||e.ajaxSettings.type,iframeSrc:/^https/i.test(window.location.href||"")?"javascript:false":"about:blank"},t);var m={};if(this.trigger("form-pre-serialize",[this,t,m]),m.veto)return a("ajaxSubmit: submit vetoed via form-pre-serialize trigger"),this;if(t.beforeSerialize&&!1===t.beforeSerialize(this,t))return a("ajaxSubmit: submit aborted via beforeSerialize callback"),this;var h=t.traditional;void 0===h&&(h=e.ajaxSettings.traditional);var v,g=[],x=this.formToArray(t.semantic,g,t.filtering);if(t.data){var y=e.isFunction(t.data)?t.data(x):t.data;t.extraData=y,v=e.param(y,h)}if(t.beforeSubmit&&!1===t.beforeSubmit(x,this,t))return a("ajaxSubmit: submit aborted via beforeSubmit callback"),this;if(this.trigger("form-submit-validate",[x,this,t,m]),m.veto)return a("ajaxSubmit: submit vetoed via form-submit-validate trigger"),this;var b=e.param(x,h);v&&(b=b?b+"&"+v:v),"GET"===t.type.toUpperCase()?(t.url+=(t.url.indexOf("?")>=0?"&":"?")+b,t.data=null):t.data=b;var T=[];if(t.resetForm&&T.push(function(){p.resetForm()}),t.clearForm&&T.push(function(){p.clearForm(t.includeHidden)}),!t.dataType&&t.target){var j=t.success||function(){};T.push(function(r,a,n){var i=arguments,o=t.replaceTarget?"replaceWith":"html";e(t.target)[o](r).each(function(){j.apply(this,i)})})}else t.success&&(e.isArray(t.success)?e.merge(T,t.success):T.push(t.success));if(t.success=function(e,r,a){for(var n=t.context||this,i=0,o=T.length;i<o;i++)T[i].apply(n,[e,r,a||p,p])},t.error){var w=t.error;t.error=function(e,r,a){var n=t.context||this;w.apply(n,[e,r,a,p])}}if(t.complete){var S=t.complete;t.complete=function(e,r){var a=t.context||this;S.apply(a,[e,r,p])}}var k=e("input[type=file]:enabled",this).filter(function(){return""!==e(this).val()}).length>0,D="multipart/form-data",A=p.attr("enctype")===D||p.attr("encoding")===D,L=i.fileapi&&i.formdata;a("fileAPI :"+L);var F,E=(k||A)&&!L;!1!==t.iframe&&(t.iframe||E)?t.closeKeepAlive?e.get(t.closeKeepAlive,function(){F=c(x)}):F=c(x):F=(k||A)&&L?function(r){for(var a=new FormData,n=0;n<r.length;n++)a.append(r[n].name,r[n].value);if(t.extraData){var i=u(t.extraData);for(n=0;n<i.length;n++)i[n]&&a.append(i[n][0],i[n][1])}t.data=null;var o=e.extend(!0,{},e.ajaxSettings,t,{contentType:!1,processData:!1,cache:!1,type:l||"POST"});t.uploadProgress&&(o.xhr=function(){var r=e.ajaxSettings.xhr();return r.upload&&r.upload.addEventListener("progress",function(e){var r=0,a=e.loaded||e.position,n=e.total;e.lengthComputable&&(r=Math.ceil(a/n*100)),t.uploadProgress(e,a,n,r)},!1),r}),o.data=null;var s=o.beforeSend;return o.beforeSend=function(e,r){t.formData?r.data=t.formData:r.data=a,s&&s.call(this,e,r)},e.ajax(o)}(x):e.ajax(t),p.removeData("jqxhr").data("jqxhr",F);for(var M=0;M<g.length;M++)g[M]=null;return this.trigger("form-submit-notify",[this,t]),this},e.fn.ajaxForm=function(n,i,o,s){if(("string"==typeof n||!1===n&&arguments.length>0)&&(n={url:n,data:i,dataType:o},"function"==typeof s&&(n.success=s)),n=n||{},n.delegation=n.delegation&&e.isFunction(e.fn.on),!n.delegation&&0===this.length){var u={s:this.selector,c:this.context};return!e.isReady&&u.s?(a("DOM not ready, queuing ajaxForm"),e(function(){e(u.s,u.c).ajaxForm(n)}),this):(a("terminating; zero elements found by selector"+(e.isReady?"":" (DOM not ready)")),this)}return n.delegation?(e(document).off("submit.form-plugin",this.selector,t).off("click.form-plugin",this.selector,r).on("submit.form-plugin",this.selector,n,t).on("click.form-plugin",this.selector,n,r),this):this.ajaxFormUnbind().on("submit.form-plugin",n,t).on("click.form-plugin",n,r)},e.fn.ajaxFormUnbind=function(){return this.off("submit.form-plugin click.form-plugin")},e.fn.formToArray=function(t,r,a){var n=[];if(0===this.length)return n;var o,s=this[0],u=this.attr("id"),c=t||void 0===s.elements?s.getElementsByTagName("*"):s.elements;if(c&&(c=e.makeArray(c)),u&&(t||/(Edge|Trident)\//.test(navigator.userAgent))&&(o=e(':input[form="'+u+'"]').get()).length&&(c=(c||[]).concat(o)),!c||!c.length)return n;e.isFunction(a)&&(c=e.map(c,a));var l,f,d,p,m,h,v;for(l=0,h=c.length;l<h;l++)if(m=c[l],(d=m.name)&&!m.disabled)if(t&&s.clk&&"image"===m.type)s.clk===m&&(n.push({name:d,value:e(m).val(),type:m.type}),n.push({name:d+".x",value:s.clk_x},{name:d+".y",value:s.clk_y}));else if((p=e.fieldValue(m,!0))&&p.constructor===Array)for(r&&r.push(m),f=0,v=p.length;f<v;f++)n.push({name:d,value:p[f]});else if(i.fileapi&&"file"===m.type){r&&r.push(m);var g=m.files;if(g.length)for(f=0;f<g.length;f++)n.push({name:d,value:g[f],type:m.type});else n.push({name:d,value:"",type:m.type})}else null!==p&&void 0!==p&&(r&&r.push(m),n.push({name:d,value:p,type:m.type,required:m.required}));if(!t&&s.clk){var x=e(s.clk),y=x[0];(d=y.name)&&!y.disabled&&"image"===y.type&&(n.push({name:d,value:x.val()}),n.push({name:d+".x",value:s.clk_x},{name:d+".y",value:s.clk_y}))}return n},e.fn.formSerialize=function(t){return e.param(this.formToArray(t))},e.fn.fieldSerialize=function(t){var r=[];return this.each(function(){var a=this.name;if(a){var n=e.fieldValue(this,t);if(n&&n.constructor===Array)for(var i=0,o=n.length;i<o;i++)r.push({name:a,value:n[i]});else null!==n&&void 0!==n&&r.push({name:this.name,value:n})}}),e.param(r)},e.fn.fieldValue=function(t){for(var r=[],a=0,n=this.length;a<n;a++){var i=this[a],o=e.fieldValue(i,t);null===o||void 0===o||o.constructor===Array&&!o.length||(o.constructor===Array?e.merge(r,o):r.push(o))}return r},e.fieldValue=function(t,r){var a=t.name,i=t.type,o=t.tagName.toLowerCase();if(void 0===r&&(r=!0),r&&(!a||t.disabled||"reset"===i||"button"===i||("checkbox"===i||"radio"===i)&&!t.checked||("submit"===i||"image"===i)&&t.form&&t.form.clk!==t||"select"===o&&-1===t.selectedIndex))return null;if("select"===o){var s=t.selectedIndex;if(s<0)return null;for(var u=[],c=t.options,l="select-one"===i,f=l?s+1:c.length,d=l?s:0;d<f;d++){var p=c[d];if(p.selected&&!p.disabled){var m=p.value;if(m||(m=p.attributes&&p.attributes.value&&!p.attributes.value.specified?p.text:p.value),l)return m;u.push(m)}}return u}return e(t).val().replace(n,"\r\n")},e.fn.clearForm=function(t){return this.each(function(){e("input,select,textarea",this).clearFields(t)})},e.fn.clearFields=e.fn.clearInputs=function(t){var r=/^(?:color|date|datetime|email|month|number|password|range|search|tel|text|time|url|week)$/i;return this.each(function(){var a=this.type,n=this.tagName.toLowerCase();r.test(a)||"textarea"===n?this.value="":"checkbox"===a||"radio"===a?this.checked=!1:"select"===n?this.selectedIndex=-1:"file"===a?/MSIE/.test(navigator.userAgent)?e(this).replaceWith(e(this).clone(!0)):e(this).val(""):t&&(!0===t&&/hidden/.test(a)||"string"==typeof t&&e(this).is(t))&&(this.value="")})},e.fn.resetForm=function(){return this.each(function(){var t=e(this),r=this.tagName.toLowerCase();switch(r){case"input":this.checked=this.defaultChecked;case"textarea":return this.value=this.defaultValue,!0;case"option":case"optgroup":var a=t.parents("select");return a.length&&a[0].multiple?"option"===r?this.selected=this.defaultSelected:t.find("option").resetForm():a.resetForm(),!0;case"select":return t.find("option").each(function(e){if(this.selected=this.defaultSelected,this.defaultSelected&&!t[0].multiple)return t[0].selectedIndex=e,!1}),!0;case"label":var n=e(t.attr("for")),i=t.find("input,select,textarea");return n[0]&&i.unshift(n[0]),i.resetForm(),!0;case"form":return("function"==typeof this.reset||"object"==typeof this.reset&&!this.reset.nodeType)&&this.reset(),!0;default:return t.find("form,input,label,select,textarea").resetForm(),!0}})},e.fn.enable=function(e){return void 0===e&&(e=!0),this.each(function(){this.disabled=!e})},e.fn.selected=function(t){return void 0===t&&(t=!0),this.each(function(){var r=this.type;if("checkbox"===r||"radio"===r)this.checked=t;else if("option"===this.tagName.toLowerCase()){var a=e(this).parent("select");t&&a[0]&&"select-one"===a[0].type&&a.find("option").selected(!1),this.selected=t}})},e.fn.ajaxSubmit.debug=!1});

;
/**
* DO NOT EDIT THIS FILE.
* See the following change record for more information,
* https://www.drupal.org/node/2815083
* @preserve
**/

(function ($, Drupal) {
  var states = {
    postponed: []
  };

  Drupal.states = states;

  function invert(a, invertState) {
    return invertState && typeof a !== 'undefined' ? !a : a;
  }

  function _compare2(a, b) {
    if (a === b) {
      return typeof a === 'undefined' ? a : true;
    }

    return typeof a === 'undefined' || typeof b === 'undefined';
  }

  function ternary(a, b) {
    if (typeof a === 'undefined') {
      return b;
    }
    if (typeof b === 'undefined') {
      return a;
    }

    return a && b;
  }

  Drupal.behaviors.states = {
    attach: function attach(context, settings) {
      var $states = $(context).find('[data-drupal-states]');
      var il = $states.length;

      var _loop = function _loop(i) {
        var config = JSON.parse($states[i].getAttribute('data-drupal-states'));
        Object.keys(config || {}).forEach(function (state) {
          new states.Dependent({
            element: $($states[i]),
            state: states.State.sanitize(state),
            constraints: config[state]
          });
        });
      };

      for (var i = 0; i < il; i++) {
        _loop(i);
      }

      while (states.postponed.length) {
        states.postponed.shift()();
      }
    }
  };

  states.Dependent = function (args) {
    var _this = this;

    $.extend(this, { values: {}, oldValue: null }, args);

    this.dependees = this.getDependees();
    Object.keys(this.dependees || {}).forEach(function (selector) {
      _this.initializeDependee(selector, _this.dependees[selector]);
    });
  };

  states.Dependent.comparisons = {
    RegExp: function RegExp(reference, value) {
      return reference.test(value);
    },
    Function: function Function(reference, value) {
      return reference(value);
    },
    Number: function Number(reference, value) {
      return typeof value === 'string' ? _compare2(reference.toString(), value) : _compare2(reference, value);
    }
  };

  states.Dependent.prototype = {
    initializeDependee: function initializeDependee(selector, dependeeStates) {
      var _this2 = this;

      this.values[selector] = {};

      Object.keys(dependeeStates).forEach(function (i) {
        var state = dependeeStates[i];

        if ($.inArray(state, dependeeStates) === -1) {
          return;
        }

        state = states.State.sanitize(state);

        _this2.values[selector][state.name] = null;

        $(selector).on('state:' + state, { selector: selector, state: state }, function (e) {
          _this2.update(e.data.selector, e.data.state, e.value);
        });

        new states.Trigger({ selector: selector, state: state });
      });
    },
    compare: function compare(reference, selector, state) {
      var value = this.values[selector][state.name];
      if (reference.constructor.name in states.Dependent.comparisons) {
        return states.Dependent.comparisons[reference.constructor.name](reference, value);
      }

      return _compare2(reference, value);
    },
    update: function update(selector, state, value) {
      if (value !== this.values[selector][state.name]) {
        this.values[selector][state.name] = value;
        this.reevaluate();
      }
    },
    reevaluate: function reevaluate() {
      var value = this.verifyConstraints(this.constraints);

      if (value !== this.oldValue) {
        this.oldValue = value;

        value = invert(value, this.state.invert);

        this.element.trigger({
          type: 'state:' + this.state,
          value: value,
          trigger: true
        });
      }
    },
    verifyConstraints: function verifyConstraints(constraints, selector) {
      var result = void 0;
      if ($.isArray(constraints)) {
        var hasXor = $.inArray('xor', constraints) === -1;
        var len = constraints.length;
        for (var i = 0; i < len; i++) {
          if (constraints[i] !== 'xor') {
            var constraint = this.checkConstraints(constraints[i], selector, i);

            if (constraint && (hasXor || result)) {
              return hasXor;
            }
            result = result || constraint;
          }
        }
      } else if ($.isPlainObject(constraints)) {
          for (var n in constraints) {
            if (constraints.hasOwnProperty(n)) {
              result = ternary(result, this.checkConstraints(constraints[n], selector, n));

              if (result === false) {
                return false;
              }
            }
          }
        }
      return result;
    },
    checkConstraints: function checkConstraints(value, selector, state) {
      if (typeof state !== 'string' || /[0-9]/.test(state[0])) {
        state = null;
      } else if (typeof selector === 'undefined') {
        selector = state;
        state = null;
      }

      if (state !== null) {
        state = states.State.sanitize(state);
        return invert(this.compare(value, selector, state), state.invert);
      }

      return this.verifyConstraints(value, selector);
    },
    getDependees: function getDependees() {
      var cache = {};

      var _compare = this.compare;
      this.compare = function (reference, selector, state) {
        (cache[selector] || (cache[selector] = [])).push(state.name);
      };

      this.verifyConstraints(this.constraints);

      this.compare = _compare;

      return cache;
    }
  };

  states.Trigger = function (args) {
    $.extend(this, args);

    if (this.state in states.Trigger.states) {
      this.element = $(this.selector);

      if (!this.element.data('trigger:' + this.state)) {
        this.initialize();
      }
    }
  };

  states.Trigger.prototype = {
    initialize: function initialize() {
      var _this3 = this;

      var trigger = states.Trigger.states[this.state];

      if (typeof trigger === 'function') {
        trigger.call(window, this.element);
      } else {
        Object.keys(trigger || {}).forEach(function (event) {
          _this3.defaultTrigger(event, trigger[event]);
        });
      }

      this.element.data('trigger:' + this.state, true);
    },
    defaultTrigger: function defaultTrigger(event, valueFn) {
      var oldValue = valueFn.call(this.element);

      this.element.on(event, $.proxy(function (e) {
        var value = valueFn.call(this.element, e);

        if (oldValue !== value) {
          this.element.trigger({
            type: 'state:' + this.state,
            value: value,
            oldValue: oldValue
          });
          oldValue = value;
        }
      }, this));

      states.postponed.push($.proxy(function () {
        this.element.trigger({
          type: 'state:' + this.state,
          value: oldValue,
          oldValue: null
        });
      }, this));
    }
  };

  states.Trigger.states = {
    empty: {
      keyup: function keyup() {
        return this.val() === '';
      }
    },

    checked: {
      change: function change() {
        var checked = false;
        this.each(function () {
          checked = $(this).prop('checked');

          return !checked;
        });
        return checked;
      }
    },

    value: {
      keyup: function keyup() {
        if (this.length > 1) {
          return this.filter(':checked').val() || false;
        }
        return this.val();
      },
      change: function change() {
        if (this.length > 1) {
          return this.filter(':checked').val() || false;
        }
        return this.val();
      }
    },

    collapsed: {
      collapsed: function collapsed(e) {
        return typeof e !== 'undefined' && 'value' in e ? e.value : !this.is('[open]');
      }
    }
  };

  states.State = function (state) {
    this.pristine = state;
    this.name = state;

    var process = true;
    do {
      while (this.name.charAt(0) === '!') {
        this.name = this.name.substring(1);
        this.invert = !this.invert;
      }

      if (this.name in states.State.aliases) {
        this.name = states.State.aliases[this.name];
      } else {
        process = false;
      }
    } while (process);
  };

  states.State.sanitize = function (state) {
    if (state instanceof states.State) {
      return state;
    }

    return new states.State(state);
  };

  states.State.aliases = {
    enabled: '!disabled',
    invisible: '!visible',
    invalid: '!valid',
    untouched: '!touched',
    optional: '!required',
    filled: '!empty',
    unchecked: '!checked',
    irrelevant: '!relevant',
    expanded: '!collapsed',
    open: '!collapsed',
    closed: 'collapsed',
    readwrite: '!readonly'
  };

  states.State.prototype = {
    invert: false,

    toString: function toString() {
      return this.name;
    }
  };

  var $document = $(document);
  $document.on('state:disabled', function (e) {
    if (e.trigger) {
      $(e.target).prop('disabled', e.value).closest('.js-form-item, .js-form-submit, .js-form-wrapper').toggleClass('form-disabled', e.value).find('select, input, textarea').prop('disabled', e.value);
    }
  });

  $document.on('state:required', function (e) {
    if (e.trigger) {
      if (e.value) {
        var label = 'label' + (e.target.id ? '[for=' + e.target.id + ']' : '');
        var $label = $(e.target).attr({ required: 'required', 'aria-required': 'true' }).closest('.js-form-item, .js-form-wrapper').find(label);

        if (!$label.hasClass('js-form-required').length) {
          $label.addClass('js-form-required form-required');
        }
      } else {
        $(e.target).removeAttr('required aria-required').closest('.js-form-item, .js-form-wrapper').find('label.js-form-required').removeClass('js-form-required form-required');
      }
    }
  });

  $document.on('state:visible', function (e) {
    if (e.trigger) {
      $(e.target).closest('.js-form-item, .js-form-submit, .js-form-wrapper').toggle(e.value);
    }
  });

  $document.on('state:checked', function (e) {
    if (e.trigger) {
      $(e.target).prop('checked', e.value);
    }
  });

  $document.on('state:collapsed', function (e) {
    if (e.trigger) {
      if ($(e.target).is('[open]') === e.value) {
        $(e.target).find('> summary').trigger('click');
      }
    }
  });
})(jQuery, Drupal);;
/**
 * @file
 * Javascript for the geolocation module.
 */

/**
 * @typedef {Object} GeolocationSettings
 *
 * @property {GeolocationMapSettings[]} maps
 * @property {Object} mapCenter
 */

/**
 * @type {GeolocationSettings} drupalSettings.geolocation
 */

/**
 * @typedef {Object} GeolocationMapSettings
 *
 * @property {String} [type] Map type
 * @property {String} id
 * @property {Object} settings
 * @property {Number} lat
 * @property {Number} lng
 * @property {Object[]} map_center
 * @property {jQuery} wrapper
 * @property {GeolocationMapMarker[]} mapMarkers
 */

/**
 * Callback when map is clicked.
 *
 * @callback GeolocationMapClickCallback
 *
 * @param {GeolocationCoordinates} location - Click location.
 */

/**
 * Callback when a marker is added or removed.
 *
 * @callback GeolocationMarkerCallback
 *
 * @param {GeolocationMapMarker} marker - Map marker.
 */

/**
 * Callback when map is right-clicked.
 *
 * @callback GeolocationMapContextClickCallback
 *
 * @param {GeolocationCoordinates} location - Click location.
 */

/**
 * Callback when map provider becomes available.
 *
 * @callback GeolocationMapInitializedCallback
 *
 * @param {GeolocationMapInterface} map - Geolocation map.
 */

/**
 * Callback when map fully loaded.
 *
 * @callback GeolocationMapPopulatedCallback
 *
 * @param {GeolocationMapInterface} map - Geolocation map.
 */

/**
 * @typedef {Object} GeolocationCoordinates

 * @property {Number} lat
 * @property {Number} lng
 */

/**
 * @typedef {Object} GeolocationMapMarker
 *
 * @property {GeolocationCoordinates} position
 * @property {string} title
 * @property {boolean} [setMarker]
 * @property {string} [icon]
 * @property {string} [label]
 * @property {jQuery} locationWrapper
 */

/**
 * Interface for classes that represent a color.
 *
 * @interface GeolocationMapInterface
 *
 * @property {Boolean} initialized - True when map provider available and initializedCallbacks executed.
 * @property {Boolean} loaded - True when map fully loaded and all loadCallbacks executed.
 * @property {String} id
 * @property {GeolocationMapSettings} settings
 * @property {Number} lat
 * @property {Number} lng
 * @property {Object[]} mapCenter
 * @property {jQuery} wrapper
 * @property {jQuery} container
 * @property {Object[]} mapMarkers
 *
 * @property {function({jQuery}):{jQuery}} addControl - Add control to map, identified by classes.
 * @property {function()} removeControls - Remove controls from map.
 *
 * @property {function()} populatedCallback - Executes {GeolocationMapPopulatedCallback[]} for this map.
 * @property {function({GeolocationMapPopulatedCallback})} addPopulatedCallback - Adds a callback that will be called when map is fully loaded.
 * @property {function()} initializedCallback - Executes {GeolocationMapInitializedCallbacks[]} for this map.
 * @property {function({GeolocationMapInitializedCallback})} addInitializedCallback - Adds a callback that will be called when map provider becomes available.
 * @property {function({GeolocationMapSettings})} update - Update existing map by settings.
 *
 * @property {function({GeolocationMapMarker}):{GeolocationMapMarker}} setMapMarker - Set marker on map.
 * @property {function({GeolocationMapMarker})} removeMapMarker - Remove single marker.
 * @property {function()} removeMapMarkers - Remove all markers from map.
 *s
 * @property {function({string})} setZoom - Set zoom.
 * @property {function():{GeolocationCoordinates}} getCenter - Get map center coordinates.
 * @property {function({string})} setCenter - Center map by plugin.
 * @property {function({GeolocationCoordinates}, {Number}?, {string}?)} setCenterByCoordinates - Center map on coordinates.
 * @property {function({GeolocationMapMarker[]}?, {String}?)} fitMapToMarkers - Fit map to markers.
 * @property {function({GeolocationMapMarker[]}?):{Object}} getMarkerBoundaries - Get marker boundaries.
 * @property {function({Object}, {String}?)} fitBoundaries - Fit map to bounds.
 *
 * @property {function({Event})} clickCallback - Executes {GeolocationMapClickCallbacks} for this map.
 * @property {function({GeolocationMapClickCallback})} addClickCallback - Adds a callback that will be called when map is clicked.
 *
 * @property {function({Event})} doubleClickCallback - Executes {GeolocationMapClickCallbacks} for this map.
 * @property {function({GeolocationMapClickCallback})} addDoubleClickCallback - Adds a callback that will be called on double click.
 *
 * @property {function({Event})} contextClickCallback - Executes {GeolocationMapContextClickCallbacks} for this map.
 * @property {function({GeolocationMapContextClickCallback})} addContextClickCallback - Adds a callback that will be called when map is clicked.
 *
 * @property {function({GeolocationMapMarker})} markerAddedCallback - Executes {GeolocationMarkerCallback} for this map.
 * @property {function({GeolocationMarkerCallback})} addMarkerAddedCallback - Adds a callback that will be called on marker(s) being added.
 *
 * @property {function({GeolocationMapMarker})} markerRemoveCallback - Executes {GeolocationMarkerCallback} for this map.
 * @property {function({GeolocationMarkerCallback})} addMarkerRemoveCallback - Adds a callback that will be called before marker is removed.
 */

/**
 * Geolocation map API.
 *
 * @implements {GeolocationMapInterface}
 */
(function ($, Drupal) {

  'use strict';

  /**
   * @namespace
   * @prop {Object} Drupal.geolocation
   */
  Drupal.geolocation = Drupal.geolocation || {};

  /**
   * @type {GeolocationMapInterface[]}
   * @prop {GeolocationMapSettings} settings The map settings.
   */
  Drupal.geolocation.maps = Drupal.geolocation.maps || [];

  Drupal.geolocation.mapCenter = Drupal.geolocation.mapCenter || {};

  /**
   * Geolocation map.
   *
   * @constructor
   * @abstract
   * @implements {GeolocationMapInterface}
   *
   * @param {GeolocationMapSettings} mapSettings Setting to create map.
   */
  function GeolocationMapBase(mapSettings) {
    this.settings = mapSettings.settings || {};
    this.wrapper = mapSettings.wrapper;
    this.container = mapSettings.wrapper.find('.geolocation-map-container').first();

    if (this.container.length !== 1) {
      throw "Geolocation - Map container not found";
    }

    this.initialized = false;
    this.populated = false;
    this.lat = mapSettings.lat;
    this.lng = mapSettings.lng;

    if (typeof mapSettings.id === 'undefined') {
      this.id = 'map' + Math.floor(Math.random() * 10000);
    }
    else {
      this.id = mapSettings.id;
    }

    this.mapCenter = mapSettings.map_center;
    this.mapMarkers = this.mapMarkers || [];

    return this;
  }

  GeolocationMapBase.prototype = {
    addControl: function (element) {
      // Stub.
    },
    removeControls: function () {
      // Stub.
    },
    update: function (mapSettings) {
      this.settings = $.extend(this.settings, mapSettings.settings);
      this.wrapper = mapSettings.wrapper;
      mapSettings.wrapper.find('.geolocation-map-container').replaceWith(this.container);
      this.lat = mapSettings.lat;
      this.lng = mapSettings.lng;
      if (typeof mapSettings.map_center !== 'undefined') {
        this.mapCenter = mapSettings.map_center;
      }
    },
    setZoom: function (zoom) {
      // Stub.
    },
    getCenter: function () {
      // Stub.
    },
    setCenter: function () {
      if (typeof this.wrapper.data('preserve-map-center') !== 'undefined') {
        return;
      }

      this.setZoom();
      this.setCenterByCoordinates({lat: this.lat, lng: this.lng});

      var that = this;

      Object
        .values(this.mapCenter)
        .sort(function (a, b) {
          return a.weight - b.weight;
        })
        .forEach(
          /**
           * @param {Object} centerOption
           * @param {Object} centerOption.map_center_id
           * @param {Object} centerOption.option_id
           * @param {Object} centerOption.settings
           */
          function (centerOption) {
            if (typeof Drupal.geolocation.mapCenter[centerOption.map_center_id] === 'function') {
              return Drupal.geolocation.mapCenter[centerOption.map_center_id](that, centerOption);
            }
          }
        );
    },
    setCenterByCoordinates: function (coordinates, accuracy, identifier) {
      this.centerUpdatedCallback(coordinates, accuracy, identifier);
    },
    setMapMarker: function (marker) {
      this.mapMarkers.push(marker);
      this.markerAddedCallback(marker);
    },
    removeMapMarker: function (marker) {
      var that = this;
      $.each(
        this.mapMarkers,

        /**
         * @param {integer} index - Current index.
         * @param {GeolocationMapMarker} item - Current marker.
         */
        function (index, item) {
          if (item === marker) {
            that.markerRemoveCallback(marker);
            that.mapMarkers.splice(Number(index), 1);
          }
        }
      );
    },
    removeMapMarkers: function () {
      var that = this;
      var shallowCopy = $.extend({}, this.mapMarkers);
      $.each(
        shallowCopy,

        /**
         * @param {integer} index - Current index.
         * @param {GeolocationMapMarker} item - Current marker.
         */
        function (index, item) {
          if (typeof item === 'undefined') {
            return;
          }
          that.removeMapMarker(item);
        }
      );
    },
    fitMapToMarkers: function (markers, identifier) {
      var boundaries = this.getMarkerBoundaries();
      if (boundaries === false) {
        return false;
      }

      this.fitBoundaries(boundaries, identifier);
    },
    getMarkerBoundaries: function (markers) {
      // Stub.
    },
    fitBoundaries: function (boundaries, identifier) {
      this.centerUpdatedCallback(this.getCenter(), null, identifier);
    },
    clickCallback: function (location) {
      this.clickCallbacks = this.clickCallbacks || [];
      $.each(this.clickCallbacks, function (index, callback) {
        callback(location);
      });
    },
    addClickCallback: function (callback) {
      this.clickCallbacks = this.clickCallbacks || [];
      this.clickCallbacks.push(callback);
    },
    doubleClickCallback: function (location) {
      this.doubleClickCallbacks = this.doubleClickCallbacks || [];
      $.each(this.doubleClickCallbacks, function (index, callback) {
        callback(location);
      });
    },
    addDoubleClickCallback: function (callback) {
      this.doubleClickCallbacks = this.doubleClickCallbacks || [];
      this.doubleClickCallbacks.push(callback);
    },
    contextClickCallback: function (location) {
      this.contextClickCallbacks = this.contextClickCallbacks || [];
      $.each(this.contextClickCallbacks, function (index, callback) {
        callback(location);
      });
    },
    addContextClickCallback: function (callback) {
      this.contextClickCallbacks = this.contextClickCallbacks || [];
      this.contextClickCallbacks.push(callback);
    },
    initializedCallback: function () {
      this.initializedCallbacks = this.initializedCallbacks || [];
      while (this.initializedCallbacks.length > 0) {
        this.initializedCallbacks.shift()(this);
      }
      this.initialized = true;
    },
    addInitializedCallback: function (callback) {
      if (this.initialized) {
        callback(this);
      }
      else {
        this.initializedCallbacks = this.initializedCallbacks || [];
        this.initializedCallbacks.push(callback);
      }
    },
    centerUpdatedCallback: function (coordinates, accuracy, identifier) {
      this.centerUpdatedCallbacks = this.centerUpdatedCallbacks || [];
      $.each(this.centerUpdatedCallbacks, function (index, callback) {
        callback(coordinates, accuracy, identifier);
      });
    },
    addCenterUpdatedCallback: function (callback) {
      this.centerUpdatedCallbacks = this.centerUpdatedCallbacks || [];
      this.centerUpdatedCallbacks.push(callback);
    },
    markerAddedCallback: function (marker) {
      this.markerAddedCallbacks = this.markerAddedCallbacks || [];
      $.each(this.markerAddedCallbacks, function (index, callback) {
        callback(marker);
      });
    },
    addMarkerAddedCallback: function (callback, existing) {
      existing = existing || true;
      if (existing) {
        $.each(this.mapMarkers, function (index, marker) {
          callback(marker);
        });
      }
      this.markerAddedCallbacks = this.markerAddedCallbacks || [];
      this.markerAddedCallbacks.push(callback);
    },
    markerRemoveCallback: function (marker) {
      this.markerRemoveCallbacks = this.markerRemoveCallbacks || [];
      $.each(this.markerRemoveCallbacks, function (index, callback) {
        callback(marker);
      });
    },
    addMarkerRemoveCallback: function (callback) {
      this.markerRemoveCallbacks = this.markerRemoveCallbacks || [];
      this.markerRemoveCallbacks.push(callback);
    },
    populatedCallback: function () {
      this.populatedCallbacks = this.populatedCallbacks || [];
      while (this.populatedCallbacks.length > 0) {
        this.populatedCallbacks.shift()(this);
      }
      this.populated = true;
    },
    addPopulatedCallback: function (callback) {
      if (this.populated) {
        callback(this);
      }
      else {
        this.populatedCallbacks = this.populatedCallbacks || [];
        this.populatedCallbacks.push(callback);
      }
    },
    loadMarkersFromContainer: function () {
      var locations = [];
      this.wrapper.find('.geolocation-location').each(function (index, locationWrapperElement) {

        var locationWrapper = $(locationWrapperElement);

        var position = {
          lat: Number(locationWrapper.data('lat')),
          lng: Number(locationWrapper.data('lng'))
        };

        /** @type {GeolocationMapMarker} */
        var location = {
          position: position,
          title: locationWrapper.find('.location-title').text().trim(),
          setMarker: true,
          locationWrapper: locationWrapper
        };

        if (typeof locationWrapper.data('icon') !== 'undefined') {
          location.icon = locationWrapper.data('icon').toString();
        }

        if (typeof locationWrapper.data('label') !== 'undefined') {
          location.label = locationWrapper.data('label').toString();
        }

        if (locationWrapper.data('set-marker') === 'false') {
          location.setMarker = false;
        }

        locations.push(location);
      });

      return locations;
    }
  };

  Drupal.geolocation.GeolocationMapBase = GeolocationMapBase;

  /**
   * Factory creating map instances.
   *
   * @constructor
   *
   * @param {GeolocationMapSettings} mapSettings The map settings.
   * @param {Boolean} [reset] Force creation of new map.
   *
   * @return {GeolocationMapInterface|boolean} Un-initialized map.
   */
  function Factory(mapSettings, reset) {
    reset = reset || false;
    mapSettings.type = mapSettings.type || 'google_maps';

    var map = null;

    /**
     * Previously stored map.
     * @type {boolean|GeolocationMapInterface}
     */
    var existingMap = Drupal.geolocation.getMapById(mapSettings.id);

    if (reset === true || !existingMap) {
      if (typeof Drupal.geolocation[Drupal.geolocation.MapProviders[mapSettings.type]] !== 'undefined') {
        var mapProvider = Drupal.geolocation[Drupal.geolocation.MapProviders[mapSettings.type]];
        map = new mapProvider(mapSettings);
        Drupal.geolocation.maps.push(map);
      }
    }
    else {
      map = existingMap;
      map.update(mapSettings);
    }

    if (!map) {
      console.error("Map could not be initialized."); // eslint-disable-line no-console .
      return false;
    }

    if (typeof map.container === 'undefined') {
      console.error("Map container not set."); // eslint-disable-line no-console .
      return false;
    }

    if (map.container.length !== 1) {
      console.error("Map container not unique."); // eslint-disable-line no-console .
      return false;
    }

    return map;
  }

  Drupal.geolocation.Factory = Factory;

  /**
   * @type {Object}
   */
  Drupal.geolocation.MapProviders = {};

  Drupal.geolocation.addMapProvider = function (type, name) {
    Drupal.geolocation.MapProviders[type] = name;
  };

  /**
   * Get map by ID.
   *
   * @param {String} id - Map ID to retrieve.
   *
   * @return {GeolocationMapInterface|boolean} - Retrieved map or false.
   */
  Drupal.geolocation.getMapById = function (id) {
    var map = false;
    $.each(Drupal.geolocation.maps, function (index, currentMap) {
      if (currentMap.id === id) {
        map = currentMap;
      }
    });

    if (!map) {
      return false;
    }

    if (typeof map.container === 'undefined') {
      console.error("Existing map container not set."); // eslint-disable-line no-console .
      return false;
    }

    if (map.container.length !== 1) {
      console.error("Existing map container not unique."); // eslint-disable-line no-console .
      return false;
    }

    return map;
  };

  /**
   * @typedef {Object} GeolocationMapFeatureSettings
   *
   * @property {String} id
   * @property {boolean} enabled
   * @property {boolean} executed
   */

  /**
   * Callback when map is clicked.
   *
   * @callback GeolocationMapFeatureCallback
   *
   * @param {GeolocationMapInterface} map - Map.
   * @param {GeolocationMapFeatureSettings} featureSettings - Settings.
   *
   * @return {boolean} - Executed successfully.
   */

  /**
   * Get map by ID.
   *
   * @param {String} featureId - Map ID to retrieve.
   * @param {GeolocationMapFeatureCallback} callback - Retrieved map or false.
   * @param {Object} drupalSettings - Drupal settings.
   */
  Drupal.geolocation.executeFeatureOnAllMaps = function (featureId, callback, drupalSettings) {
    if (typeof drupalSettings.geolocation === 'undefined') {
      return false;
    }

    $.each(
      drupalSettings.geolocation.maps,

      /**
       * @param {String} mapId - ID of current map
       * @param {Object} mapSettings - settings for current map
       * @param {GeolocationMapFeatureSettings} mapSettings[featureId] - Feature settings for current map
       */
      function (mapId, mapSettings) {
        if (
          typeof mapSettings[featureId] !== 'undefined'
          && mapSettings[featureId].enable
        ) {
          var map = Drupal.geolocation.getMapById(mapId);
          if (!map) {
            return;
          }

          map.features = map.features || {};
          map.features[featureId] = map.features[featureId] || {};
          if (typeof map.features[featureId].executed === 'undefined') {
            map.features[featureId].executed = false;
          }

          if (map.features[featureId].executed) {
            return;
          }

          map.addPopulatedCallback(function (map) {
            if (map.features[featureId].executed) {
              return;
            }
            var result = callback(map, mapSettings[featureId]);

            if (result === true) {
              map.features[featureId].executed = true;
            }
          });
        }
      }
    );
  };

})(jQuery, Drupal);
;
/**
 * @file
 * Javascript for the Geolocation map formatter.
 */

(function ($, Drupal) {

  'use strict';

  /**
   * Find and display all maps.
   *
   * @type {Drupal~behavior}
   *
   * @prop {Drupal~behaviorAttach} attach
   *   Attaches Geolocation Maps formatter functionality to relevant elements.
   */
  Drupal.behaviors.geolocationMap = {

    /**
     * @param context
     * @param drupalSettings
     * @param {Object} drupalSettings.geolocation
     */
    attach: function (context, drupalSettings) {
      $('.geolocation-map-wrapper').once('geolocation-map-processed').each(function (index, item) {
        var mapWrapper = $(item);
        var mapSettings = {};
        var reset = false;
        mapSettings.id = mapWrapper.attr('id');
        mapSettings.wrapper = mapWrapper;

        if (mapWrapper.length === 0) {
          return;
        }

        mapSettings.lat = 0;
        mapSettings.lng = 0;

        if (
          mapWrapper.data('centre-lat')
          && mapWrapper.data('centre-lng')
        ) {
          mapSettings.lat = Number(mapWrapper.data('centre-lat'));
          mapSettings.lng = Number(mapWrapper.data('centre-lng'));
        }

        if (mapWrapper.data('map-type')) {
          mapSettings.type = mapWrapper.data('map-type');
        }

        if (typeof drupalSettings.geolocation === 'undefined') {
          console.error("Bailing out for lack of settings.");  // eslint-disable-line no-console .
          return;
        }

        $.each(drupalSettings.geolocation.maps, function (mapId, currentSettings) {
          if (mapId === mapSettings.id) {
            mapSettings = $.extend(currentSettings, mapSettings);
          }
        });

        if (mapWrapper.parent().hasClass('preview-section')) {
          if (mapWrapper.parentsUntil('#views-live-preview').length) {
            reset = true;
          }
        }

        var map = Drupal.geolocation.Factory(mapSettings, reset);

        if (!map) {
          mapWrapper.removeOnce('geolocation-map-processed');
          return;
        }

        map.addInitializedCallback(function (map) {
          map.removeControls();
          $('.geolocation-map-controls > *', map.wrapper).each(function (index, control) {
            map.addControl(control);
          });
          map.removeMapMarkers();

          var locations = map.loadMarkersFromContainer();

          $.each(locations, function (index, location) {
            map.setMapMarker(location);
          });
          map.setCenter();

          map.wrapper.find('.geolocation-location').hide();
        });
      });
    },
    detach: function (context, drupalSettings) {}
  };

})(jQuery, Drupal);
;
/**
 * @file
 * Javascript for widget API.
 */

/**
 * @param {GeolocationWidgetInterface[]} Drupal.geolocation.widgets - List of widget instances
 * @param {Object} Drupal.geolocation.widget - Prototype container
 * @param {GeolocationWidgetSettings[]} drupalSettings.geolocation.widgetSettings - Additional widget settings
 */

/**
 * @name GeolocationWidgetSettings
 * @property {String} autoClientLocationMarker
 * @property {jQuery} wrapper
 * @property {String} id
 * @property {String} type
 * @property {String} fieldName
 * @property {String} cardinality
 */

/**
 * Callback for location found or set by widget.
 *
 * @callback geolocationWidgetLocationCallback
 *
 * @param {String} Identifier
 * @param {GeolocationCoordinates} [location] - Location.
 * @param {int} [delta] - Delta.
 */

/**
 * Interface for classes that represent a color.
 *
 * @interface GeolocationWidgetInterface
 * @property {GeolocationWidgetSettings} settings
 * @property {String} id
 * @property {jQuery} wrapper
 * @property {jQuery} container
 * @property {geolocationWidgetLocationCallback[]} locationAlteredCallbacks
 *
 * @property {function({String}, {GeolocationCoordinates}|null, {int}|null)} locationAlteredCallback - Executes all {geolocationWidgetLocationCallback} modified callbacks.
 * @property {function({geolocationWidgetLocationCallback})} addLocationAlteredCallback - Adds a callback that will be called when a location is set.
 *
 * @property {function():{int}} getNextDelta - Get next delta.
 * @property {function({int}):{jQuery}} getInputByDelta - Get widget input by delta.
 *
 * @property {function({GeolocationCoordinates}, {int}=):{int}} setInput - Add or update input.
 * @property {function({int})} removeInput - Remove input.
 */

(function ($, Drupal) {
  'use strict';

  /**
   * @namespace
   */

  Drupal.geolocation.widget = Drupal.geolocation.widget || {};

  Drupal.geolocation.widgets = Drupal.geolocation.widgets || [];

  Drupal.behaviors.geolocationWidgetApi = {
    attach: function (context, drupalSettings) {
      $.each(Drupal.geolocation.widgets, function (index, widget) {
        $.each(widget.pendingAddedInputs, function (inputIndex, inputData) {
          if (typeof inputData === 'undefined') {
            return;
          }
          if (typeof inputData.delta === 'undefined') {
            return;
          }
          var input = widget.getInputByDelta(inputData.delta);
          if (input) {
            widget.setInput(inputData.location, inputData.delta);
            widget.pendingAddedInputs.splice(inputIndex, 1);
          }
          else {
            widget.addNewEmptyInput();
          }
        });
      });
    }
  };

  /**
   * Geolocation widget.
   *
   * @constructor
   * @abstract
   * @implements {GeolocationWidgetInterface}
   *
   * @param {GeolocationWidgetSettings} widgetSettings - Setting to create widget.
   */
  function GeolocationMapWidgetBase(widgetSettings) {

    this.locationAlteredCallbacks = [];

    this.settings = widgetSettings || {};
    this.wrapper = widgetSettings.wrapper;
    this.fieldName = widgetSettings.fieldName;
    this.cardinality = widgetSettings.cardinality || 1;

    this.inputChangedEventPaused = false;

    this.id = widgetSettings.id;

    this.pendingAddedInputs = [];

    return this;
  }

  GeolocationMapWidgetBase.prototype = {

    locationAlteredCallback: function (identifier, location, delta) {
      if (
          typeof delta === 'undefined'
          || delta === null
      ) {
        delta = this.getNextDelta();
      }
      if (delta === false) {
        return;
      }
      $.each(this.locationAlteredCallbacks, function (index, callback) {
        callback(location, delta, identifier);
      });
    },
    addLocationAlteredCallback: function (callback) {
      this.locationAlteredCallbacks.push(callback);
    },
    getAllInputs: function () {
      return $('.geolocation-widget-input', this.wrapper);
    },
    refreshWidgetByInputs: function () {
      var that = this;
      this.getAllInputs().each(function (delta, inputElement) {
        var input = $(inputElement);
        var lng = input.find('input.geolocation-input-longitude').val();
        var lat = input.find('input.geolocation-input-latitude').val();
        var location;
        if (
          lng === ''
          || lat === ''
        ) {
          location = null;
        }
        else {
          location = {
            lat: Number(lat),
            lng: Number(lng)
          }
        }

        that.locationAlteredCallback('widget-refreshed', location, delta);
        that.attachInputChangedTriggers(input, delta);
      });
    },
    getInputByDelta: function (delta) {
      delta = parseInt(delta) || 0;
      var input = this.getAllInputs().eq(delta);
      if (input.length) {
        return input;
      }
      return null;
    },
    getCoordinatesByInput: function (input) {
      input = $(input);
      if (
        input.find('input.geolocation-input-longitude').val() !== ''
        && input.find('input.geolocation-input-latitude').val() !== ''
      ) {
        return {
          lat: input.find('input.geolocation-input-latitude').val(),
          lng: input.find('input.geolocation-input-longitude').val()
        }
      }
      return false
    },
    getNextDelta: function () {
      if (this.cardinality === 1) {
        return 0;
      }

      var delta = Math.max(this.getNextEmptyInputDelta(), this.getNextPendingDelta());
      if (
          delta > this.cardinality
          && this.cardinality > 0
      ) {
        console.error("Cannot add further geolocation input.");
        return false;
      }
      return delta;
    },
    getNextPendingDelta: function () {
      var maxDelta = this.pendingAddedInputs.length - 1;
      $.each(this.pendingAddedInputs, function (index, item) {
        if (typeof item.delta === 'undefined') {
          return;
        }
        maxDelta = Math.max(maxDelta, item.delta);
      });

      return maxDelta + 1;
    },
    getNextEmptyInputDelta: function (delta) {
      if (this.cardinality === 1) {
        return 0;
      }

      if (typeof delta === 'undefined') {
        delta = this.getAllInputs().length - 1;
      }

      var input = this.getInputByDelta(delta);

      // Current input not empty, return next delta.
      if (
        input.find('input.geolocation-input-longitude').val()
        || input.find('input.geolocation-input-latitude').val()
      ) {
        return delta + 1;
      }

      // We reached the first input and it is empty, use it.
      if (delta === 0) {
        return 0;
      }

      // Recursively check for empty input.
      return this.getNextEmptyInputDelta(delta - 1);
    },
    addNewEmptyInput: function () {
      var button = this.wrapper.find('[name="' + this.fieldName + '_add_more"]');
      if (button.length) {
        button.trigger("mousedown");
      }
    },
    attachInputChangedTriggers: function (input, delta) {
      input = $(input);
      var that = this;
      var longitude = input.find('input.geolocation-input-longitude');
      var latitude = input.find('input.geolocation-input-latitude');

      longitude.off("change");
      longitude.change(function () {
        if (that.inputChangedEventPaused) {
          return;
        }

        var currentValue = $(this).val();
        if (currentValue === '') {
          that.locationAlteredCallback('input-altered', null, delta)
        }
        else if (latitude.val() !== '') {
          var location = {lat: Number(latitude.val()), lng: Number(currentValue)};
          that.locationAlteredCallback('input-altered', location, delta);
        }
      });

      latitude.off("change");
      latitude.change(function () {
        if (that.inputChangedEventPaused) {
          return;
        }

        var currentValue = $(this).val();
        if (currentValue === '') {
          that.locationAlteredCallback('input-altered', null, delta)
        }
        else if (longitude.val() !== '') {
          var location = {lat: Number(currentValue), lng: Number(longitude.val())};
          that.locationAlteredCallback('input-altered', location, delta);
        }
      });
    },
    setInput: function (location, delta) {
      if (typeof delta === 'undefined') {
        delta = this.getNextDelta();
      }

      if (
        typeof delta === 'undefined'
        || delta === false
      ) {
        console.error(location, Drupal.t('Could not determine delta for new widget input.'));
        return null;
      }

      var input = this.getInputByDelta(delta);
      if (input) {
        this.inputChangedEventPaused = true;
        input.find('input.geolocation-input-longitude').val(location.lng);
        input.find('input.geolocation-input-latitude').val(location.lat);
        this.inputChangedEventPaused = false;
      }
      else {
        this.pendingAddedInputs.push({
          delta: delta,
          location: location
        });
        this.addNewEmptyInput();
      }

      return delta;
    },
    removeInput: function (delta) {
      var input = this.getInputByDelta(delta);
      this.inputChangedEventPaused = true;
      input.find('input.geolocation-input-longitude').val('');
      input.find('input.geolocation-input-latitude').val('');
      this.inputChangedEventPaused = false;
    }
  };

  Drupal.geolocation.widget.GeolocationMapWidgetBase = GeolocationMapWidgetBase;

  /**
   * Factory creating widget instances.
   *
   * @constructor
   *
   * @param {GeolocationWidgetSettings} widgetSettings - The widget settings.
   * @param {Boolean} [reset] Force creation of new widget.
   *
   * @return {GeolocationWidgetInterface|boolean} - New or updated widget.
   */
  function Factory(widgetSettings, reset) {
    reset = reset || false;
    widgetSettings.type = widgetSettings.type || 'google';

    var widget = null;

    /**
     * Previously stored widget.
     * @type {boolean|GeolocationWidgetInterface}
     */
    var existingWidget = false;

    $.each(Drupal.geolocation.widgets, function (index, widget) {
      if (widget.id === widgetSettings.id) {
        existingWidget = Drupal.geolocation.widgets[index];
      }
    });

    if (reset === true || !existingWidget) {
      if (typeof Drupal.geolocation.widget[Drupal.geolocation.widget.widgetProviders[widgetSettings.type]] !== 'undefined') {
        var widgetProvider = Drupal.geolocation.widget[Drupal.geolocation.widget.widgetProviders[widgetSettings.type]];
        widget = new widgetProvider(widgetSettings);
        if (widget) {
          Drupal.geolocation.widgets.push(widget);

          widget.refreshWidgetByInputs();
          widget.addLocationAlteredCallback(function (location, delta, identifier) {
            if (
                identifier !== 'input-altered'
                || identifier !== 'widget-refreshed'
            ) {
              if (location === null) {
                widget.removeInput(delta);
              }
              else {
                widget.setInput(location, delta);
              }
            }
          });
        }
      }
    }
    else {
      widget = existingWidget;
    }

    if (!widget) {
      console.error(widgetSettings, "Widget could not be initialzed"); // eslint-disable-line no-console .
      return false;
    }

    return widget;
  }

  Drupal.geolocation.widget.Factory = Factory;

  Drupal.geolocation.widget.widgetProviders = {};

  Drupal.geolocation.widget.addWidgetProvider = function (type, name) {
    Drupal.geolocation.widget.widgetProviders[type] = name;
  };

  /**
   * Get widget by ID.
   *
   * @param {String} id - Widget ID to retrieve.
   *
   * @return {GeolocationWidgetInterface|boolean} - Retrieved widget or false.
   */
  Drupal.geolocation.widget.getWidgetById = function (id) {
    var widget = false;
    $.each(Drupal.geolocation.widgets, function (index, currentWidget) {
      if (currentWidget.id === id) {
        widget = currentWidget;
      }
    });

    return widget;
  };

})(jQuery, Drupal);
;
/**
 * @file
 * Javascript for the Geolocation map widget.
 */

/**
 * @property {function({int}):{GeolocationMapMarker}} getMarkerByDelta - Get map marker by delta.
 * @property {function({GeolocationMapMarker}, {int}=):{int}} initializeMarker - Initialize markers.
 * @property {function({GeolocationCoordinates}, {int}=):{int}} addMarker - Add marker.
 * @property {function({GeolocationCoordinates}, {int})} updateMarker - Update marker.
 * @property {function({int})} removeMarker - Remove marker.
 */

(function ($, Drupal) {

  'use strict';

  $.extend(Drupal.geolocation.widget.GeolocationMapWidgetBase.prototype, {

    map: undefined,
    mapMarkers: [],

    getMarkerByDelta: function (delta) {
      delta = parseInt(delta) || 0;
      var marker = null;

      $.each(this.map.mapMarkers, function (index, currentMarker) {
        /** @param {GeolocationMapMarker} currentMarker */
        if (currentMarker.delta === delta) {
          marker = currentMarker;
          return false;
        }
      });
      return marker;
    },
    initializeMarker: function (marker, delta) {
      marker.delta = delta;
    },
    addMarker: function (location, delta) {
      var marker = this.getMarkerByDelta(delta);
      if (
          typeof marker !== 'undefined'
          && typeof marker !== false
      ) {
        if (marker) {
          this.map.removeMapMarker(marker);
        }
      }
    },
    updateMarker: function (location, delta) {},
    removeMarker: function (delta) {
      var marker = this.getMarkerByDelta(delta);

      if (marker) {
        this.map.removeMapMarker(marker);
      }
    }
  });

  /**
   * Generic widget behavior.
   *
   * @type {Drupal~behavior}
   * @type {Object} drupalSettings.geolocation
   *
   * @prop {Drupal~behaviorAttach} attach
   *   Attaches Geolocation widget functionality to relevant elements.
   */
  Drupal.behaviors.geolocationWidget = {
    attach: function (context, drupalSettings) {

      // Initialize new widgets.
      $('.geolocation-map-widget', context).once('geolocation-widget-processed').each(function (index, item) {
        var widgetSettings = {};
        var widgetWrapper = $(item);
        widgetSettings.wrapper = widgetWrapper;
        widgetSettings.id = widgetWrapper.attr('id').toString();
        widgetSettings.type = widgetWrapper.data('widget-type').toString();

        if (widgetWrapper.length === 0) {
          return;
        }

        if (typeof drupalSettings.geolocation.widgetSettings[widgetSettings.id] !== 'undefined') {
          /** @type {GeolocationWidgetSettings} widgetSettings */
          widgetSettings = $.extend(drupalSettings.geolocation.widgetSettings[widgetSettings.id], widgetSettings);
        }

        var widget = Drupal.geolocation.widget.Factory(widgetSettings);

        if (!widget) {
          return;
        }

        widget.map = Drupal.geolocation.getMapById(widgetSettings.id + '-map');

        if (!widget.map) {
          console.error(widgetSettings, 'Could not find widget map.'); // eslint-disable-line no-console.
          return;
        }

        widget.addLocationAlteredCallback(function (location, delta, identifier) {
          if (identifier !== 'marker') {
            if (location === null) {
              widget.removeMarker(delta);
            }
            else {
              var marker = widget.getMarkerByDelta(delta);
              if (marker === null) {
                widget.addMarker(location, delta);
              }
              else {
                widget.updateMarker(location, delta);
              }
            }
            widget.map.fitMapToMarkers();
          }
        });

        var table = $('table.field-multiple-table', widgetWrapper);

        if (table.length) {
          var tableDrag = Drupal.tableDrag[table.attr('id')];

          if (tableDrag) {
            tableDrag.row.prototype.onSwap = function () {
              widget.refreshWidgetByInputs();
            };
          }
        }

        widget.map.addPopulatedCallback(function (map) {
          widget.getAllInputs().each(function (delta, inputElement) {
            var input = $(inputElement);
            var lng = input.find('input.geolocation-input-longitude').val();
            var lat = input.find('input.geolocation-input-latitude').val();

            if (lng && lat) {
              widget.addMarker({
                lat: Number(lat),
                lng: Number(lng)
              }, delta);
            }
          });
          map.setCenter();

          if (
            widgetSettings.autoClientLocationMarker
            && navigator.geolocation && window.location.protocol === 'https:'
          ) {
            navigator.geolocation.getCurrentPosition(function (currentPosition) {
              widget.locationAlteredCallback('auto-client-location', {lat: currentPosition.coords.latitude, lng: currentPosition.coords.longitude}, null);
            });
          }
        });

        widget.map.addClickCallback(function (location) {
          widget.locationAlteredCallback('map-clicked', location, null);
        });
      });
    }
  };

})(jQuery, Drupal);
;
/**
 * @file
 * Javascript for the Google Maps API integration.
 */

/**
 * @callback googleLoadedCallback
 */

/**
 * @typedef {Object} Drupal.geolocation.google
 * @property {googleLoadedCallback[]} loadedCallbacks
 */

/**
 * @name GoogleMapSettings
 * @property {String} info_auto_display
 * @property {String} marker_icon_path
 * @property {String} height
 * @property {String} width
 * @property {Number} zoom
 * @property {Number} maxZoom
 * @property {Number} minZoom
 * @property {String} type
 * @property {String} gestureHandling
 * @property {Boolean} panControl
 * @property {Boolean} mapTypeControl
 * @property {Boolean} scaleControl
 * @property {Boolean} streetViewControl
 * @property {Boolean} overviewMapControl
 * @property {Boolean} zoomControl
 * @property {Boolean} rotateControl
 * @property {Boolean} fullscreenControl
 * @property {Object} zoomControlOptions
 * @property {String} mapTypeId
 * @property {String} info_text
 */

(function ($, Drupal) {
  'use strict';

  Drupal.geolocation.google = Drupal.geolocation.google || {};

  /**
   * GeolocationGoogleMap element.
   *
   * @constructor
   * @augments {GeolocationMapBase}
   * @implements {GeolocationMapInterface}
   * @inheritDoc
   *
   * @prop {GoogleMapSettings} settings.google_map_settings - Google Map specific settings.
   * @prop {google.maps.Map} googleMap - Google Map.
   */
  function GeolocationGoogleMap(mapSettings) {
    this.type = 'google_maps';

    Drupal.geolocation.GeolocationMapBase.call(this, mapSettings);

    var defaultGoogleSettings = {
      panControl: false,
      scaleControl: false,
      rotateControl: false,
      mapTypeId: 'roadmap',
      zoom: 2,
      maxZoom: 20,
      minZoom: 0,
      style: [],
      gestureHandling: 'auto'
    };

    // Add any missing settings.
    this.settings.google_map_settings = $.extend(defaultGoogleSettings, this.settings.google_map_settings);

    // Set the container size.
    this.container.css({
      height: this.settings.google_map_settings.height,
      width: this.settings.google_map_settings.width
    });

    this.addInitializedCallback(function (map) {
      // Get the center point.
      var center = new google.maps.LatLng(map.lat, map.lng);

      /**
       * Create the map object and assign it to the map.
       */
      map.googleMap = new google.maps.Map(map.container[0], {
        zoom: map.settings.google_map_settings.zoom,
        maxZoom: map.settings.google_map_settings.maxZoom,
        minZoom: map.settings.google_map_settings.minZoom,
        center: center,
        mapTypeId: google.maps.MapTypeId[map.settings.google_map_settings.type],
        mapTypeControl: false, // Handled by feature.
        zoomControl: false, // Handled by feature.
        streetViewControl: false, // Handled by feature.
        rotateControl: map.settings.google_map_settings.rotateControl,
        fullscreenControl: false, // Handled by feature.
        scaleControl: map.settings.google_map_settings.scaleControl,
        panControl: map.settings.google_map_settings.panControl,
        gestureHandling: map.settings.google_map_settings.gestureHandling
      });

      var singleClick;
      var timer;
      google.maps.event.addListener(map.googleMap, 'click', function (e) {
        // Create 500ms timeout to wait for double click.
        singleClick = setTimeout(function () {
          map.clickCallback({lat: e.latLng.lat(), lng: e.latLng.lng()});
        }, 500);
        timer = Date.now();
      });

      google.maps.event.addListener(map.googleMap, 'dblclick', function (e) {
        clearTimeout(singleClick);
        map.doubleClickCallback({lat: e.latLng.lat(), lng: e.latLng.lng()});
      });

      google.maps.event.addListener(map.googleMap, 'rightclick', function (e) {
        map.contextClickCallback({lat: e.latLng.lat(), lng: e.latLng.lng()});
      });

      google.maps.event.addListenerOnce(map.googleMap, 'tilesloaded', function () {
        map.populatedCallback();
      });
    });

    if (this.initialized) {
      this.initializedCallback();
    }
    else {
      var that = this;
      Drupal.geolocation.google.addLoadedCallback(function () {
        that.initializedCallback();
      });

      // Load Google Maps API and execute all callbacks.
      Drupal.geolocation.google.load();
    }
  }
  GeolocationGoogleMap.prototype = Object.create(Drupal.geolocation.GeolocationMapBase.prototype);
  GeolocationGoogleMap.prototype.constructor = GeolocationGoogleMap;
  GeolocationGoogleMap.prototype.setMapMarker = function (markerSettings) {
    if (typeof markerSettings.setMarker !== 'undefined') {
      if (markerSettings.setMarker === false) {
       return;
      }
    }

    markerSettings.position = new google.maps.LatLng(Number(markerSettings.position.lat), Number(markerSettings.position.lng));
    markerSettings.map = this.googleMap;

    if (typeof this.settings.google_map_settings.marker_icon_path === 'string') {
      if (
        this.settings.google_map_settings.marker_icon_path
        && typeof markerSettings.icon === 'undefined'
      ) {
        markerSettings.icon = this.settings.google_map_settings.marker_icon_path;
      }
    }

    /** @type {google.maps.Marker} */
    var currentMarker = new google.maps.Marker(markerSettings);

    Drupal.geolocation.GeolocationMapBase.prototype.setMapMarker.call(this, currentMarker);

    return currentMarker;
  };
  GeolocationGoogleMap.prototype.removeMapMarker = function (marker) {
    if (typeof marker === 'undefined') {
      return;
    }
    Drupal.geolocation.GeolocationMapBase.prototype.removeMapMarker.call(this, marker);
    marker.setMap(null);
  };
  GeolocationGoogleMap.prototype.getMarkerBoundaries = function (locations) {

    locations = locations || this.mapMarkers;
    if (locations.length === 0) {
      return false;
    }

    // A Google Maps API tool to re-center the map on its content.
    var bounds = new google.maps.LatLngBounds();

    $.each(
      locations,

      /**
       * @param {integer} index - Current index.
       * @param {google.maps.Marker} item - Current marker.
       */
      function (index, item) {
        bounds.extend(item.getPosition());
      }
    );
    return bounds;
  };
  GeolocationGoogleMap.prototype.fitBoundaries = function (boundaries, identifier) {
    var currentBounds = this.googleMap.getBounds();
    if (
      !currentBounds
      || !currentBounds.equals(boundaries)
    ) {
      this.googleMap.fitBounds(boundaries);
      Drupal.geolocation.GeolocationMapBase.prototype.fitBoundaries.call(this, boundaries, identifier);
    }
  };
  GeolocationGoogleMap.prototype.setZoom = function (zoom) {
    if (typeof zoom === 'undefined') {
      zoom = this.settings.google_map_settings.zoom;
    }

    zoom = parseInt(zoom);

    this.googleMap.setZoom(zoom);
    var that = this;
    google.maps.event.addListenerOnce(this.googleMap, "idle", function () {
      that.googleMap.setZoom(zoom);
    });
  };
  GeolocationGoogleMap.prototype.getCenter = function () {
    var center = this.googleMap.getCenter();
    return {lat: center.lat(), lng: center.lng()};
  };
  GeolocationGoogleMap.prototype.setCenterByCoordinates = function (coordinates, accuracy, identifier) {
    Drupal.geolocation.GeolocationMapBase.prototype.setCenterByCoordinates.call(this, coordinates, accuracy, identifier);

    if (typeof accuracy === 'undefined') {
      this.googleMap.setCenter(coordinates);
      return;
    }

    var circle = this.addAccuracyIndicatorCircle(coordinates, accuracy);

    // Set the zoom level to the accuracy circle's size.
    this.googleMap.fitBounds(circle.getBounds());

    // Fade circle away.
    setInterval(fadeCityCircles, 200);

    function fadeCityCircles() {
      var fillOpacity = circle.get('fillOpacity');
      fillOpacity -= 0.01;

      var strokeOpacity = circle.get('strokeOpacity');
      strokeOpacity -= 0.02;

      if (
        strokeOpacity > 0
        && fillOpacity > 0
      ) {
        circle.setOptions({fillOpacity: fillOpacity, strokeOpacity: strokeOpacity});
      }
      else {
        circle.setMap(null);
      }
    }
  };
  GeolocationGoogleMap.prototype.addControl = function (element) {
    element = $(element);

    var position = google.maps.ControlPosition.TOP_LEFT;

    if (typeof element.data('googleMapControlPosition') !== 'undefined') {
      var customPosition = element.data('googleMapControlPosition');
      if (typeof google.maps.ControlPosition[customPosition] !== 'undefined') {
        position = google.maps.ControlPosition[customPosition];
      }
    }

    var controlAlreadyAdded = false;
    var controlIndex = 0;
    this.googleMap.controls[position].forEach(function (controlElement, index) {
      var control = $(controlElement);
      if (element[0].getAttribute("class") === control[0].getAttribute("class")) {
        controlAlreadyAdded = true;
        controlIndex = index;
      }
    });

    if (!controlAlreadyAdded) {
      element.show();
      this.googleMap.controls[position].push(element[0]);
      return element;
    }
    else {
      element.remove();

      return this.googleMap.controls[position].getAt(controlIndex);
    }
  };
  GeolocationGoogleMap.prototype.removeControls = function () {
    $.each(this.googleMap.controls, function (index, item) {
      if (typeof item === 'undefined') {
        return;
      }

      if (typeof item.clear === 'function') {
        item.clear();
      }
    });
  };

  Drupal.geolocation.GeolocationGoogleMap = GeolocationGoogleMap;
  Drupal.geolocation.addMapProvider('google_maps', 'GeolocationGoogleMap');

  /**
   * Draw a circle representing the accuracy radius of HTML5 geolocation.
   *
   * @param {GeolocationCoordinates|google.maps.LatLng} location - Location to center on.
   * @param {int} accuracy - Accuracy in m.
   *
   * @return {google.maps.Circle} - Indicator circle.
   */
  GeolocationGoogleMap.prototype.addAccuracyIndicatorCircle = function (location, accuracy) {
    return new google.maps.Circle({
      center: location,
      radius: accuracy,
      map: this.googleMap,
      fillColor: '#4285F4',
      fillOpacity: 0.15,
      strokeColor: '#4285F4',
      strokeOpacity: 0.3,
      strokeWeight: 1,
      clickable: false
    });
  };

  /**
   * @inheritDoc
   */
  Drupal.geolocation.google.addLoadedCallback = function (callback) {
    Drupal.geolocation.google.loadedCallbacks = Drupal.geolocation.google.loadedCallbacks || [];
    Drupal.geolocation.google.loadedCallbacks.push(callback);
  };

  /**
   * Provides the callback that is called when maps loads.
   */
  Drupal.geolocation.google.load = function () {
    // Check for Google Maps.
    if (typeof google === 'undefined' || typeof google.maps === 'undefined') {
      console.error('Geolocation - GoogleMaps could not be initialized.'); // eslint-disable-line no-console .
      return;
    }

    $.each(Drupal.geolocation.google.loadedCallbacks, function (index, callback) {
      callback();
    });
    Drupal.geolocation.google.loadedCallbacks = [];
  };

})(jQuery, Drupal);
;
/**
 * @file
 * Javascript for the map geocoder widget.
 */

(function ($, Drupal) {
  'use strict';

  /**
   * GeolocationGoogleMapWidget element.
   *
   * @constructor
   * @augments {GeolocationMapWidgetBase}
   * @implements {GeolocationWidgetInterface}
   * @inheritDoc
   */
  function GeolocationGoogleMapWidget(widgetSettings) {
    Drupal.geolocation.widget.GeolocationMapWidgetBase.call(this, widgetSettings);

    return this;
  }
  GeolocationGoogleMapWidget.prototype = Object.create(Drupal.geolocation.widget.GeolocationMapWidgetBase.prototype);
  GeolocationGoogleMapWidget.prototype.constructor = GeolocationGoogleMapWidget;
  GeolocationGoogleMapWidget.prototype.addMarker = function (location, delta) {
    Drupal.geolocation.widget.GeolocationMapWidgetBase.prototype.addMarker.call(this, location, delta);

    if (typeof delta === 'undefined') {
      delta = this.getNextDelta();
    }

    if (delta === false) {
      return;
    }

    var marker = this.map.setMapMarker({
      position: location
    });
    marker = this.initializeMarker(marker, delta);

    return marker;
  };
  GeolocationGoogleMapWidget.prototype.initializeMarker = function (marker, delta) {
    Drupal.geolocation.widget.GeolocationMapWidgetBase.prototype.initializeMarker.call(this, marker, delta);

    var location = marker.getPosition();
    marker.setTitle(Drupal.t('[@delta] Latitude: @latitude Longitude: @longitude', {
      '@delta': delta,
      '@latitude': location.lat(),
      '@longitude': location.lng()
    }));
    marker.setDraggable(true);
    marker.setLabel((delta + 1).toString());

    var that = this;
    marker.addListener('dragend', function (e) {
      that.locationAlteredCallback('marker', {lat: Number(e.latLng.lat()), lng: Number(e.latLng.lng())}, marker.delta);
    });

    marker.addListener('click', function () {
      that.removeMarker(marker.delta);
      that.locationAlteredCallback('marker', null, marker.delta);
    });

    return marker;
  };
  GeolocationGoogleMapWidget.prototype.updateMarker = function (location, delta) {
    Drupal.geolocation.widget.GeolocationMapWidgetBase.prototype.updateMarker.call(this, location, delta);

    /** @param {google.map.Marker} marker */
    var marker = this.getMarkerByDelta(delta);
    marker.setPosition(location);

    return marker;
  };
  Drupal.geolocation.widget.GeolocationGoogleMapWidget = GeolocationGoogleMapWidget;

  Drupal.geolocation.widget.addWidgetProvider('google', 'GeolocationGoogleMapWidget');

})(jQuery, Drupal);
;
/**
 * @file
 * Javascript for the GoogleMaps Geolocation map widget.
 */

(function ($, Drupal) {

  'use strict';

  /**
   * GoogleMaps widget.
   *
   * @type {Drupal~behavior}
   *
   * @prop {Drupal~behaviorAttach} attach
   *   Attaches Geolocation Maps widget functionality to relevant elements.
   */
  Drupal.behaviors.geolocationGoogleMapsWidget = {
    attach: function (context, drupalSettings) {
      $('.geolocation-map-widget', context).once('geolocation-google-maps-widget-processed').each(function (index, item) {
        var widgetId = $(item).attr('id').toString();
        var widget = Drupal.geolocation.widget.getWidgetById(widgetId);
        if (!widget) {
          return;
        }

        widget.map.addCenterUpdatedCallback(function (location, accuracy, identifier) {
          if (typeof identifier === 'undefined') {
            return;
          }

          if (identifier === 'google_control_locate' || identifier === 'google_control_geocoder') {
            widget.locationAlteredCallback('widget-map-moved', location, null);
          }
        });
      });
    },
    detach: function (context, drupalSettings) {}
  };

})(jQuery, Drupal);
;
(function ($, Drupal) {

  'use strict';

  Drupal.geolocation = Drupal.geolocation || {};
  Drupal.geolocation.mapCenter = Drupal.geolocation.mapCenter || {};

  /**
   * @param centerOption.settings.reset_zoom {Boolean}
   */
  Drupal.geolocation.mapCenter.fit_bounds = function(map, centerOption) {
    map.fitMapToMarkers();

    if (centerOption.settings.reset_zoom) {
      map.setZoom();
    }

    return false;
  }

})(jQuery, Drupal);
;

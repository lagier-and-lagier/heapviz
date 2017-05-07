/* jshint worker: true */
/*
 * Copyright (C) 2011 Google Inc.  All rights reserved.
 * Copyright (C) 2006, 2007, 2008 Apple Inc.  All rights reserved.
 * Copyright (C) 2007 Matt Lilek (pewtermoose@gmail.com).
 * Copyright (C) 2009 Joseph Pecoraro
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 *
 * 1.  Redistributions of source code must retain the above copyright
 *     notice, this list of conditions and the following disclaimer.
 * 2.  Redistributions in binary form must reproduce the above copyright
 *     notice, this list of conditions and the following disclaimer in the
 *     documentation and/or other materials provided with the distribution.
 * 3.  Neither the name of Apple Computer, Inc. ("Apple") nor the names of
 *     its contributors may be used to endorse or promote products derived
 *     from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY APPLE AND ITS CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL APPLE OR ITS CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
/**
 * @param {string} string
 * @param {...*} vararg
 * @return {string}
 */
WebInspector.UIString = function(string, vararg) {
  return self.vsprintf(WebInspector.localize(string), Array.prototype.slice.call(arguments, 1));
};

/**
 * @param {string} string
 * @param {...*} vararg
 * @return {string}
 */
WebInspector.UIString.capitalize = function(string, vararg) {
  if (WebInspector._useLowerCaseMenuTitles === undefined)
    throw 'WebInspector.setLocalizationPlatform() has not been called';

  var localized = WebInspector.localize(string);
  var capitalized;
  if (WebInspector._useLowerCaseMenuTitles)
    capitalized = localized.replace(/\^(.)/g, '$1');
  else
    capitalized = localized.replace(/\^(.)/g, function(str, char) {
      return char.toUpperCase();
    });
  return window.vsprintf(capitalized, Array.prototype.slice.call(arguments, 1));
};

/**
 * @param {string} platform
 */
WebInspector.setLocalizationPlatform = function(platform) {
  WebInspector._useLowerCaseMenuTitles = platform === 'windows';
};

/**
 * @param {string} string
 * @return {string}
 */
WebInspector.localize = function(string) {
  return string;
};

/**
 * @unrestricted
 */
WebInspector.UIStringFormat = class {
  /**
   * @param {string} format
   */
  constructor(format) {
    /** @type {string} */
    this._localizedFormat = WebInspector.localize(format);
    /** @type {!Array.<!Object>} */
    this._tokenizedFormat = String.tokenizeFormatString(this._localizedFormat, String.standardFormatters);
  }

  /**
   * @param {string} a
   * @param {string} b
   * @return {string}
   */
  static _append(a, b) {
    return a + b;
  }

  /**
   * @param {...*} vararg
   * @return {string}
   */
  format(vararg) {
    return String
        .format(
            this._localizedFormat, arguments, String.standardFormatters, '', WebInspector.UIStringFormat._append,
            this._tokenizedFormat)
        .formattedResult;
  }
};

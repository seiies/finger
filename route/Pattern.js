'use strict';

var Parser = /** @type Parser */ require('./Parser');

var _ = require('lodash-node');
var inherit = require('inherit');

/**
 * @private
 * @static
 * @memberOf Pattern
 * @property
 * @type {RegExp}
 * */
var R_PATTERN = /^\s*([\s\S]*?)(?:\s+(\w+))?\s*$/;

/**
 * @private
 * @static
 * @memberOf Pattern
 * @method
 * */
var escape = require('regesc');

/**
 * @private
 * @static
 * @memberOf Pattern
 * @property
 * @type {Object}
 * */
var flag2ParamMap = {
    s: 'doNotMatchStart',
    e: 'doNotMatchEnd',
    i: 'ignoreCase'
};

/**
 * @private
 * @static
 * @memberOf Pattern
 * @property
 * @type {Object}
 * */
var param2FlagMap = _.invert(flag2ParamMap);

/**
 * @class Pattern
 * @extends Parser
 * */
var Pattern = inherit(Parser, /** @lends Pattern.prototype */ {

    /**
     * @private
     * @memberOf {Pattern}
     * @method
     *
     * @constructs
     *
     * @param {String} pattern
     * @param {Object} [params]
     * */
    __constructor: function (pattern, params) {

        var match = R_PATTERN.exec(pattern);

        this.__base(match[1]);

        params = _.extend({}, this.params, params);

        /**
         * @public
         * @memberOf {Pattern}
         * @property
         *
         * @type {Object}
         * */
        this.params = _.reduce(match[2], reduceFlag, params);

        /**
         * @protected
         * @memberOf {Pattern}
         * @property
         *
         * @type {RegExp}
         * */
        this._regexpCompileResult = this.__compileRegExp();
    },

    /**
     * @public
     * @memberOf {Pattern}
     * @method
     *
     * @param {Object} [opts]
     *
     * @returns {String}
     * */
    build: function (opts) {

        var using = {};

        function buildPart (part) {

            var type = part.type;

            if ( Parser.PART_DELIM === type ) {

                return '/';
            }

            if ( Parser.PART_STATIC === type ) {

                return part.encoded;
            }

            if ( Parser.PART_PARAM === type ) {

                return buildParamPart.call(this, part.body);
            }

            return '';
        }

        function buildParamPart (name) {

            var num;
            var value;

            if ( !_.has(opts, name) ) {

                return '';
            }

            value = opts[name];

            if ( using.hasOwnProperty(name) ) {
                num = using[name] += 1;

            } else {
                num = using[name] = 0;
            }

            if ( _.isArray(value) ) {
                value = value[num];

            } else if ( num ) {

                return '';
            }

            if ( this.__self.isFalsy(value) ) {

                return '';
            }

            return encodeURIComponent(value);
        }

        return this.compile(buildPart);
    },

    /**
     * @public
     * @memberOf {Pattern}
     * @method
     *
     * @param {String} pathname
     *
     * @returns {Object}
     * */
    match: function (pathname) {

        var i;
        var l;
        var match = this._regexpCompileResult.regex.exec(pathname);
        var names = this._regexpCompileResult.names;
        var result = null;

        if ( null === match ) {

            return result;
        }

        result = {};

        for ( i = 0, l = names.length; i < l; i += 1 ) {
            push2Result(result, names[i], match[i + 1]);
        }

        return result;
    },

    /**
     * @public
     * @memberOf {Pattern}
     * @method
     *
     * @returns {String}
     * */
    toString: function () {

        var pattern = this.__base();
        var flags = _.reduce(this.params, this.__reduceParam2Flag, '', this);

        if ( '' === flags ) {

            return pattern;
        }

        return pattern + ' ' + flags;
    },

    /**
     * @private
     * @memberOf {Pattern}
     * @method
     *
     * @param {String} flags
     * @param {Boolean} value
     * @param {String} name
     *
     * @returns {String}
     * */
    __reduceParam2Flag: function (flags, value, name) {

        if ( _.has(param2FlagMap, name) ) {

            if ( value ) {
                flags += param2FlagMap[name].toLowerCase();

            } else {
                flags += param2FlagMap[name].toUpperCase();
            }
        }

        return flags;
    },

    /**
     * @private
     * @memberOf {Pattern}
     * @method
     *
     * @returns {Object}
     * */
    __compileRegExp: function () {

        var names = [];
        var using = {};
        var source = this.compile(function (part, isBubbling) {

            var type = part.type;

            if ( Parser.PART_DELIM === type ) {

                return escape('/');
            }

            if ( Parser.PART_STATIC === type ) {

                return this.__compileStaticPart(part);
            }

            if ( Parser.PART_PARAM === type ) {
                names.push(part.body);
                using[part.body] = true;

                if ( _.isEmpty(part.parts) ) {

                    return '([^/]+?)';
                }

                return '(' + _.map(part.parts,
                    this.__compileStaticPart, this).join('|') + ')';
            }

            if ( isBubbling ) {

                return ')?';
            }

            return '(?:';
        });

        if ( !this.params.doNotMatchStart ) {
            source = '^' + source;
        }

        if ( !this.params.doNotMatchEnd ) {
            source += '$';
        }

        return {
            regex: new RegExp(source, this.params.ignoreCase ? 'i' : ''),
            names: names,
            using: using
        };
    },

    /**
     * @private
     * @memberOf {Pattern}
     * @method
     *
     * @param {Object} part
     *
     * @returns {String}
     * */
    __compileStaticPart: function (part) {
        part = decodeURIComponent(part.body);

        return _.reduce(part, this.__reduceChar, '', this);
    },

    /**
     * @private
     * @memberOf {Pattern}
     * @method
     *
     * @param {String} result
     * @param {String} char
     *
     * @returns {String}
     * */
    __reduceChar: function (result, char) {

        if ( char === encodeURIComponent(char) ) {

            return result + escape(char);
        }

        if ( this.params.ignoreCase ) {

            return result + '(?:' + escape(char) + '|' +
                      encodeURIComponent(char.toLowerCase()) + '|' +
                      encodeURIComponent(char.toUpperCase()) + ')';
        }

        return result + '(?:' + escape(char) + '|' +
                  encodeURIComponent(char) + ')';
    }

});

/**
 * @private
 * @static
 * @memberOf Pattern
 *
 * @param {Object} result
 * @param {String} name
 * @param {*} value
 *
 * @returns {Object}
 * */
function push2Result (result, name, value) {

    if ( 'string' === typeof value && -1 !== value.indexOf('%') ) {
        value = decodeURIComponent(value);
    }

    if ( result.hasOwnProperty(name) ) {

        if ( _.isArray(result[name]) ) {
            result[name].push(value);

            return result;
        }

        result[name] = [result[name], value];

        return result;
    }

    result[name] = value;

    return result;
}

/**
 * @private
 * @static
 * @memberOf Pattern
 * @method
 *
 * @param {Object} params
 * @param {String} name
 *
 * @returns {Object}
 * */
function reduceFlag (params, name) {

    var lowerName = name.toLowerCase();
    var isLowerCased = name === lowerName;

    name = lowerName;

    if ( _.has(flag2ParamMap, name) ) {
        name = flag2ParamMap[name];
    }

    params[name] = isLowerCased;

    return params;
}

module.exports = Pattern;

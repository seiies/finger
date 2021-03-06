/*global describe, it*/
'use strict';

var assert = require('assert');

describe('core/parser/rule-arg', function () {
    /*eslint max-nested-callbacks: 0*/
    var RuleArg = require('../core/parser/rule-arg');

    describe('RuleArg.TYPE', function () {

        it('Should have static property "TYPE"', function () {
            assert.ok(RuleArg.hasOwnProperty('TYPE'));
        });

        it('Should be a String', function () {
            assert.strictEqual(typeof RuleArg.TYPE, 'string');
        });
    });

    describe('{RuleArg}.type', function () {

        it('Should have own member "type"', function () {
            var rule = new RuleArg();
            assert.ok(rule.hasOwnProperty('type'));
        });

        it('Should be a String', function () {
            var rule = new RuleArg();
            assert.strictEqual(typeof rule.type, 'string');
        });

        it('Should be equal to RuleArg.TYPE', function () {
            var rule = new RuleArg();
            assert.strictEqual(rule.type, RuleArg.TYPE);
        });
    });

    describe('{RuleArg}.name', function () {

        it('Should have own member "name"', function () {
            var rule = new RuleArg();
            assert.ok(rule.hasOwnProperty('name'));
        });

        it('Should be a String', function () {
            var rule = new RuleArg();
            assert.strictEqual(typeof rule.name, 'string');
        });
    });

    describe('{RuleArg}.kind', function () {

        it('Should have own member "kind"', function () {
            var rule = new RuleArg();
            assert.ok(rule.hasOwnProperty('kind'));
        });

        it('Should be a String', function () {
            var rule = new RuleArg();
            assert.strictEqual(typeof rule.kind, 'string');
        });
    });

    describe('{RuleArg}.required', function () {

        it('Should have own member "required"', function () {
            var rule = new RuleArg();
            assert.ok(rule.hasOwnProperty('required'));
        });

        it('Should be a Boolean', function () {
            var rule = new RuleArg();
            assert.strictEqual(typeof rule.required, 'boolean');
        });
    });

    describe('RuleArg.normalizeName', function () {

        it('Should have static method "normalizeName"', function () {
            assert.strictEqual(typeof RuleArg.normalizeName, 'function');
        });

        it('Should unescape all chars except "."', function () {
            assert.strictEqual(RuleArg.normalizeName('\\a.b\\.c'), 'a.b\\.c');
            assert.strictEqual(RuleArg.normalizeName('\\a\\.b\\.c'), 'a\\.b\\.c');
        });
    });

    describe('{RuleArg}.addText', function () {

        it('Should have own method "addText"', function () {
            var rule = new RuleArg();
            assert.strictEqual(typeof rule.addText, 'function');
        });

        it('Should add text to {RuleArg}.name', function () {
            var rule = new RuleArg();
            assert.strictEqual(rule.name, '');
            rule.addText('a');
            assert.strictEqual(rule.name, 'a');
            rule.addText('.b\\.\\c');
            assert.strictEqual(rule.name, 'a.b\\.c');
        });

        it('Should return {RuleArg} (self)', function () {
            var rule = new RuleArg();
            assert.strictEqual(rule.addText('x'), rule);
        });
    });

    describe('{RuleArg}.setKind', function () {

        it('Should have own method "setKind"', function () {
            var rule = new RuleArg();
            assert.strictEqual(typeof rule.setKind, 'function');
        });

        it('Should set {RuleArg}.kind', function () {
            var rule = new RuleArg();
            assert.strictEqual(rule.kind, '');
            rule.setKind('k\\ind');
            assert.strictEqual(rule.kind, 'kind');
        });

        it('Should return {RuleArg} (self)', function () {
            var rule = new RuleArg();
            assert.strictEqual(rule.setKind('kind'), rule);
        });
    });

    describe('{RuleArg}.setRequired', function () {

        it('Should have own method "setRequired"', function () {
            var rule = new RuleArg();
            assert.strictEqual(typeof rule.setRequired, 'function');
        });

        it('Should set {RuleArg}.required', function () {
            var rule = new RuleArg();
            assert.strictEqual(rule.required, true);
            rule.setRequired(false);
            assert.strictEqual(rule.required, false);
        });

        it('Should return {RuleArg} (self)', function () {
            var rule = new RuleArg();
            assert.strictEqual(rule.setRequired(true), rule);
        });
    });

});

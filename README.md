finger [![Build Status](https://travis-ci.org/fistlabs/finger.svg?branch=master)](https://travis-ci.org/fistlabs/finger)
=========

Finger is a powerful and fast Nodejs router.

##[core/rule](core/rule.js)
```Rule``` is a part of ```Matcher``` that can match and build urls described in special syntax.

###```Rule new Rule(String ruleString[, Object options])```
Creates new rule.

```js
var rule = new Rule('/');
```

####```String ruleString```
```ruleString``` is a ```String```, which describes url both for mathing and building.
```ruleString``` can describe pathname and, optionally, query.
It consists of static rule parts, parameters, captures and optional parts.

```
/news/(42/)
```
The ```/news/``` part describes required part of url, and ```42/``` is optional.
Let's make optional part more dynamic:

```
/news/(<postId>/)
```
Now ```postId``` is the parameter. This rule both valid for ```/news/``` and ```/news/146/``` paths.
Let's describe query arguments.

```
/news/(<postId>/)&date
```
For now ```date``` is the required query argument. Let's describe more than one query argument:

```
/news/(<postId>/)&date&time
```
Query arguments may be optional:

```
/news/(<postId>/)&date?time
```
Now ```time``` argument is optional.

####```Object options```
Rule object supports some options.

#####```Boolean options.ignoreCase```
Disables case sensitivity for pathname rule.

```js
var rule = new Rule('/news/', {
    ignoreCase: true
});
```

For this rule both ```/news/``` and ```/NeWs/``` urls are identical.

###```Object|null rule.match(String url)```
Matches the url to the rule. Returns the set of values according to described arguments.

```js
var rule = new Rule('/news/(<postId>/)?date');
rule.match('/news/'); // -> {postId: undefined, date: undefined}
rule.match('/news/146/'); // -> {postId: '146', date: undefined}
rule.match('/news/146/?nondecl=42'); // -> {postId: '146', date: undefined}
rule.match('/news/146/?date=31-12-14'); // -> {postId: '146', date: '31-12-14'}
rule.match('/forum/'); // -> null
```

###```String rule.build([Object args])```
Builds the url from the rule.

```js
var rule = new Rule('/news/(<postId>/)?date');
rule.build(); // -> '/news/'
rule.build({postId: 146}); // -> '/news/146/'
rule.build({date: 42}); // -> /news/?date=42
rule.build({postId: 146, date: 42}); // -> /news/146/?date=42
```
##[core/matcher](core/matcher.js)
```Matcher``` is a set of rules that gives an interface to manage rules e.g. adding, deleting, matching.

###```Matcher new Matcher([Object options])```
Creates new ```matcher``` object. ```options``` is a general options for all rules.

###```Rule matcher.addRule(String ruleString[, Object ruleData])```
Adds a ```rule``` to ```matcher```.
```ruleString``` is a rule declaration that I mentioned above.
```ruleData``` is an object that will be associated with the rule. ```ruleData.name``` is required, it will be random generated if omitted.

```js
var matcher = new Matcher();
var rule = matcher.addRule('/', {name: 'index', foo: 42});
rule.data.name // -> 'index'
rule.data.foo // -> 42
```

###```Rule|null matcher.delRule(String name)```
Deletes the rule from the set.

```js
var matcher = new Matcher();
var rule = matcher.addRule('/', {name: 'index'});
assert.strictEqual(rule, matcher.delRule('index'));
```

###```Rule|void matcher.getRule(String name)```
Returns the ```rule``` by ```name```.

```js
var matcher = new Matcher();
var rule = matcher.addRule('/', {name: 'index'});
assert.strictEqual(rule, matcher.getRule('index'));
```

###```Array<Rule> matcher.matchAll(String url)```
Returns all match results.

```js
var matcher = new Matcher();
matcher.addRule('/news/?date', {name: 'index1'})
matcher.addRule('/news/', {name: 'index2'});
assert.deepEqual(matcher.matchAll('/news/'), [
    {
        name: 'index1', 
        args: {
            date: undefined
        }
    }, 
    {
        name: 'index2', 
        args: {}
    }
]);
```

##Features

###Parameter types
Let's add the types to parameters:

```js
var matcher = new Matcher({
    types: {
        Alnum: '\\d+'
    }
});
matcher.addRule('/news/<Alnum:postId>/');
```
Now the rule is valid for ```/news/42/``` but not for ```/news/foo/```.
Builtin types:
 * ```Segment```- default for pathname parameters (```[^/]+?```).
 * ```Free```  - default for query parameters (```[\s\S]+?```).

###Combined parameters
The parameters describe where values must be placed in arguments object.

```js
var rule = new Rule('/<page.section>/(<page.itemId>/)');
rule.match('/news/146/'); // -> {page: {section: 'news', itemId: '146'}}
```
Supported both for pathname and query parameters

---------
LICENSE [MIT](LICENSE)

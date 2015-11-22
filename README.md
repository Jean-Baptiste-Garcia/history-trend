history-trend
===============

history-trend computes trends from an history source. Source can be :
* array of versionned reports
* [history-store](https://github.com/Jean-Baptiste-Garcia/history-store)

Installation
------------

To use with node:

```bash
$ npm install history-trend
```

Usage
-----
### Flux
Flux compares two arrays in consecutive versions and returns added/removed/identical/modified. By default, objects in Array are identified by 'key' property.

As an example, we consider history of issues present in a backlog. One wants to know which issues have been added / removed.

```javascript
 var H = require('history-trend'),
     reports = [
{date: new Date('2015-12-01T03:24:00'), issues: [{ key: 'JIRA-123', status: 'New', type: 'Feature'}, { key: 'JIRA-456', status: 'In Progress', type: 'Bug'}]},
{date: new Date('2015-12-02T03:22:00'), issues: [{ key: 'JIRA-123', status: 'In Progress', type: 'Feature'}, { key: 'JIRA-789', status: 'In Progress', type: 'Bug'}]},
{date: new Date('2015-12-03T03:30:00'), issues: [{ key: 'JIRA-123', status: 'In Progress', type: 'Feature'}, { key: 'JIRA-789', status: 'Done', type: 'Bug'}, { key: 'JIRA-900', type: 'Bug', status: 'Done'}, { key: 'JIRA-901', status: 'Done', type: 'Bug'}]}];

H.flux('issues').fromArray(reports);
// returns
[
 {date: 'Tue Dec 01 2015 04:24:00', issues: { added: [], removed: [], modified: [], identical: []}},
 {date: 'Wed Dec 02 2015 04:22:00', issues: { added: ['JIRA-789'], removed: ['JIRA-456'], modified: ['JIRA-123'], identical: []}},
 {date: 'Thu Dec 03 2015 04:30:00', issues: { added: ['JIRA-900', 'JIRA-901'], removed: [], modified: ['JIRA-789'], identical: ['JIRA-123']}}
 ]
```

#### Function based flux
It is possible to use function instead of named property. For instance, if one is only interested in flux of bugs :
```javascript
function bugs(report) {
    return report.issues.filter(function (issue) {return issue.type === 'Bug'; });
}

H.flux(bugs).fromArray(reports);
// returns
[
    {date: new Date('2015-12-01T03:24:00'), bugs: { added: [], removed: [], modified: [], identical: []}},
    {date: new Date('2015-12-02T03:22:00'), bugs: { added: ['JIRA-789'], removed: ['JIRA-456'], modified: [], identical: []}},
    {date: new Date('2015-12-03T03:30:00'), bugs: { added: ['JIRA-900', 'JIRA-901'], removed: [], modified: ['JIRA-789'], identical: []}}
]
```
Note that name of trend is function name (bugs in our example). When function is anonymous, then trend is named 'value'.


#### Identification / Equality methods
By default, when computing flux on objects arrays, two objects are said to be identical when :

  1. They have same value for *key* property
  2. All others properties have same value

1st condition is called identification method. 2nd condition is equality method. It tells whether objects have been modified or not.

It is possible to change identification method. For instance, if issues are identified by ```id``` property, use :
```javascript
H.flux('issues', {identification: 'id'}).fromArray(reports);
```
You can also change equality method, so that modified list focuses on what you want to monitor. Here, only issues whose remaining work has changed are in modified array.
```javascript
H.flux('issues', {
    equality: function (r1, r2) { return r1.remaining === r2.remaining; }}).fromArray(reports);

```

#### Custom output
If you focus on movements (added/removed/modified), then you might be only interested in number of identical.

You can use predefined functions on each object found identical/modified/added/removed. For instance :
```javascript
H.flux('issues', {
    identical: H.fluxCounter, // counts each object found identical
    modified:  H.fluxCounter // counts each object found modified
 }).fromArray(reports);

// returns
[
 {date: 'Tue Dec 01 2015 04:24:00', issues: { added: [], removed: [], modified: 0, identical: 0}},
 {date: 'Wed Dec 02 2015 04:22:00', issues: { added: ['JIRA-789'], removed: ['JIRA-456'], modified: 1, identical: 0}},
 {date: 'Thu Dec 03 2015 04:30:00', issues: { added: ['JIRA-900', 'JIRA-901'], removed: [], modified: 1, identical: 1}}
 ]
```
Others predefined functions are :
* ```H.fluxLister``` which returns usual array of keys
* ```H.fluxVariation('remaining')``` which returns array of key with variation of ```remaining``` value

You can use custom functions provided they comply with:
* ```function output(id, o1, o2)``` should process new comparison event like o2 added, o1 removed, (o1, o2) identical, (o1,o2) modified
* ```function output()``` should return output value

```javascript
function makecounter() {
    var count = 0;
    return function output(id, o1, o2) {
        if (id) {count += 1; }
        return count;
    };
};
```
### Variation Flux
To be used when you need to explain variation of a numeric consolidated quantity. For instance, why does remaining work keeps on increasing ? Knowing that remaining work is the sum of many tasks and that some tasks are added or that a task can have its workload increased.

```javascript
var data = [
    {date: new Date('1995-12-17T03:24:00'), issues: [
        {key: 'JIRA-123', status: 'New', remaining: 10},
        {key: 'JIRA-456', status: 'In Progress', remaining: 100}]},
    {date: new Date('1995-12-18T03:24:00'), issues: [
        {key: 'JIRA-123', status: 'In Progress', remaining: 10},
        {key: 'JIRA-789', status: 'In Progress', remaining: 20}]},
    {date: new Date('1995-12-20T03:24:00'), issues: [
        {key: 'JIRA-123', status: 'In Progress', remaining: 5},
        {key: 'JIRA-789', status: 'Done', remaining: 0},
        {key: 'JIRA-900', status: 'Done', remaining: 0},
        {key: 'JIRA-901', status: 'Done', remaining: 0}]}];

// issuing
H.variationFlux('issues', 'remaining').fromArray(data);

// returns
[
    {date: new Date('1995-12-17T03:24:00'), issues: {
        added: [], removed: [], identical: 0, modified: []
    }},
    {date: new Date('1995-12-18T03:24:00'), issues: {
        added: [{key: 'JIRA-789', from: 0, to: 20, variation: 20}],
        removed: [{key: 'JIRA-456', from: 100, to: 0, variation: -100}],
        identical: 1,
        modified: []
    }},
    {date: new Date('1995-12-20T03:24:00'), issues: {
        added: [{key: 'JIRA-900', from: 0, to: 0, variation: 0},
                {key: 'JIRA-901', from: 0, to: 0, variation: 0}],
        removed: [],
        identical: 0,
        modified: [{key: 'JIRA-123', from: 10, to: 5, variation: -5},
                   {key: 'JIRA-789', from: 20, to: 0, variation: -20}]
    }}
]

```

### Transitions
You need to study dynamic of status transition in time.

```javascript
 var data = [
    {date: new Date('1995-12-17T03:24:00'), issues: [
        //identical
        {key: 'JIRA-100', status: 'New'},
        {key: 'JIRA-101', status: 'In Progress'},
        {key: 'JIRA-102', status: 'Done'},
        //removed
        {key: 'JIRA-200', status: 'New'},
        {key: 'JIRA-201', status: 'In Progress'},
        {key: 'JIRA-202', status: 'Done'},
        //modified
        {key: 'JIRA-400', status: 'New'},
        {key: 'JIRA-401', status: 'In Progress'},
        {key: 'JIRA-402', status: 'Done'},
        {key: 'JIRA-403', status: 'New'},
        // misc
        {key: 'JIRA-500', status: 'New'}
    ]},
    {date: new Date('1995-12-18T03:24:00'), issues: [
        // identical
        {key: 'JIRA-100', status: 'New'},
        {key: 'JIRA-101', status: 'In Progress'},
        {key: 'JIRA-102', status: 'Done'},
        // added
        {key: 'JIRA-300', status: 'New'},
        {key: 'JIRA-301', status: 'In Progress'},
        {key: 'JIRA-302', status: 'Done'},
        //modified
        {key: 'JIRA-400', status: 'In Progress'},
        {key: 'JIRA-401', status: 'Done'},
        {key: 'JIRA-402', status: 'New'},
        {key: 'JIRA-403', status: 'Done'},
        // misc
        {key: 'JIRA-500', status: 'In Progress'}
    ]}
];

H.transition('issues', 'status').fromArray(data);

// returns
[
    { date: new Date('1995-12-17T03:24:00'), issues: {}},
    { date: new Date('1995-12-18T03:24:00'), issues: {
        New: {
            New: ['JIRA-100'],
            out: ['JIRA-200'],
            'In Progress': ['JIRA-400', 'JIRA-500'],
            Done: ['JIRA-403']
        },
        'In Progress': {
            'In Progress': ['JIRA-101'],
            out: ['JIRA-201'],
            Done: ['JIRA-401']
        },
        'Done': {
            Done: ['JIRA-102'],
            out: ['JIRA-202'],
            New: ['JIRA-402']
        },
        'out': {
            New: ['JIRA-300'],
            'In Progress': ['JIRA-301'],
            Done: ['JIRA-302']
        }
    }}
]
```

#### Counting only
If you are only interested in counting and not in listing what transitionned, then define transition as follow :

```javascript
H.transition('issues', {
    transitionField: 'status',
    count: true
}).fromArray(data);

// returns
[
    { date: new Date('1995-12-17T03:24:00'), issues: {}},
    { date: new Date('1995-12-18T03:24:00'), issues: {
        New: {
            New: 1,
            out: 1,
...

```
#### Filtering
If you are only interested in some of the issues, then define a filter as follow:
```javascript
H.transition('issues', {
    transitionField: 'status',
    filter: function (issue){return issue.type === 'Bug'; }
}).fromArray(data);

```


### Object Flux
In case you need to compute flux on Map like object. In below example, objects to compare have username as key and an array of resources as value.
fluxObj compares key/values of each object and :

  1. when a key is only present in one object, key is considered as added or removed
  2. when a key is present in both objects, key is considered as identical or modified, depending of the comparison of their respective value..


```javascript
 var reports = [
    {date: new Date('1995-12-17T03:24:00'), schemas: { user1: ['a'], user2: ['b'] }},
    {date: new Date('1995-12-18T03:24:00'), schemas: { user1: ['a'], user3: ['c'] }},
    {date: new Date('1995-12-20T03:24:00'), schemas: { user1: ['b'], user2: ['b'], user3: ['c'] }}
];

H.fluxObj('schemas').fromArray(reports);

//returns
[
    {date: new Date('1995-12-17T03:24:00'), schemas: {added: [], removed: [], identical: [], modified: []}},
    {date: new Date('1995-12-18T03:24:00'), schemas: {added: ['user3'], removed: ['user2'], identical: ['user1'], modified: []}},
    {date: new Date('1995-12-20T03:24:00'), schemas: {added: ['user2'], removed: [], identical: ['user3'], modified: ['user1']}}
]
```
As standard flux, it is possible to use custom function to access objects to be compared.

### Timeserie
Timeserie is a convenient way extract one property but also to proceed to some computations, like consolidation.

```javascript
var H = require('history-trend'),
    reports = [
    {date: new Date('1995-12-17T03:24:00'), sessions: 100, disk: {free: 2000, used: 1000}},
    {date: new Date('1995-12-18T03:24:00'), sessions: 110, disk: {free: 1500, used: 1500}},
    {date: new Date('1995-12-20T03:24:00'), sessions: 120, disk: {free: 1000, used: 2000}}
];
H.timeserie('sessions').fromArray(reports);

// returns
[
    { date: new Date('1995-12-17T03:24:00'), sessions: 100},
    { date: new Date('1995-12-18T03:24:00'), sessions: 110},
    { date: new Date('1995-12-20T03:24:00'), sessions: 120}
]
```
It is possible to access nested properties :

```javascript
H.timeserie('disk.used').fromArray(reports)
// returns
[
    {date: new Date('1995-12-17T03:24:00'), used: 1000},
    {date: new Date('1995-12-18T03:24:00'), used: 1500},
    {date: new Date('1995-12-20T03:24:00'), used: 2000}
]
```

And, it is possible to use any function that operates on a report :
```javascript
 function diskUsageRatio(report) {
    return report.disk.used / (report.disk.free + report.disk.used);
}

H.timeserie(diskUsageRatio).fromArray(reports);

// returns
[
    { date: new Date('1995-12-17T03:24:00'), diskUsageRatio: 0.3333333333333333},
    { date: new Date('1995-12-18T03:24:00'), diskUsageRatio: 0.5},
    { date: new Date('1995-12-20T03:24:00'), diskUsageRatio: 0.6666666666666666}
]
```
Using custom functions is specially convenient when reports are raw and you need to focus on consolidated data.

### Count
Count simply returns length of an array.


### Date Filtering
It is possible to filter dates with any array filter. Here we show an example using [history-when](https://github.com/Jean-Baptiste-Garcia/history-when)

```javascript
var H = require('history-trend'),
    W = require('history-when')();

// only one report per day will be considered (the most recent).
H.timeserie(diskUsageRatio).whereDate(W.daily);
```

### Chaining
It is possible to chain all trends so that several trends can be computed in one call.
```javascript
var H = require('history-trend');

var reports = [
 {date: new Date('2015-12-01T03:24:00'), issues: [{ key: 'JIRA-123', status: 'New', type: 'Feature'}, { key: 'JIRA-456', status: 'In Progress', type: 'Bug'}]},
 {date: new Date('2015-12-02T03:22:00'), issues: [{ key: 'JIRA-123', status: 'In Progress', type: 'Feature'}, { key: 'JIRA-789', status: 'In Progress', type: 'Bug'}]},
 {date: new Date('2015-12-03T03:30:00'), issues: [{ key: 'JIRA-123', status: 'In Progress', type: 'Feature'}, { key: 'JIRA-789', status: 'Done', type: 'Bug'}, { key: 'JIRA-900', type: 'Bug', status: 'Done'}, { key: 'JIRA-901', status: 'Done', type: 'Bug'}]}];

function bugsCount(report) {
    return report.issues.filter(function (item) {return item.type === 'Bug'; }).length;
}

function featuresCount(report) {
    return report.issues.filter(function (item) {return item.type === 'Feature'; }).length;
}

H.timeserie(bugsCount).
  flux('issues').
  timeserie(featuresCount).
  fromArray(reports);

// Returns

[
{date: new Date('2015-12-01T03:24:00'), bugsCount: 1, featuresCount: 1, issues: { added: ['JIRA-123', 'JIRA-456'], removed: [], modified: [], identical: []}},
{date: new Date('2015-12-02T03:22:00'), bugsCount: 1, featuresCount: 1, issues: { added: ['JIRA-789'], removed: ['JIRA-456'], modified: ['JIRA-123'], identical: []}},
{date: new Date('2015-12-03T03:30:00'), bugsCount: 3, featuresCount: 1, issues: { added: ['JIRA-900', 'JIRA-901'], removed: [], modified: ['JIRA-789'], identical: ['JIRA-123']}}
]
```


## Using history-store
Using history-store minimizes memory consumption, because reports are streamed to build trends. Furthermore, it is possible to cache trends results.

For more details about stores, please refer to [history-store](https://github.com/Jean-Baptiste-Garcia/history-store).

```javascript
var H = require('history-trend'),
    stores = require('history-store')('../history'),
    store = stores.report('project');
 // trend returns the count of issues over time
 H.count('issues').fromStore(store, function (err, trends){} );
```

### Caching trends
It is possible to cache trends results on file system, so trends computation is made only on new reports and when needed.
It is required to name the trends so that trends are identified on file system.

```javascript
var H = require('history-trend'),
    stores = require('history-store')('../history'),
    store = stores.report('project'),
    // an id is given to myTrends
    myTrends = H.name({id: 'myTrends'}.count('issues').flux('issues'),
    // and myTrends is cached into store
    q = store.cache(myTrends);

// Then to get latest trends
    q.trends(function(err, trends) {});

```


Use Case
---------
**Project management**

You are monitoring a project. You work with daily reports. Each day, you know how many tasks are open or closed. You have an estimation of remaining workload. So each day you have a photo of the project state. But you don't have the whole story. How remaining worklaod behaves over time? Have some new tasks been added, so that it explains why number of open tasks seems to be constant for two weeks? Have tasks been removed? Purpose of history-trend / history-module is to provide a mean to gain visibility over time :
* setup a server to store daily reports
* query reports history with adapted queries

To be continued ...


Test
------------

```bash
$ npm test
```
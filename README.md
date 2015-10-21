history-trend
===============

history-trend computes trends from an history source. Source can be :
* array of versionned reports
* [history-store](https://github.com/Jean-Baptiste-Garcia/history-store)
* stream (using node.js stream.Readable)

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


#### Identification method
By default, when computing flux on object arrays, two objects are said to be identical when

  1. They have same value for *key* property
  2. All others properties have same value

1st condition is called identification method. 2nd condition is equality method. It tells whether objects have been modified or not.

It is possible to change identification method. For instance, if issues are identified by ```id``` property, use :
```javascript
H.flux('issues', {identification: 'id'}).fromArray(reports);
```

#### Custom output
If you focus on movements (added/removed/modified), then you might be only interested in number of identical.

You can define functions to be applied on identical/modified/added/removed before flux returns :
```javascript
H.flux('issues',{
    identical: function (identicals) { return identicals.length; }
 }).fromArray(reports);
// returns
[
 {date: 'Tue Dec 01 2015 04:24:00', issues: { added: [], removed: [], modified: [], identical: 0}},
 {date: 'Wed Dec 02 2015 04:22:00', issues: { added: ['JIRA-789'], removed: ['JIRA-456'], modified: ['JIRA-123'], identical: 0}},
 {date: 'Thu Dec 03 2015 04:30:00', issues: { added: ['JIRA-900', 'JIRA-901'], removed: [], modified: ['JIRA-789'], identical: 1}}
 ]
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
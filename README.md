history-trend
===============

history-trend computes trends from an history source. Source can be :
* in memory array of versionned reports
* streamed (using node.js stream.Readable)

[history-store](https://github.com/Jean-Baptiste-Garcia/history-store) is a streamable file system source.


Installation
------------

To use with node:

```bash
$ npm install history-trend
```

Usage
-----
### Flux
Flux compares two consecutive report versions and returns added/removed/identical/modified. Array or Object can be compared. By default, objects are identified by 'key' property.

As an example, we consider history of issues present in a backlog. One wants to know which issues have been added / removed.

```javascript
 var H = require('history-trend'),
     reports = [
{date: new Date('2015-12-01T03:24:00'), issues: [{ key: 'JIRA-123', status: 'New', type: 'Feature'}, { key: 'JIRA-456', status: 'In Progress', type: 'Bug'}]},
{date: new Date('2015-12-02T03:22:00'), issues: [{ key: 'JIRA-123', status: 'In Progress', type: 'Feature'}, { key: 'JIRA-789', status: 'In Progress', type: 'Bug'}]},
{date: new Date('2015-12-03T03:30:00'), issues: [{ key: 'JIRA-123', status: 'In Progress', type: 'Feature'}, { key: 'JIRA-789', status: 'Done', type: 'Bug'}, { key: 'JIRA-900', type: 'Bug', status: 'Done'}, { key: 'JIRA-901', status: 'Done', type: 'Bug'}]}];

H.flux('issues').data(reports);
// returns
[
 {date: 'Tue Dec 01 2015 04:24:00', issues: { added: ['JIRA-123', 'JIRA-456'], removed: [], modified: [], identical: []}},
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

H.flux(bugs).data(reports);
// returns
[
    {date: new Date('2015-12-01T03:24:00'), bugs: { added: ['JIRA-456'], removed: [], modified: [], identical: []}},
    {date: new Date('2015-12-02T03:22:00'), bugs: { added: ['JIRA-789'], removed: ['JIRA-456'], modified: [], identical: []}},
    {date: new Date('2015-12-03T03:30:00'), bugs: { added: ['JIRA-900', 'JIRA-901'], removed: [], modified: ['JIRA-789'], identical: []}}
]

```
Note that name of trend is function name (bugs in our example). When function is anonymous, then trend is named 'value'.


#### Identification method
By default, when computing flux on object arrays, two objects are said to be identical when

1. They have same key property value
2. All others properties have same value

1st condition is called identification method. 2nd condition tells whether objects have been modified or not.

It is possible to change identification method. For instance, if issues are identified by ```id``` property, use :
```javascript
H.flux('issues', 'id').data(reports);
```

### Timeserie
Timeserie is a convenient way to pick only useful information and even to proceed to some computations, like consolidation.


```javascript
var H = require('history-trend'),
    reports = [
    {date: new Date('1995-12-17T03:24:00'), sessions: 100, disk: {free: 2000, used: 1000}},
    {date: new Date('1995-12-18T03:24:00'), sessions: 110, disk: {free: 1500, used: 1500}},
    {date: new Date('1995-12-20T03:24:00'), sessions: 120, disk: {free: 1000, used: 2000}}
];
H.timeserie('sessions').data(reports);

// returns
[
    { date: new Date('1995-12-17T03:24:00'), sessions: 100},
    { date: new Date('1995-12-18T03:24:00'), sessions: 110},
    { date: new Date('1995-12-20T03:24:00'), sessions: 120}
]
```
It is possible to access nested properties :

```javascript
H.timeserie('disk.used').data(reports)
// returns
[
    {date: new Date('1995-12-17T03:24:00'), used: 1000},
    {date: new Date('1995-12-18T03:24:00'), used: 1500},
    {date: new Date('1995-12-20T03:24:00'), used: 2000}
]
```

And it is possible to use any function that operates on a report :
```javascript
 function diskUsageRatio(report) {
    return report.disk.used / (report.disk.free + report.disk.used);
}

H.timeserie(diskUsageRatio).data(reports);

// returns
[
    { date: new Date('1995-12-17T03:24:00'), diskUsageRatio: 0.3333333333333333},
    { date: new Date('1995-12-18T03:24:00'), diskUsageRatio: 0.5},
    { date: new Date('1995-12-20T03:24:00'), diskUsageRatio: 0.6666666666666666}
]
```
Using custom functions is specially convenient when reports are raw and you focus on consolidated data.

### Count
Count simply returns length of an array.


### Using streams
Any trend can read ```Readable.Stream```. Using stream minimizes memory consumption.

For streamed history source, please refer to [history-store](https://github.com/Jean-Baptiste-Garcia/history-store).

```javascript
var H = require('history-trend'),
    store = require('history-store')('../history'),
    source = store('project');
 // trend returns the count of issues over time
 H.count('issues').data(source.stream(), function (err, trends){} );
```
In principle, any stream will work, provided ```data event``` returns a report.


### Chaining
It is possible to chain all trends so that several trends can be computed in one call.
```javascript
var H = require('history-trend');

H.
    count('issues').
    flux('issues').
    timeserie('workload').
    data(source.stream(), function (err, trends){} );
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
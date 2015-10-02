history-trend
===============

history-trend is an API to compute trends from an history source. There are two types of history sources currently supported :
* in memory array of versionned reports
* streamed (using node.js stream.Readable)

[history-store](https://github.com/Jean-Baptiste-Garcia/history-store) has been specifically developped for that purpose.


Installation
------------

To use with node:

```bash
$ npm install history-trend
```

Then in the console:

```javascript
var H = require('history-trend');
```

Usage
-----
###Flux
Flux compares two consecutive report versions and returns added/removed/identical/modified. Array or Object can be compared. By default, objects are identified by 'key' property.

As an example, we consider history of issues present in a backlog. One wants to know which issues have been added / removed.

```javascript
 var reports = [
            {date: new Date('2015-12-01T03:24:00'), issues: [{ key: 'JIRA-123', status: 'New'}, { key: 'JIRA-456', status: 'In Progress'}]},
            {date: new Date('2015-12-02T03:22:00'), issues: [{ key: 'JIRA-123', status: 'In Progress'}, { key: 'JIRA-789', status: 'In Progress'}]},
            {date: new Date('2015-12-03T03:30:00'), issues: [{ key: 'JIRA-123', status: 'In Progress'}, { key: 'JIRA-789', status: 'Done'}, { key: 'JIRA-900', status: 'Done'}, { key: 'JIRA-901', status: 'Done'}]}];

```
issuing
```javascript
H.flux('issues').data(reports);

```
will return
```javascript
[
 {date: 'Tue Dec 01 2015 04:24:00', issues: { added: ['JIRA-123', 'JIRA-456'], removed: [], modified: [], identical: []}},
 {date: 'Wed Dec 02 2015 04:22:00', issues: { added: ['JIRA-789'], removed: ['JIRA-456'], modified: ['JIRA-123'], identical: []}},
 {date: 'Thu Dec 03 2015 04:30:00', issues: { added: ['JIRA-900', 'JIRA-901'], removed: [], modified: ['JIRA-789'], identical: ['JIRA-123']}}
 ]

```
It is possible to change identification method:

```javascript
H.flux({ name: 'issues',
        // using property 'id' instead of 'key'
        identification: 'id'
       }, data);
```

### Timeserie
Timeserie is a convenient way to pick only useful information and even to proceed to some computations, like consolidation.


```javascript
var data = [
    { date: new Date('1995-12-17T03:24:00'), sessionCount: 100, schemasCount: 10},
    { date: new Date('1995-12-18T03:24:00'), sessionCount: 110, schemasCount: 20},
    { date: new Date('1995-12-20T03:24:00'), sessionCount: 120, schemasCount: 40}
];
H.timeserie('sessionCount').data(data);

// returns
[
    { date: new Date('1995-12-17T03:24:00'), sessionCount: 100},
    { date: new Date('1995-12-18T03:24:00'), sessionCount: 110},
    { date: new Date('1995-12-20T03:24:00'), sessionCount: 120}
]

```

### Count
Count simply returns length of an array.


### Using streams
Any trend can read ```Readable.Stream```. Using stream minimizes memory consumption.

Here is an example when history source is relying on [history-store](https://github.com/Jean-Baptiste-Garcia/history-store).

```javascript
var store = require('history-store')('../history'),
    source = store('project');
 // trend returns the count of issues over time
 H.count('issues').data(source.stream(), function (err, trend) {} );
```
In principle, any stream will work, provided ```data event``` returns a report.


### Chaining
It is possible to chain all trends ...

Test
------------

```bash
$ npm test
```
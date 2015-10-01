history-trend
===============

history-trend is an API to compute trends from an history source. There are two types of history sources currently supported :
* in memory array of versionned reports
* streamed (using node.js stream.Readable)

For streams, you can use one of these modules :
* filesystem storage (use history-fs-store)
* server side memory storage (use history-fs-store)

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


##Flux
Flux compares two versions of an object and returns added/removed/identical/modified. Array or Object can be compared. By default, objects are identified by 'key' property.

As an example, we consider history of issues present in a backlog. One wants to know which issues are added / removed.

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
         identification: 'id' // using property 'id' instead of 'key'
       }, data);
```

## Timeserie
is a convenient way to pick only useful information or even to proceed to some computations.


### Custom function


## Count
convenient

# history-server

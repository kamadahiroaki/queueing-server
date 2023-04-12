# queueing-server
queueing-server is a server to queue jobs. The queueing-server uses a database to store running jobs.

# Prerequisites
- Node.js (newish)
- yarn
- PostgreSQL (newish)

# How to install
```bash
$ git clone git@github.com:kasahara-lab/queueing-server.git
$ cd queueing-server
$ yarn install
```

# How to initialize a server
In the directory where you executed `git clone`, you type:
```bash
$ node.js initializeDB.js
```

# How to launch a server
```bash
$ yarn start
```

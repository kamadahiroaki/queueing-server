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
First, you need to config a PostgreSQL server. We do not explain how to install PostgreSQL server here.
We assume that PostgreSQL is up and running at this time.

First, you need to create a config JSON for specifying the host and the port of PostgreSQL. An example is shown below:

```
{
    "user":"postgres",
    "host":"localhost",
    "database":"mytestdb",
    "password":"postgres",
    "port":5432
}
```

Make sure that this file is not accessible from others. Change the permission of the config file to `600` so others cannot read it.

In the directory where you executed `git clone`, 
```bash
$ node.js initializeDB.js
```

# How to launch a server
```bash
$ yarn start
```

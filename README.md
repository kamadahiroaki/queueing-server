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

Create a new user on PostgreSQL (here we assume that the root user is `mkasa`):

```bash
% psql -U mkasa -h localhost postgres
psql (14.6 (Homebrew))
Type "help" for help.

postgres=# CREATE USER queuemaster;
CREATE ROLE
postgres=# \q
```

Set up a new password for the new user.
```bash
% openssl rand -base64 9 | tr -dc 'a-zA-Z0-9' | cut -c1-12
Zt13D6fbvfeb
% psql -U mkasa -h localhost postgres
psql (14.6 (Homebrew))
Type "help" for help.

postgres=# ALTER ROLE queuemaster WITH PASSWORD 'Zt13D6fbvfeb';
ALTER ROLE
postgres=# \q
```

Next, create a new database.

```bash
% createdb queues -O queuemaster
```

First, you need to create a config JSON for specifying the host and the port of PostgreSQL. An example is shown below:

```
{
    "user":"queuemaster",
    "host":"localhost",
    "database":"queues",
    "password":"Zt13D6fbvfeb",
    "port":5432
}
```

Make sure that this file is not accessible from others. Change the permission of the config file to `600` so others cannot read it.

In the directory where you executed `git clone`, 
```bash
% node.js initializeDB.js
The file permission is 600
Successfully created the queue table
```

# How to launch a server
```bash
$ yarn start
```

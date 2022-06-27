# Dance with me

![release](https://reset.inso.tuwien.ac.at/repo/2022ss-ase-pr-group/22ss-ase-pr-inso-02/-/badges/release.svg)
![pipeline status](https://reset.inso.tuwien.ac.at/repo/2022ss-ase-pr-group/22ss-ase-pr-inso-02/badges/master/pipeline.svg?ignore_skipped=true)
![frontend coverage](https://reset.inso.tuwien.ac.at/repo/2022ss-ase-pr-group/22ss-ase-pr-inso-02/badges/master/coverage.svg)

## Installation

```bash
$ npm install
```

## frontend

### Running the app

```bash
$ npm run withLocalEnv start:client
```

### Test

```bash
# unit tests
$ npm run test -w frontend
```

## backend

### Running the app

```bash
$ npm run withLocalEnv start:server
```

Make sure the MongoDB and the MinIO instances are running.

### Test

```bash
# unit tests
$ npm run test -w backend

# e2e tests
$ npm run test:e2e -w backend

# test coverage
$ npm run test:cov -w backend
```


### SonarQube
Now you need to install the newly added Sonar Scanner with:
```bash
$ npm i
```
For a local run set the values in sonar-project.properties (don't forget to delete them before pushing it to the server)
Now you can start a scan with: 
```bash
$ npm run sonar-scanner
```

The result of the scan can be seen on our sonarserver.

### End to end tests

Start the server and the client. The client needs to run on port 4200. Then you can execute cypress with:

```bash
# with UI
$ npm run cypress:open

# without UI
$ npm run cypress:run
```

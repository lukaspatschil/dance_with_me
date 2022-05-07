# Dance with me

## Installation

```bash
$ npm install
```

## frontend

### Running the app

```bash
# development
$ npm run start -w backend

# production mode
$ npm run build -w backend
```

### Test

```bash
# unit tests
$ npm run test -w backend
```

## backend

### Running the app

```bash
# development
$ npm run start -w backend

# watch mode
$ npm run start:dev -w backend

# production mode
$ npm run start:prod -w backend
```

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






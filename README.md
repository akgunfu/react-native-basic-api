## Introduction

This library is a basic api implementation I used in several hobby projects. Featurewise it is limited as of now, but I will implement extra features when needed.
It can be used in many different javascript projects, it is not only limited to React Native as the name could imply.

## Installation

`npm i react-native-basic-api`

## Usage

`import _api from 'react-native-basic-api';`
\
\
`/* Define your endpoints with available methods */`
\
`const yourEndpoints = ({get, post, put}) => ({`\
&nbsp;&nbsp;&nbsp;&nbsp;`getSomething1: (foo) => get('/endpoint1?foo=${foo}'),`\
&nbsp;&nbsp;&nbsp;&nbsp;`getSomething2: (data) => get('/endpoint2', data),`\
&nbsp;&nbsp;&nbsp;&nbsp;`postSomething1: (data) => post('/endpoint3', data),`\
&nbsp;&nbsp;&nbsp;&nbsp;`putSomething1: (data) => put('/endpoint4', data)`\
`});`
\
\
`/* configure baseUrl, globalHeaders and endpoints */`\
`const apiConfig = {`\
&nbsp;&nbsp;&nbsp;&nbsp;`baseUrl: 'http://someurl.com',`\
&nbsp;&nbsp;&nbsp;&nbsp;`globalHeaders: {},`\
&nbsp;&nbsp;&nbsp;&nbsp;`endpoints: yourEndpoints`\
`}`
\
\
`const api = _api(apiConfig);`
\
\
`/* Either use with promise.then() or async/await */`
\
`/* Promise then() */`\
`api.getSomething1(foo)`\
&nbsp;&nbsp;&nbsp;&nbsp;`.then(response => /* do anything you want with response */)`\
&nbsp;&nbsp;&nbsp;&nbsp;`.catch(e => /* error */)`
\
\
`/* async/await */`\
`try {`\
&nbsp;&nbsp;&nbsp;&nbsp;`const response = await api.postSomething1(data);`\
&nbsp;&nbsp;&nbsp;&nbsp;`/* do anything you want with response */`\
`} catch(e){`\
&nbsp;&nbsp;&nbsp;&nbsp;`/* handle error */`\
`}`

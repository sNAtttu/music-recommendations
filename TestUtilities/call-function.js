const axios = require("axios");

const method = process.argv[2];
const functionName = process.argv[3];

const localBaseUrl = "http://localhost:7071/api";

const url = `${localBaseUrl}/${functionName}`;

const requestOptions = {
    method,
    url,
}
axios(requestOptions).then(response => {
    console.log(response.status);
    console.log(response.data);
});
import axios, { Axios, AxiosRequestConfig } from 'axios';
import { AzureFunction, Context, HttpRequest } from "@azure/functions"

let authToken = "";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('Requesting authentication token');
    const clientId = process.env['SPOTIFY_CLIENT_ID'];
    const clientSecret = process.env['SPOTIFY_CLIENT_SECRET'];


    const serialize = obj => {
        var str = [];
        for (var p in obj) {
            if (obj.hasOwnProperty(p)) {
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
            }
        }
        return str.join("&");
    }

    const authOptions: AxiosRequestConfig = {
        url: 'https://accounts.spotify.com/api/token',
        headers: {
          'Authorization': 'Basic ' + (Buffer.from(clientId + ':' + clientSecret).toString('base64')),
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: {
            grant_type: 'client_credentials'
        }
      };
    
    
    if(authToken) {
        context.log("Using auth token from the cache");
        context.res = {
            // status: 200, /* Defaults to 200 */
            body: { token: authToken }
        };
        context.done();
    }
    else {
        context.log("Auth token not in cache, fetching a new one");
        const authResponse = await axios.post(authOptions.url, serialize(authOptions.data), authOptions);
        if(authResponse.status !== 200) {
            context.res = {
                // status: 200, /* Defaults to 200 */
                body: { statusCode: authResponse.status, message: authResponse.statusText }
            };
            context.done();
        }
        const { access_token } = authResponse.data;
        authToken = access_token;
        context.res = {
            // status: 200, /* Defaults to 200 */
            body: { token: authToken }
        };
        context.done();
    }
};

export default httpTrigger;
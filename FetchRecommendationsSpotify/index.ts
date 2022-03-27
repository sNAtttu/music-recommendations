import axios, { Axios, AxiosRequestConfig } from 'axios';
import { AzureFunction, Context, HttpRequest } from '@azure/functions';

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('Fetching recommendations from the Spotify');
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

    const authResponse = await axios.post(authOptions.url, serialize(authOptions.data), authOptions);

    if(authResponse.status !== 200) {
        context.res = {
            // status: 200, /* Defaults to 200 */
            body: { statusCode: authResponse.status, message: authResponse.statusText }
        };
        context.done();
    }
    const { access_token } = authResponse.data;
    
    const fetchGenresUrl = `https://api.spotify.com/v1/recommendations/available-genre-seeds`;
    const fetchUserConfig: AxiosRequestConfig = {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${access_token}`
        }
    }
    const userResponse = await axios.get(fetchGenresUrl, fetchUserConfig);
    if(userResponse.status !== 200) {
        context.res = {
            // status: 200, /* Defaults to 200 */
            body: { statusCode: authResponse.status, message: authResponse.statusText }
        };
        context.done();
    }
    context.res = { body: JSON.stringify(userResponse.data.genres) }
    context.done();
};

export default httpTrigger;
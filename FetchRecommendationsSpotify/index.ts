import axios, { Axios, AxiosRequestConfig } from 'axios';
import { AzureFunction, Context, HttpRequest } from '@azure/functions';

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('Fetching recommendations from the Spotify');
    const authResponse = await axios.get(process.env["AUTHORIZATION_FUNCTION_URL"]);
    const { token } = authResponse.data;
    
    const fetchGenresUrl = `https://api.spotify.com/v1/recommendations/available-genre-seeds`;
    const fetchUserConfig: AxiosRequestConfig = {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
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
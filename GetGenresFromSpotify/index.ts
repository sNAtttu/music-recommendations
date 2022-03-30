import axios, { AxiosRequestConfig } from 'axios';
import { AzureFunction, Context, HttpRequest } from '@azure/functions';

let genres = null;

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
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

    if(genres) {
        context.log("Returning genres from the cache");
        context.res = { body: JSON.stringify(genres) }
        context.done();
    }
    else {
        context.log("There's no genres in the cache, refreshing from the API");
        const genreResponse = await axios.get(fetchGenresUrl, fetchUserConfig);
        if(genreResponse.status !== 200) {
            context.res = {
                // status: 200, /* Defaults to 200 */
                body: { statusCode: authResponse.status, message: authResponse.statusText }
            };
            context.done();
        }
        genres = genreResponse.data.genres
        context.res = { body: JSON.stringify(genreResponse.data.genres) }
        context.done();
    }
};

export default httpTrigger;
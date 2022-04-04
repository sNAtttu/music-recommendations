import axios, { AxiosRequestConfig } from 'axios';
import { AzureFunction, Context, HttpRequest } from "@azure/functions"

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    const authResponse = await axios.get(process.env["AUTHORIZATION_FUNCTION_URL"]);
    const { token } = authResponse.data;
    const fetchRecommendationsUrl = `https://api.spotify.com/v1/recommendations`;
    const fetchRecommendationsConfig: AxiosRequestConfig = {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    }
    // Genres is a comma separated list of genre-seeds from Spotify API.
    // Example: black-metal,classic
    const { genres } = req.query;
    const recommendationLimit = 1;
    const morePopularMinValue = 40;
    const lessPopularMaxValue = 25;
    context.log(`Fetching recommendations for following genres: ${genres}`);
    const firstRecommendationUrl = `${fetchRecommendationsUrl}?limit=${recommendationLimit}&seed_genres=${genres}&min_popularity=${morePopularMinValue}`;
    const recommendationResponse = await axios.get(firstRecommendationUrl, fetchRecommendationsConfig);

    const secondRecommendationUrl = `${fetchRecommendationsUrl}?limit=${recommendationLimit}&seed_genres=${genres}&max_popularity=${lessPopularMaxValue}`;
    const secondRecommendationResponse = await axios.get(secondRecommendationUrl, fetchRecommendationsConfig);

    recommendationResponse.data.tracks.push(secondRecommendationResponse.data.tracks[0]);

    context.res = {
        // status: 200, /* Defaults to 200 */
        body: JSON.stringify(recommendationResponse.data)
    };

};

export default httpTrigger;
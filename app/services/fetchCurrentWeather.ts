export type WeatherCoordinates = {
    latitude: number;
    longitude: number;
};

export type CurrentWeatherResponse = {
    name: string;
    main: {
        temp: number;
        feels_like: number;
    };
    weather?: Array<{
        main: string;
        description: string;
    }>;
};

const fetchCurrentWeather = async ({ latitude, longitude }: WeatherCoordinates): Promise<CurrentWeatherResponse | null> => {
    try {
        const baseURL = "https://api.openweathermap.org/data/2.5/weather"
        const apiKEY = "501aceb8678c91e34844425353a963f4"
        const requestURL = new URL(baseURL);

        requestURL.searchParams.set("lat", latitude.toString());
        requestURL.searchParams.set("lon", longitude.toString());
        requestURL.searchParams.set("appid", apiKEY);
        requestURL.searchParams.set("units", "metric");

        const res = await fetch(requestURL.toString());
        if (!res.ok) {
            throw new Error('Failed to fetch.');
        }

        console.log('Service Request URL:', requestURL.toString());

        const data = (await res.json()) as CurrentWeatherResponse;
        console.log('Service Response:', data);

        return data;
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('Service Error:', message);
        return null;
    }

}

export default fetchCurrentWeather
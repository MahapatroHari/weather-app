export type ReverseGeocodeAddress = {
    neighbourhood?: string;
    quarter?: string;
    suburb?: string;
    city_district?: string;
    hamlet?: string;
    village?: string;
    town?: string;
    city?: string;
    municipality?: string;
    postcode?: string;
};

type ReverseGeocodeResponse = {
    display_name?: string;
    address?: ReverseGeocodeAddress;
};

type WeatherCoordinates = {
    latitude: number;
    longitude: number;
};

const pickFirstNonEmpty = (...values: Array<string | undefined>): string | undefined => {
    return values.find((value) => Boolean(value?.trim()));
};

const formatLocationName = (address?: ReverseGeocodeAddress, fallbackName?: string) => {
    if (!address) {
        return fallbackName;
    }

    const neighbourhood = pickFirstNonEmpty(
        address.neighbourhood,
        address.quarter,
        address.suburb,
        address.city_district,
        address.hamlet,
        address.village,
        address.town,
        address.municipality,
        address.city,
    );
    const postcode = pickFirstNonEmpty(address.postcode);
    const city = pickFirstNonEmpty(address.city, address.town, address.village, address.municipality);

    return [neighbourhood, postcode, city].filter(Boolean).join(' - ') || fallbackName;
};

const fetchLocationName = async ({ latitude, longitude }: WeatherCoordinates): Promise<string | null> => {
    try {
        const requestURL = new URL('https://nominatim.openstreetmap.org/reverse');

        requestURL.searchParams.set('lat', latitude.toString());
        requestURL.searchParams.set('lon', longitude.toString());
        requestURL.searchParams.set('format', 'json');

        const res = await fetch(requestURL.toString(), {
            headers: {
                'Accept-Language': 'en',
            },
        });

        if (!res.ok) {
            throw new Error('Failed to fetch location name.');
        }

        const data = (await res.json()) as ReverseGeocodeResponse;
        return formatLocationName(data.address, data.display_name) ?? null;
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('Location Service Error:', message);
        return null;
    }
};

export default fetchLocationName;
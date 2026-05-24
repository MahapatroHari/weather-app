export type User = {
    id: number;
    name: string;
};

async function fetchUsers(): Promise<User[] | null> {
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/users');

        if (!response.ok) {
            throw new Error('Failed to fetch users from the server.');
        }

        const data = (await response.json()) as User[];
        return data;

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('Service Error:', message);
        // If an error happens, we return null so our UI knows there is no data
        return null;
    }
}

export default fetchUsers;
async function fetchUsers() {
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/users');

        if (!response.ok) {
            throw new Error('Failed to fetch users from the server.');
        }

        const data = await response.json();
        return data;

    } catch (error: any) {
        console.error('Service Error:', error.message);
        // If an error happens, we return null so our UI knows there is no data
        return null;
    }
}

export default fetchUsers;
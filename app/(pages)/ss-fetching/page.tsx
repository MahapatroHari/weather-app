import fetchUsers, { type User } from "@/app/services/userService";

const page = async () => {
    const users = await fetchUsers();

    if (!users) {
        return <p>⚠️ Could not load users. Please try again later.</p>;
    }

    return (
        <main>
            <h2>User Directory</h2>
            <ul>
                {users.map((user: User) => (
                    <li key={user.id}>{user.name}</li>
                ))}
            </ul>
        </main>
    );
}

export default page
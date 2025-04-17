export interface User {
  id: number;
  username: string;
  email: string;
}

let users: User[] = [
  { id: 1, username: "admin", email: "admin@plux.com" },
  { id: 2, username: "user1", email: "user1@plux.com" },
];

// 模拟异步 API
export const getUsers = (): Promise<User[]> => {
  return Promise.resolve([...users]);
};

export const addUser = (user: Omit<User, "id">): Promise<User> => {
  const newUser = { ...user, id: Date.now() };
  users.push(newUser);
  return Promise.resolve(newUser);
};

export const updateUser = (id: number, user: Omit<User, "id">): Promise<User> => {
  users = users.map(u => (u.id === id ? { ...u, ...user } : u));
  return Promise.resolve({ id, ...user });
};

export const deleteUser = (id: number): Promise<void> => {
  users = users.filter(u => u.id !== id);
  return Promise.resolve();
};
import React, { createContext, useContext, useEffect, useState } from "react";
import * as userApi from "../api/user";

interface UserContextProps {
  users: userApi.User[];
  loading: boolean;
  fetchUsers: () => void;
  addUser: (user: Omit<userApi.User, "id">) => Promise<void>;
  updateUser: (id: number, user: Omit<userApi.User, "id">) => Promise<void>;
  deleteUser: (id: number) => Promise<void>;
}

const UserContext = createContext<UserContextProps | null>(null);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<userApi.User[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = () => {
    setLoading(true);
    userApi.getUsers().then(data => {
      setUsers(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const addUser = async (user: Omit<userApi.User, "id">) => {
    await userApi.addUser(user);
    fetchUsers();
  };

  const updateUser = async (id: number, user: Omit<userApi.User, "id">) => {
    await userApi.updateUser(id, user);
    fetchUsers();
  };

  const deleteUser = async (id: number) => {
    await userApi.deleteUser(id);
    fetchUsers();
  };

  return (
    <UserContext.Provider value={{ users, loading, fetchUsers, addUser, updateUser, deleteUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserStore = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUserStore must be used within UserProvider");
  return ctx;
};
import useSWR from "swr";
import { fetcher } from "../utils/swrFetcher";
import FullScreenSpinner from "../shared/components/FullScreenSpinner";

const Users = () => {
  const {
    data: users,
    isLoading,
    error,
  } = useSWR("users", () => fetcher("/users/users"), {
    shouldRetryOnError: false,
    errorRetryCount: 0,
    revalidateOnFocus: false,
  });
  if (isLoading) {
    return <FullScreenSpinner />;
  }
  if (error) {
    return <div>Error: {error.message}</div>;
  }
  return (
    <div>
      <h1>Users</h1>
      <div>
        <h2>Users</h2>
      </div>
    </div>
  );
};

export default Users;

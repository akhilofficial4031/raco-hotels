import { useSearchParams } from "react-router";

export const useQueryParams = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const setQueryParams = (params: Record<string, string>) => {
    const newSearchParams = new URLSearchParams(searchParams);
    for (const key in params) {
      if (params[key]) {
        newSearchParams.set(key, params[key]);
      } else {
        newSearchParams.delete(key);
      }
    }
    setSearchParams(newSearchParams);
  };

  return {
    queryParams: searchParams,
    setQueryParams,
  };
};

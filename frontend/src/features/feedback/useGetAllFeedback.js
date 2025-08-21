import { useQuery } from "@tanstack/react-query";
import { getAllFeedback } from "../../services/feedbackApi";

export const useGetAllFeedback = (options = {}) => {
  const {
    isLoading,
    data: feedbackData,
    error,
    refetch,
    isError,
    isFetching,
  } = useQuery({
    queryKey: ["feedback", options],
    queryFn: () => getAllFeedback(options),
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  return {
    isLoading,
    feedbackData: feedbackData || [],
    error,
    refetch,
    isError,
    isFetching,
  };
};

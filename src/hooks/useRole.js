import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "./useAxiosSecure";
import { useAuth } from "./useAuth";

export const useRole = () => {
  const { user, loading } = useAuth();
  const axiosSecure = useAxiosSecure();

  const { data, isPending } = useQuery({
    queryKey: [user?.email, "role"],
    enabled: !loading && !!user?.email,
    queryFn: async () => {
      const res = await axiosSecure.get("/users/my");
      return res.data || {};
    },
  });

  const isRoleLoading = loading || (!!user?.email && isPending);
  const role = data?.role;
  const isVolunteer = !!data?.isVolunteer;

  return [role, isRoleLoading, isVolunteer, null, data];
};

import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";

const SignOutButton = () => {
  const { logout } = useAuth();
  return (
    <Button
      onClick={logout}
      className="bg-black text-white border border-white rounded-full hover:bg-gray-800"
    >
      Sign Out
    </Button>
  );
};

export default SignOutButton;

import { useLocation } from "react-router";
import { Label } from "../ui/label";
import { Button } from "../ui/button";

export const ErrorPage = () => {
  const loc = useLocation();
  return (
    <div className="h-full w-full flex flex-1 flex-col justify-center align-top items-center space-y-4">
      <Label>
        Page <a className="font-normal">{loc.pathname}</a> could not be found...
      </Label>
      <Button variant={"link"}>RETURN</Button>
    </div>
  );
};

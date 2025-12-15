import { Outlet } from "react-router";
import useIsMobile from "../use-is-mobile";
import { useActiveMachine } from "../machines/active-machine.provider";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { ActivityIcon } from "lucide-react";
import { useEffect, useState } from "react";

const ActiveMachineBanner = () => {
  const { activeMachine } = useActiveMachine();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (activeMachine) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 50);

      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [activeMachine]);

  const transitionClasses = `transition ease-linear duration-300 ${
    isVisible ? "opacity-100 max-h-40" : "opacity-0 max-h-0"
  } overflow-hidden`;

  if (!activeMachine) {
    return null;
  }

  return (
    <div className={transitionClasses}>
      <Alert
        variant={"default"}
        className="rounded-none bg-green-900 text-green-400 outline-green-600"
      >
        <ActivityIcon />
        <AlertTitle>Instance Active</AlertTitle>
        <AlertDescription className="text-green-300">
          {activeMachine.name} at {activeMachine.ip}
        </AlertDescription>
      </Alert>
    </div>
  );
};

export const LayoutPage = () => {
  const { isMobile } = useIsMobile();

  const MobileLayout = () => {
    return (
      <>
        <Outlet />
      </>
    );
  };

  const BigScreenLayout = () => {
    return (
      <>
        <Outlet />
      </>
    );
  };

  /* <div className="flex flex-1 flex-col h-dvh w-dvw overflow-hidden"></div> */
  return (
    <>
      <ActiveMachineBanner />
      {isMobile && <MobileLayout />}
      {!isMobile && <BigScreenLayout />}
    </>
  );
};

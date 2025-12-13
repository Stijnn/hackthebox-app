import { Outlet } from "react-router";
import useIsMobile from "../use-is-mobile";
import { Label } from "../ui/label";

export const LayoutPage = () => {
  const { isMobile } = useIsMobile();

  const MobileLayout = () => {
    return (
      <>
        <Label>Mobile</Label>
        <Outlet />
      </>
    );
  };

  const BigScreenLayout = () => {
    return (
      <>
        <Label>Desktop</Label>
        <Outlet />
      </>
    );
  };

  /* <div className="flex flex-1 flex-col h-dvh w-dvw overflow-hidden"></div> */
  return (
    <>
      {isMobile && <MobileLayout />}
      {!isMobile && <BigScreenLayout />}
    </>
  );
};

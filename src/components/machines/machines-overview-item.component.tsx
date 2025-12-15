import { Machine } from "@/lib/models";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "../ui/item";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { MoreVerticalIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export const MachineOverviewItem = ({ machine }: { machine: Machine }) => {
  return (
    <Item variant={"outline"}>
      <ItemMedia>
        <img src={machine.avatar} className="size-16" />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>{machine.name}</ItemTitle>
        <ItemDescription className="w-full">
          <Badge variant="secondary" className="rounded-none">
            {machine.os}
          </Badge>
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <MoreVerticalIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-40" align="end">
            <DropdownMenuLabel>Instance</DropdownMenuLabel>
            <DropdownMenuGroup>
              <DropdownMenuItem>Launch</DropdownMenuItem>
              <DropdownMenuItem>Launch and Open</DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>Info</DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Open</DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem>Browser</DropdownMenuItem>
                    <DropdownMenuItem>Internal</DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </ItemActions>
    </Item>
  );
};

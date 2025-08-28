import {
  AirplaneTakeOff01Icon,
  BoatIcon,
  Car03Icon,
  ContainerTruck02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

function ModeIcon({
  mode,
}: {
  mode: "SeaFreight" | "AirFreight" | "LandTransport" | "Logistics";
}) {
  switch (mode) {
    case "SeaFreight":
      return <HugeiconsIcon icon={BoatIcon} size="24px" />;
    case "AirFreight":
      return <HugeiconsIcon icon={AirplaneTakeOff01Icon} size="24px" />;
    case "LandTransport":
      return <HugeiconsIcon icon={ContainerTruck02Icon} size="24px" />;
    case "Logistics":
      return <HugeiconsIcon icon={Car03Icon} size="24px" />;
  }
}

export default ModeIcon;

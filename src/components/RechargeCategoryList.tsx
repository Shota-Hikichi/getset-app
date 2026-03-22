// src/components/RechargeCategoryList.tsx

import React from "react";
import type { RechargeSlot } from "../types/recharge";

type Props = {
  slot: RechargeSlot;
};

const RechargeCategoryList: React.FC<Props> = ({ slot }) => {
  if (!slot || !slot.actions) return null;

  return (
    <div>
      {slot.actions.map((action, index) => (
        <div key={index} className="bg-green-100 p-2 my-1 rounded-md shadow">
          {action}
        </div>
      ))}
    </div>
  );
};

export default RechargeCategoryList;

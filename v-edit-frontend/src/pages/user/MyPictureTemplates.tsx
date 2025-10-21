import React from "react";
import { Image } from "lucide-react";
import MyPurchasesTemplate from "./MyPurchasesTemplate";

export default function MyPictureTemplates() {
  return (
    <MyPurchasesTemplate
      title="Picture Templates"
      description="Your purchased picture templates and collections"
      apiEndpoint="/purchases/pictures"
      icon={Image}
      gradient="from-pink-500 to-rose-500"
      itemType="picture"
    />
  );
}

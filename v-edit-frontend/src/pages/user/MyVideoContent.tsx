import React from "react";
import { Video } from "lucide-react";
import MyPurchasesTemplate from "./MyPurchasesTemplate";

export default function MyVideoContent() {
  return (
    <MyPurchasesTemplate
      title="Video Content"
      description="Your purchased video content and collections"
      apiEndpoint="/purchases/video-content"
      icon={Video}
      gradient="from-purple-500 to-indigo-500"
      itemType="video"
    />
  );
}

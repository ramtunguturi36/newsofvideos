import React from "react";
import { Music } from "lucide-react";
import MyPurchasesTemplate from "./MyPurchasesTemplate";

export default function MyAudioContent() {
  return (
    <MyPurchasesTemplate
      title="Audio Content"
      description="Your purchased audio content and collections"
      apiEndpoint="/purchases/audio-content"
      icon={Music}
      gradient="from-orange-500 to-amber-500"
      itemType="audio"
    />
  );
}

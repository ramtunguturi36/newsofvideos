import React from "react";
import { Video } from "lucide-react";
import MyPurchasesTemplate from "./MyPurchasesTemplate";

export default function PurchasedTemplates() {
  return (
    <MyPurchasesTemplate
      title="Video Templates"
      description="Your purchased video templates with QR codes"
      apiEndpoint="/purchases/video-templates"
      icon={Video}
      gradient="from-blue-500 to-cyan-500"
      itemType="template"
    />
  );
}

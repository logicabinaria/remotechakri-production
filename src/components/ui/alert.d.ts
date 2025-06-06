import * as React from "react";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "destructive";
}

export interface AlertTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  // Adding a custom property to make this interface distinct
  asAlertTitle?: boolean;
}

export interface AlertDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  // Adding a custom property to make this interface distinct
  asAlertDescription?: boolean;
}

export declare const Alert: React.FC<AlertProps>;
export declare const AlertTitle: React.FC<AlertTitleProps>;
export declare const AlertDescription: React.FC<AlertDescriptionProps>;

import * as React from "react";
import MuiCard from "@mui/material/Card";
import MuiCardContent from "@mui/material/CardContent";

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <MuiCard ref={ref} variant="outlined" className={className} {...props}>
      {children}
    </MuiCard>
  )
);
Card.displayName = "AdminCard";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <MuiCardContent ref={ref} className={className} {...props}>
      {children}
    </MuiCardContent>
  )
);
CardContent.displayName = "AdminCardContent";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={`flex flex-col space-y-1.5 p-6 ${className ?? ""}`} {...props} />
  )
);
CardHeader.displayName = "AdminCardHeader";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={`flex items-center p-6 pt-0 ${className ?? ""}`} {...props} />
  )
);
CardFooter.displayName = "AdminCardFooter";

const CardTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={`font-semibold leading-none tracking-tight ${className ?? ""}`} {...props} />
  )
);
CardTitle.displayName = "AdminCardTitle";

export { Card, CardContent, CardHeader, CardFooter, CardTitle };

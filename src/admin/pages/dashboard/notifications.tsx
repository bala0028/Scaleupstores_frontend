import React from "react";
import { Card, CardHeader, CardContent } from "@/admin/components/ui/Card";
import { Info, X } from "lucide-react";

const ALERT_COLORS: Record<string, string> = {
  gray: "bg-muted text-foreground",
  green: "bg-green-100 text-green-800 border-green-300",
  orange: "bg-orange-100 text-orange-800 border-orange-300",
  red: "bg-red-100 text-red-800 border-destructive/50",
};

export function Notifications() {
  const [showAlerts, setShowAlerts] = React.useState<Record<string, boolean>>({
    gray: true,
    green: true,
    orange: true,
    red: true,
  });
  const [showAlertsWithIcon, setShowAlertsWithIcon] = React.useState<Record<string, boolean>>({
    gray: true,
    green: true,
    orange: true,
    red: true,
  });
  const alerts = ["gray", "green", "orange", "red"] as const;

  return (
    <div className="mx-auto my-20 flex max-w-screen-lg flex-col gap-8">
      <Card>
        <CardHeader className="p-4">
          <h5 className="text-xl font-semibold text-foreground">Alerts</h5>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 p-4">
          {alerts.map((color) =>
            showAlerts[color] ? (
              <div
                key={color}
                className={`flex items-center justify-between rounded-lg border p-4 ${ALERT_COLORS[color]}`}
              >
                <span>
                  A simple {color} alert with an{" "}
                  <a href="#" className="underline font-medium">
                    example link
                  </a>
                  . Give it a click if you like.
                </span>
                <button
                  onClick={() => setShowAlerts((c) => ({ ...c, [color]: false }))}
                  className="ml-4"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            ) : null
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="p-4">
          <h5 className="text-xl font-semibold text-foreground">Alerts with Icon</h5>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 p-4">
          {alerts.map((color) =>
            showAlertsWithIcon[color] ? (
              <div
                key={color}
                className={`flex items-center justify-between rounded-lg border p-4 ${ALERT_COLORS[color]}`}
              >
                <div className="flex items-center gap-3">
                  <Info strokeWidth={2} className="h-6 w-6" />
                  <span>
                    A simple {color} alert with an{" "}
                    <a href="#" className="underline font-medium">
                      example link
                    </a>
                    . Give it a click if you like.
                  </span>
                </div>
                <button
                  onClick={() => setShowAlertsWithIcon((c) => ({ ...c, [color]: false }))}
                  className="ml-4"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            ) : null
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default Notifications;

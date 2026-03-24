import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SecurityNoticeCard() {
  return (
    <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
      <CardHeader>
        <CardTitle className="text-orange-800 dark:text-orange-200">
          Security Notice
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-orange-700 dark:text-orange-300">
        <ul className="space-y-1">
          <li>• Keep your encryption key safe and secure</li>
          <li>
            • Changing the key will require re-entering encrypted server
            configurations
          </li>
          <li>• Store a backup of your key in a secure location</li>
          <li>• Never share your encryption key with unauthorized persons</li>
        </ul>
      </CardContent>
    </Card>
  );
}

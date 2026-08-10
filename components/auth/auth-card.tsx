import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function AuthCard({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <Card className="ring-foreground/10 shadow-sm">
      <CardHeader className="text-center">
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
      {footer && (
        <p className="px-(--card-spacing) text-center text-sm text-muted-foreground">{footer}</p>
      )}
    </Card>
  );
}

export { AuthCard };

import { getSession } from "@/app/actions/sessions";
import { getCoaches } from "@/app/actions/coaches";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/lib/utils";
import { notFound } from "next/navigation";
import { SessionCoursesClient } from "./client";
import Link from "next/link";
import { ArrowLeft, Calendar, FileText } from "lucide-react";

export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [session, coaches] = await Promise.all([
    getSession(id),
    getCoaches(),
  ]);

  if (!session) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/sessions">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{session.name}</h1>
            <Badge variant={session.isActive ? "success" : "muted"}>
              {session.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {formatDate(session.startDate)} - {formatDate(session.endDate)}
          </p>
        </div>
        <Badge variant="outline" className="text-base px-4 py-2">
          {session.courses.length} cours
        </Badge>
      </div>

      {session.description && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4 text-primary" />
              Description
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{session.description}</p>
          </CardContent>
        </Card>
      )}

      <Separator />

      <SessionCoursesClient 
        session={session} 
        coaches={coaches} 
      />
    </div>
  );
}

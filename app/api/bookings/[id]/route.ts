import { NextRequest } from "next/server";
import { proxyBackendRequest } from "@/lib/backend-proxy";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;

  return proxyBackendRequest(
    request,
    `/bookings/${encodeURIComponent(id)}`,
    "DELETE",
  );
}

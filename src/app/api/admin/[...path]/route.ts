import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { clearSession, refreshAdminSession, setSession } from '@/shared/lib/auth';

async function proxy(request: NextRequest, method: string) {
  const path = request.nextUrl.pathname.replace(/^\/api\/admin/, '/admin');
  const url = `${backendBaseUrl()}${path}${request.nextUrl.search}`;
  const init: RequestInit = {
    method,
    headers: await headersForProxy(request),
    body: method === 'GET' || method === 'HEAD' ? undefined : await request.text(),
    cache: 'no-store',
  };

  let response = await fetch(url, init);
  if (response.status === 401) {
    try {
      const credentials = await refreshAdminSession();
      await setSession(credentials);
      const retryHeaders = await headersForProxy(request, credentials.accessToken);
      response = await fetch(url, { ...init, headers: retryHeaders });
    } catch {
      await clearSession();
      return NextResponse.json(
        { error: { message: 'Your administrator session is no longer valid.' } },
        { status: 401 },
      );
    }
  }

  return forwardResponse(response);
}

async function headersForProxy(request: NextRequest, accessToken?: string) {
  const headers = new Headers();
  const contentType = request.headers.get('content-type');
  if (contentType) headers.set('content-type', contentType);
  headers.set('accept', 'application/json');
  const token = accessToken ?? (await currentAccessToken());
  if (token) headers.set('authorization', `Bearer ${token}`);
  return headers;
}

async function currentAccessToken() {
  return (await cookies()).get(process.env.ADMIN_ACCESS_COOKIE ?? 'admin_access')?.value;
}

function backendBaseUrl() {
  return (process.env.BACKEND_API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000/api/v1').replace(/\/$/, '');
}

async function forwardResponse(response: Response) {
  const text = await response.text();
  const headers = new Headers();
  const contentType = response.headers.get('content-type');
  if (contentType) headers.set('content-type', contentType);
  if (response.status === 204) return new NextResponse(null, { status: 204, headers });
  return new NextResponse(text, { status: response.status, headers });
}

export async function GET(request: NextRequest) { return proxy(request, 'GET'); }
export async function POST(request: NextRequest) { return proxy(request, 'POST'); }
export async function PATCH(request: NextRequest) { return proxy(request, 'PATCH'); }
export async function PUT(request: NextRequest) { return proxy(request, 'PUT'); }
export async function DELETE(request: NextRequest) { return proxy(request, 'DELETE'); }

import type { APIRequestContext, APIResponse } from '@playwright/test'

export async function apiRequest({
  request,
  method,
  url,
  baseUrl,
  body = null,
  headers
}: {
  request: APIRequestContext
  method: 'POST' | 'GET' | 'PUT' | 'DELETE'
  url: string
  baseUrl?: string
  body?: Record<string, unknown> | null
  headers?: Record<string, string>
}): Promise<{ status: number; body: unknown }> {
  let response: APIResponse

  const options: {
    data?: Record<string, unknown> | null
    headers?: Record<string, string>
  } = {}
  if (body) options.data = body
  if (headers) options.headers = headers

  const fullUrl = baseUrl ? `${baseUrl}` : url

  switch (method.toUpperCase()) {
    case 'POST':
      response = await request.post(fullUrl, options)
      break
    case 'GET':
      response = await request.get(fullUrl, { headers })
      break
    case 'PUT':
      response = await request.put(fullUrl, options)
      break
    case 'DELETE':
      response = await request.delete(fullUrl, { headers })
      break
    default:
      throw new Error(`Unsupported HTTP method: ${method}`)
  }

  const bodyJson = await response.json()
  const status = response.status()

  return { status, body: bodyJson }
}

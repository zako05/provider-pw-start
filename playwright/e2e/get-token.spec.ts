import { apiRequest } from '../support/helpers'
import { test, expect } from '../support/fixtures'

test.describe('token acquisition', (): void => {
  test('should get a token', async ({ request }): Promise<void> => {
    const tokenRes = await request.get('/auth/fake-token')
    const tokenResBody = await tokenRes.json()
    const tokenResStatus = tokenRes.status()
    const token = tokenResBody.token

    expect(tokenResStatus).toBe(200)
    expect(token).toEqual(expect.any(String))
  })

  test('should get a token with helper', async ({ request }): Promise<void> => {
    const {
      body: { token },
      status
    } = await apiRequest({
      request,
      method: 'GET',
      url: '/auth/fake-token'
    })

    expect(status).toBe(200)
    expect(token).toEqual(expect.any(String))
  })

  test('should get a token with helper with fixuter', async ({
    apiRequest
  }): Promise<void> => {
    const {
      body: { token },
      status
    } = await apiRequest<{ token: string }>({
      method: 'GET',
      url: '/auth/fake-token'
    })

    expect(status).toBe(200)
    expect(token).toEqual(expect.any(String))
  })
})

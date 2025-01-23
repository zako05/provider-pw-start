import { test as baseApiRequestFixture } from './api-request-fixture'
import type { Movie } from '@prisma/client'
import type { ApiRequestResponse } from './api-request-fixture'

const commonHeaders = (token: string): { Authorization: string } => ({
  Authorization: token
})

type ServerResponse<T> = {
  status: number
  data: T
}
type AddMovieBody = Omit<Movie, 'id'>

export const test = baseApiRequestFixture.extend<{
  addMovie: (
    token: string,
    body: AddMovieBody,
    baseUrl?: string
  ) => Promise<ApiRequestResponse<ServerResponse<Movie>>>
  getAllMovies: (
    token: string,
    baseUrl?: string
  ) => Promise<ApiRequestResponse<ServerResponse<Movie[]>>>
  getMovieById: (
    token: string,
    id: number,
    baseUrl?: string
  ) => Promise<ApiRequestResponse<ServerResponse<Movie>>>
  getMovieByName: (
    token: string,
    name: string,
    baseUrl?: string
  ) => Promise<ApiRequestResponse<ServerResponse<Movie[]>>>
  updateMovie: (
    token: string,
    id: number,
    body: Partial<Movie>,
    baseUrl?: string
  ) => Promise<ApiRequestResponse<ServerResponse<Movie>>>
  deleteMovie: (
    token: string,
    id: number,
    baseUrl?: string
  ) => Promise<ApiRequestResponse<ServerResponse<void>>>
}>({
  addMovie: async ({ apiRequest }, use): Promise<void> => {
    const addMovie = async (
      token: string,
      body: AddMovieBody,
      baseUrl?: string
    ): Promise<ApiRequestResponse<ServerResponse<Movie>>> => {
      return apiRequest<ServerResponse<Movie>>({
        method: 'POST',
        url: '/movie',
        baseUrl,
        body,
        headers: commonHeaders(token)
      })
    }

    await use(addMovie)
  },
  getAllMovies: async ({ apiRequest }, use): Promise<void> => {
    const getAllMovies = async (
      token: string,
      baseUrl?: string
    ): Promise<ApiRequestResponse<ServerResponse<Movie[]>>> => {
      return apiRequest<ServerResponse<Movie[]>>({
        method: 'GET',
        url: '/movies',
        baseUrl,
        headers: commonHeaders(token)
      })
    }

    await use(getAllMovies)
  },
  getMovieById: async ({ apiRequest }, use): Promise<void> => {
    const getMovieById = async (
      token: string,
      id: number,
      baseUrl?: string
    ): Promise<ApiRequestResponse<ServerResponse<Movie>>> => {
      return apiRequest<ServerResponse<Movie>>({
        method: 'GET',
        url: `/movies/${id}`,
        baseUrl,
        headers: commonHeaders(token)
      })
    }

    await use(getMovieById)
  },
  getMovieByName: async ({ apiRequest }, use): Promise<void> => {
    const getMovieByName = async (
      token: string,
      name: string,
      baseUrl?: string
    ): Promise<ApiRequestResponse<ServerResponse<Movie[]>>> => {
      const paramsString = name.toString()
      const queryParams = new URLSearchParams(paramsString)
      const url = `/movies?${queryParams}`

      return apiRequest<ServerResponse<Movie[]>>({
        method: 'GET',
        url,
        baseUrl,
        headers: commonHeaders(token)
      })
    }

    await use(getMovieByName)
  },
  updateMovie: async ({ apiRequest }, use): Promise<void> => {
    const updateMovie = async (
      token: string,
      id: number,
      body: Partial<Movie>,
      baseUrl?: string
    ): Promise<ApiRequestResponse<ServerResponse<Movie>>> => {
      return apiRequest<ServerResponse<Movie>>({
        method: 'PUT',
        url: `/movies/${id}`,
        baseUrl,
        body,
        headers: commonHeaders(token)
      })
    }

    await use(updateMovie)
  },
  deleteMovie: async ({ apiRequest }, use): Promise<void> => {
    const deleteMovie = async (
      token: string,
      id: number,
      baseUrl?: string
    ): Promise<ApiRequestResponse<ServerResponse<void>>> => {
      return apiRequest<ServerResponse<void>>({
        method: 'PUT',
        url: `/movies/${id}`,
        baseUrl,
        headers: commonHeaders(token)
      })
    }

    await use(deleteMovie)
  }
})

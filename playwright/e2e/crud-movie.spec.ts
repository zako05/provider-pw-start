import { test, expect } from '../support/fixtures'
import { generateMovieWithoutId } from '../../src/test-helpers/factories'
import type { Movie } from '@prisma/client'

test.describe('CRUD movie', (): void => {
  const movie = generateMovieWithoutId()
  const updatedMovie = generateMovieWithoutId()
  const movieProps: Omit<Movie, 'id'> = {
    name: movie.name,
    year: movie.year,
    rating: movie.rating,
    director: movie.director
  }
  let token: string

  test.beforeAll(
    'should get a token with helper',
    async ({ apiRequest }): Promise<void> => {
      const {
        body: { token: fetchedToken }
      } = await apiRequest<{ token: string }>({
        method: 'GET',
        url: '/auth/fake-token'
      })

      token = fetchedToken
    }
  )

  test('should crud', async ({
    addMovie,
    getAllMovies,
    getMovieById,
    getMovieByName,
    updateMovie,
    deleteMovie
  }): Promise<void> => {
    // add a movie
    const { body: createResponse, status: createStatus } = await addMovie(
      token,
      movie
    )
    const movieId = createResponse.data.id

    expect(createStatus).toBe(200)
    expect(createResponse).toMatchObject({
      status: 200,
      data: { ...movieProps, id: movieId }
    })

    // get all movies
    const { body: getAllResponse, status: getAllStatus } =
      await getAllMovies(token)
    expect(getAllStatus).toBe(200)
    expect(getAllResponse).toMatchObject({
      status: 200,
      data: expect.arrayContaining([
        expect.objectContaining({ id: movieId, name: movie.name })
      ])
    })

    // get the movie by ID
    const { body: getByIdResponse, status: getByIdStatus } = await getMovieById(
      token,
      movieId
    )

    expect(getByIdStatus).toBe(200)
    expect(getByIdResponse).toMatchObject({
      status: 200,
      data: { ...movieProps, id: movieId }
    })

    // get the movie by name
    const { body: getByNameResponse, status: getByNameStatus } =
      await getMovieByName(token, movie.name)

    expect(getByNameStatus).toBe(200)
    expect(getByNameResponse).toMatchObject({
      status: 200,
      data: [{ ...movieProps, id: movieId }]
    })

    // update the movie
    const { body: updatedResponse, status: updatedStatus } = await updateMovie(
      token,
      movieId,
      updatedMovie
    )

    expect(updatedStatus).toBe(200)
    expect(updatedResponse).toMatchObject({
      status: 200,
      data: {
        name: updatedMovie.name,
        year: updatedMovie.year,
        rating: updatedMovie.rating,
        director: updatedMovie.director,
        id: movieId
      }
    })

    // delete the movie
    const { status: deleteStatus, body: message } = await deleteMovie(
      token,
      movieId
    )

    expect(deleteStatus).toBe(200)
    expect(message).toMatchObject({
      message: `Movie ${movieId} has been deleted`,
      status: 200
    })

    // verify the movie no longer exists
    const { body: allMoviesAfterDelete } = await getAllMovies(token)
    expect(allMoviesAfterDelete).toMatchObject({
      status: 200,
      data: expect.not.arrayContaining([
        expect.objectContaining({ id: movieId })
      ])
    })

    //attempt to delete the non-existing movie
    const { status: deleteNonExistentStatus, body: deleteNonExistentBody } =
      await deleteMovie(token, movieId)

    expect(deleteNonExistentStatus).toBe(404)
    expect(deleteNonExistentBody).toMatchObject({
      error: `Movie with ID ${movieId} not found`
    })
  })
})

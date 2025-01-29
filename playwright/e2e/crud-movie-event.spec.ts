import { test, expect } from '../support/fixtures'
import { runCommand } from '../utils/run-command'
import { generateMovieWithoutId } from '../../src/test-helpers/factories'
import { parseKafkaEvent } from '../support/parse-kafka-event'
import { recurseWithExpect } from '../utils/recurse-with-expect'
import type { Movie } from '@prisma/client'

test.describe('CRUD movie', (): void => {
  const movie = generateMovieWithoutId()
  const updatedMovie = generateMovieWithoutId()
  let token: string

  const movieProps: Omit<Movie, 'id'> = {
    name: movie.name,
    year: movie.year,
    rating: movie.rating,
    director: movie.director
  }

  const movieEventProps = {
    name: expect.any(String),
    year: expect.any(Number),
    rating: expect.any(Number),
    director: expect.any(String)
  }

  test.beforeAll(
    'should get a token with helper',
    async ({ apiRequest }): Promise<void> => {
      const responseCode = runCommand(
        `curl -s -o /dev/null -w "%{http_code}" ${process.env.KAFKA_UI_URL}`
      )
      if (responseCode !== '200') {
        test.skip()
      }

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

    await recurseWithExpect(
      async (): Promise<void> => {
        const topic = 'movie-created'
        const event = await parseKafkaEvent(movieId, topic)

        expect(event).toEqual([
          {
            topic,
            key: String(movieId),
            movie: {
              id: movieId,
              ...movieEventProps
            }
          }
        ])
      },
      { timeout: 10000, interval: 5000 }
    )

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

    await recurseWithExpect(
      async (): Promise<void> => {
        const topic = 'movie-updated'
        const event = await parseKafkaEvent(movieId, topic)

        expect(event).toEqual([
          {
            topic,
            key: String(movieId),
            movie: {
              id: movieId,
              ...movieEventProps
            }
          }
        ])
      },
      { timeout: 10000, interval: 5000 }
    )

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

    await recurseWithExpect(
      async (): Promise<void> => {
        const topic = 'movie-deleted'
        const event = await parseKafkaEvent(movieId, topic)

        expect(event).toEqual([
          {
            topic,
            key: String(movieId),
            movie: {
              id: movieId,
              ...movieEventProps
            }
          }
        ])
      },
      { timeout: 10000, interval: 5000 }
    )

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

// all Kafka events are logged to a file, so we can somewhat verify them
// in the real world, you might check db, other services, or any other external side effects

import { promises as fs } from 'fs'
import type { MovieEvent, MovieAction } from '../../src/@types'
import { logFilePath } from '../../src/events/log-file-path'

const reshape = (entry: MovieEvent) => ({
  topic: entry.topic,
  key: entry.messages[0]?.key,
  movie: JSON.parse(entry.messages[0]?.value as unknown as string)
})

// missing type
const filterByTopicAndId = (
  movieId: number,
  topic: string,
  entries: ReturnType<typeof reshape>[]
) =>
  entries.filter(
    (entry) => entry.topic === topic && entry.movie?.id === movieId
  )

// missing type
export const parseKafkaEvent = async (
  movieId: number,
  topic: `movie-${MovieAction}`,
  filePath = logFilePath
) => {
  try {
    // read and proces the Kafka log file
    const fileContent = await fs.readFile(filePath, 'utf-8')
    const entries = fileContent
      .trim()
      .split('\n')
      .map((line) => JSON.parse(line))
      .map(reshape)

    // filter the entries by topic and movie ID
    return filterByTopicAndId(movieId, topic, entries)
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error parsing Kafka event log: ${error.message}`)
    } else {
      console.error('An unknown error occured')
    }
    throw error
  }
}

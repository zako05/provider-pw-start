import { test as base, mergeTests } from '@playwright/test'
import { test as apiRequestFixture } from './api-request-fixture'

const test = mergeTests(apiRequestFixture)
const expect = base.expect

export { test, expect }

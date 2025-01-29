import { test as base, mergeTests } from '@playwright/test'
import { test as apiRequestFixture } from './api-request-fixture'
import { test as crudHelperFixtures } from './crud-helper-fixutre'

const test = mergeTests(base, apiRequestFixture, crudHelperFixtures)
const expect = base.expect

export { test, expect }

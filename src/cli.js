#!/usr/bin/env node

import commander from 'commander'
import Table from 'cli-table'

import probe from './probe'
import { version as packageJsonVersion } from '../package.json'

const outputAsTable = (results, partialMatches) => {
  const table = new Table()
  results.forEach(({ repositoryName, version, lastEdit }) => {
    table.push([
      repositoryName,
      partialMatches ? JSON.stringify(version, null, ' ') : version,
      lastEdit,
    ])
  })

  console.log(table.toString())
  console.log(`Total: ${results.length}`)
}

const outputAsJson = results => {
  console.log(JSON.stringify(results))
}

commander
  .option('--access-token <token>', 'Github personal access token')
  .option('--search-term <term>', 'Search term')
  .option('--exclude <repositories>', 'Exclude repositories by these names. Comma-separated.')
  .option('--owner <owner>', 'Owner or organization to search.')
  .option('--json', 'Output results as json. Default output is a table.')
  .option('--partial-matches', 'Return results for partial matches of the search term.')
  .option('--stub', 'Turn on response stubs for testing.')

commander.version(packageJsonVersion).parse(process.argv)

const run = async () => {
  const { accessToken, exclude, json, owner, partialMatches, searchTerm, stub } = commander

  const results = await probe({
    accessToken,
    exclude,
    owner,
    partialMatches,
    searchTerm,
    stub,
  })

  if (json) {
    outputAsJson(results)
  } else {
    outputAsTable(results, partialMatches)
  }
}

run()

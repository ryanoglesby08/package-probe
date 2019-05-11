#!/usr/bin/env node

import commander from 'commander'
import Table from 'cli-table'

import probe from './probe'

commander
  .option('--access-token <token>', 'Github personal access token')
  .option('--exclude <repositories>', 'exclude repositories by these names (comma-separated)')
  .option('--json', 'output results as json (default output is a table)', false)
  .option('--owner <owner>', 'owner or organization to search')
  .option('--partial-matches', 'return results for partial matches of the search term', false)
  .option('--search-term <term>', 'search term')
  .option('--stub', 'turn on response stubs for testing', false)

commander.parse(process.argv)

if (process.argv.slice(2).length == 0) {
  commander.help()
}

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

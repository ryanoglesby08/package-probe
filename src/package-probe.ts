#!/usr/bin/env node

import { program } from 'commander'
import Table from 'cli-table'
import isEmpty from 'lodash/isEmpty'

import probe, { MatchResult } from './probe'
import { version as packageVersion } from '../package.json'

program
  .option('--json', 'output results as json (default output is a table)', false)
  .option('--owner <owner>', 'Github owner/organization to scan (required)')
  .option('--partial-matches', 'return results for partial matches of the search term', false)
  .option('--search-term <searchTerm>', 'search term (required)')

program.version(packageVersion).parse(process.argv)

if (process.argv.slice(2).length == 0) {
  program.help()
}

const options = program.opts()

if (isEmpty(options.searchTerm)) {
  console.error('error: option `--search-term <searchTerm>` is required')
  process.exit(1)
}
if (isEmpty(options.owner)) {
  console.error('error: option `--owner <owner>` is required')
  process.exit(1)
}

const outputAsTable = (results: MatchResult[], partialMatches: boolean): void => {
  if (isEmpty(results)) {
    console.log('✨ No matches.')
    return
  }

  const table = new Table({ head: ['Repository name', 'Package/app name', 'Version'] })
  results.forEach(({ repositoryName, packageName, version }) => {
    const versionOutput = partialMatches ? JSON.stringify(version, null, ' ') : version

    table.push([repositoryName, packageName, versionOutput])
  })

  console.log(`✨ Found ${results.length} matches!`)
  console.log(table.toString())
}

const outputAsJson = (results: MatchResult[]): void => {
  console.log(JSON.stringify(results))
}

const run = async (): Promise<void> => {
  const { json, owner, partialMatches, searchTerm } = options

  if (!json) {
    console.log('🛰️  Scanning...')
  }

  let results: MatchResult[] = []
  try {
    results = await probe({
      accessToken: process.env.GITHUB_TOKEN || process.env.GH_TOKEN,
      owner,
      partialMatches,
      searchTerm,
    })
  } catch (e) {
    console.error(e)
    process.exit(1)
  }

  if (json) {
    outputAsJson(results)
  } else {
    outputAsTable(results, partialMatches)
  }
}

run()

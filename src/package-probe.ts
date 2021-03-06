#!/usr/bin/env node

import commander from 'commander'
import Table from 'cli-table'
import { isEmpty } from 'lodash'

import probe, { MatchResult } from './probe'
// @ts-ignore
import { version as packageVersion } from '../package.json'

commander
  .option('--json', 'output results as json (default output is a table)', false)
  .option('--owner <owner>', 'Github owner/organization to scan (required)')
  .option('--partial-matches', 'return results for partial matches of the search term', false)
  .option('--search-term <searchTerm>', 'search term (required)')

commander.version(packageVersion).parse(process.argv)

if (process.argv.slice(2).length == 0) {
  commander.help()
}

if (isEmpty(commander.searchTerm)) {
  console.error('error: option `--search-term <searchTerm>` is required')
  process.exit(1)
}
if (isEmpty(commander.owner)) {
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
  const { json, owner, partialMatches, searchTerm } = commander

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

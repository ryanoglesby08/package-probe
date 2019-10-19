# Package Probe 🛰

[![npm version](https://img.shields.io/npm/v/package-probe.svg)](https://www.npmjs.com/package/package-probe)
[![Build Status](https://api.travis-ci.org/ryanoglesby08/package-probe.svg)](https://travis-ci.org/ryanoglesby08/package-probe)<br />
[![semantic release enabled](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/ryanoglesby08/package-probe)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/) [![Greenkeeper badge](https://badges.greenkeeper.io/ryanoglesby08/package-probe.svg)](https://greenkeeper.io/)

Scan a Github organization for usage of a package.

Package Probe can help you answer questions such as "Which repositories in my organization are using React?" or "Which version of internal dependency X are my organization's projects using?"

## Installation

```bash
$ npm install -g package-probe
```

## Set up (one time)

Package Probe uses the Github API to scan for a package. If you want to search in a private Github organization, you'll need to create a Github Personal Access Token that has access to your organization and set it as an environment variable when running `package-probe`.

If you are scanning public organizations/owners, you can skip this step.

- Generate a [Github Personal access token](https://github.com/settings/tokens) in your Github profile developer settings
- Grant the `repo` scope to the token (_Package Probe reads information and does not store any of your data_)
- Add it to your environment as `GITHUB_TOKEN` or `GH_TOKEN`. (e.g. `export GITHUB_TOKEN=<your token>`)

## Command line usage

```bash
$ package-probe --help

  Usage: package-probe [options]

  Options:
    --json                        output results as json (default output is a table)
    --owner <owner>               Github owner/organization to scan (required)
    --partial-matches             return results for partial matches of the search term
    --search-term <searchTerm>    search term (required)
    -V, --version                 output the version number
    -h, --help                    output usage information
```

Package probe will automatically use a Github Personal Access Token defined in the `GITHUB_TOKEN` or `GH_TOKEN` environment variable.

## Advanced usage

While the CLI provides quick use, you have more control through the advanced options available in the JavaScript interface.

### JavaScript API

`probe(options)`

```ts
type Options = {
  // Github Personal Access Token. Only necessary if scanning a private organization/owner.
  accessToken?: string,
  // Function that adds fields to return along with the repository name and matched version
  appendFieldsToOutput: AppendFieldsToOutputFunction
  // Don't return results that match ANY of the provided filter functions
  exclude?: RepoFilterFunction[]
  // Only return results that match ALL the provided filter functions
  include?: RepoFilterFunction[],
  // The Github owner or organization to search in
  owner: string,
  // **Required**. If true, will match packages that partially match the provided search term. Otherwise, only exact matches will be returned. This option can be used to search for multiple packages that follow a naming schema.
  partialMatches?: boolean,
  // **Required**. The package name to search for. Must be the full name of the package, including the owner, unless you use the `partialMatches` option.
  searchTerm: string
}

// See Github REST API documentation (https://developer.github.com/v3/repos/#get) for available fields
type RepoFilterFunction = (githubRepo: Octokit.ReposGetResponse) => boolean

// See Github REST API documentation (https://developer.github.com/v3/repos/#get) for available fields
type AppendFieldsToOutputFunction = (githubRepo: Octokit.ReposGetResponse) => { [fieldName: string]: any }
```

### Recipes

#### Scan for an private package

```ts
import probe from 'package-probe'

const accessToken = process.env.GITHUB_TOKEN

const results = await probe({
  accessToken,
  owner: 'my-company',
  searchTerm: '@my-company/my-package',
})

console.log(results)
```

#### Exclude archived repositories

```ts
const isArchived = (githubRepo: Octokit.ReposGetResponse) => githubRepo.archived

const results = await probe({
  accessToken: '...',
  owner: 'my-company',
  searchTerm: '@my-company/my-package',
  exclude: [isArchived],
})
```

#### Add the last commit and description to the output

```ts
const appendFieldsToOutput = (githubRepo: Octokit.ReposGetResponse) => ({
  description: githubRepo.description,
  lastCommit: new Date(githubRepo.pushed_at).toLocaleDateString(),
})

const results = await probe({
  accessToken: '...',
  owner: 'my-company',
  searchTerm: '@my-company/my-package',
  appendFieldsToOutput,
})
```

## Example CLI search results

Searching my Github repositories for usage of React.

```bash
$ package-probe --search-term react --owner ryanoglesby08
🛰️  Scanning...
✨ Found 15 matches!
┌──────────────────────────────────┬──────────────────────────────────┬─────────────────┐
│ Repository name                  │ Package/app name                 │ Version         │
├──────────────────────────────────┼──────────────────────────────────┼─────────────────┤
│ the-eod-machine                  │ @the-eod-machine/ui              │ ^16.4.1         │
├──────────────────────────────────┼──────────────────────────────────┼─────────────────┤
│ movie-night                      │ movie-night                      │ ^16.7.0-alpha.2 │
├──────────────────────────────────┼──────────────────────────────────┼─────────────────┤
│ email-autocomplete               │ email-autocomplete               │ ^16.5.2         │
├──────────────────────────────────┼──────────────────────────────────┼─────────────────┤
│ exposing-css-hidden-complexities │ exposing-css-hidden-complexities │ ^16.1.1         │
├──────────────────────────────────┼──────────────────────────────────┼─────────────────┤
│ splitit                          │ splitit                          │ ^15.3.2         │
├──────────────────────────────────┼──────────────────────────────────┼─────────────────┤
│ react-dashboard                  │ react-bare-app                   │ ^15.5.4         │
├──────────────────────────────────┼──────────────────────────────────┼─────────────────┤
│ react-quizzer                    │ react-quizzer                    │ ^15.1.0         │
├──────────────────────────────────┼──────────────────────────────────┼─────────────────┤
│ ssr-media-queries                │ ssr-media-queries                │ ^16.2.0         │
├──────────────────────────────────┼──────────────────────────────────┼─────────────────┤
│ javascript-workshop              │ react-workshop-webpack           │ ^15.4.1         │
├──────────────────────────────────┼──────────────────────────────────┼─────────────────┤
│ react-bare-app                   │ react-bare-app                   │ ^15.5.4         │
├──────────────────────────────────┼──────────────────────────────────┼─────────────────┤
│ javascript-workshop              │ react-workshop-real-server       │ ^15.4.1         │
├──────────────────────────────────┼──────────────────────────────────┼─────────────────┤
│ javascript-workshop              │ react-workshop-real-server       │ ^15.4.1         │
├──────────────────────────────────┼──────────────────────────────────┼─────────────────┤
│ the-eod-machine                  │ @the-eod-machine/emailer         │ ^16.4.2         │
├──────────────────────────────────┼──────────────────────────────────┼─────────────────┤
│ javascript-workshop              │ react-workshop-real-server       │ ^15.4.1         │
├──────────────────────────────────┼──────────────────────────────────┼─────────────────┤
│ css-playground                   │ js-hide-instead-of-by-class      │ ^15.4.2         │
└──────────────────────────────────┴──────────────────────────────────┴─────────────────┘
```

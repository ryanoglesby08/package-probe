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
    --access-token <accessToken>  Github personal access token
    --exclude <repositories>      exclude repositories by these names (comma-separated)
    --json                        output results as json (default output is a table)
    --owner <owner>               Github owner/organization to scan (required)
    --partial-matches             return results for partial matches of the search term
    --search-term <searchTerm>    search term (required)
    --stub                        turn on response stubs for testing
    -V, --version                 output the version number
    -h, --help                    output usage information
```

Package probe will automatically use a Github Personal Access Token defined in the `GITHUB_TOKEN` or `GH_TOKEN` environment variable.

## JavaScript usage

```js
import probe from 'package-probe'

// Optional. Only necessary if scanning a private organization/owner.
const accessToken = process.env.GITHUB_TOKEN

const results = await probe({
  accessToken,
  owner: 'ryanoglesby08',
  searchTerm: 'react',
})

console.log(results)
```

## Example

Searching my Github repositories for usage of React.

```bash
$ package-probe --search-term react --owner ryanoglesby08
🛰️  Scanning...
✨ Found 15 matches!
┌──────────────────────────────────┬─────────────────┬───────────────────────────────┐
│ Repository name                  │ Version         │ Last edit                     │
├──────────────────────────────────┼─────────────────┼───────────────────────────────┤
│ movie-night                      │ ^16.7.0-alpha.2 │ Tue, 20 Nov 2018 23:31:30 GMT │
├──────────────────────────────────┼─────────────────┼───────────────────────────────┤
│ email-autocomplete               │ ^16.5.2         │ Mon, 24 Sep 2018 00:05:10 GMT │
├──────────────────────────────────┼─────────────────┼───────────────────────────────┤
│ the-eod-machine                  │ ^16.4.1         │ Sat, 04 May 2019 15:42:58 GMT │
├──────────────────────────────────┼─────────────────┼───────────────────────────────┤
│ react-dashboard                  │ ^15.5.4         │ Tue, 06 Jun 2017 00:23:55 GMT │
├──────────────────────────────────┼─────────────────┼───────────────────────────────┤
│ splitit                          │ ^15.3.2         │ Fri, 28 Oct 2016 16:56:33 GMT │
├──────────────────────────────────┼─────────────────┼───────────────────────────────┤
│ exposing-css-hidden-complexities │ ^16.1.1         │ Sat, 18 Nov 2017 17:51:46 GMT │
├──────────────────────────────────┼─────────────────┼───────────────────────────────┤
│ ssr-media-queries                │ ^16.2.0         │ Wed, 14 Feb 2018 15:00:55 GMT │
├──────────────────────────────────┼─────────────────┼───────────────────────────────┤
│ react-quizzer                    │ ^15.1.0         │ Wed, 29 Jun 2016 20:41:09 GMT │
├──────────────────────────────────┼─────────────────┼───────────────────────────────┤
│ javascript-workshop              │ ^15.4.1         │ Tue, 07 Feb 2017 00:28:22 GMT │
├──────────────────────────────────┼─────────────────┼───────────────────────────────┤
│ javascript-workshop              │ ^15.4.1         │ Tue, 07 Feb 2017 00:28:22 GMT │
├──────────────────────────────────┼─────────────────┼───────────────────────────────┤
│ javascript-workshop              │ ^15.4.1         │ Tue, 07 Feb 2017 00:28:22 GMT │
├──────────────────────────────────┼─────────────────┼───────────────────────────────┤
│ javascript-workshop              │ ^15.4.1         │ Tue, 07 Feb 2017 00:28:22 GMT │
├──────────────────────────────────┼─────────────────┼───────────────────────────────┤
│ the-eod-machine                  │ ^16.4.2         │ Sat, 04 May 2019 15:42:58 GMT │
├──────────────────────────────────┼─────────────────┼───────────────────────────────┤
│ css-playground                   │ ^15.4.2         │ Sun, 19 Mar 2017 16:34:59 GMT │
├──────────────────────────────────┼─────────────────┼───────────────────────────────┤
│ react-bare-app                   │ ^15.5.4         │ Fri, 17 Aug 2018 18:37:03 GMT │
└──────────────────────────────────┴─────────────────┴───────────────────────────────┘
```

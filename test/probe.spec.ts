import path from 'path'
import { PollyConfig, setupPolly } from 'setup-polly-jest'
import { MODES } from '@pollyjs/utils'

import probe from '../src/probe'
import { GetRepoResponse } from '../src/githubApiClient'

let recordReplayConfig: Partial<PollyConfig> = {}
if (process.env.CI) {
  recordReplayConfig = {
    mode: MODES.REPLAY,
    recordIfMissing: false,
  }
}
setupPolly({
  ...recordReplayConfig,
  adapters: [require('@pollyjs/adapter-node-http')],
  persister: require('@pollyjs/persister-fs'),
  persisterOptions: {
    fs: {
      recordingsDir: path.resolve(__dirname, '__recordings__'),
    },
  },
  matchRequestsBy: {
    headers: {
      exclude: ['user-agent'],
    },
  },
})

it('finds versions of a package', async () => {
  const results = await probe({
    owner: 'ryanoglesby08',
    searchTerm: 'react',
  })

  expect(results).toMatchInlineSnapshot(`
    Array [
      Object {
        "packageName": "@the-eod-machine/ui",
        "repositoryName": "the-eod-machine",
        "version": "^16.4.1",
      },
      Object {
        "packageName": "movie-night",
        "repositoryName": "movie-night",
        "version": "^16.7.0-alpha.2",
      },
      Object {
        "packageName": "@the-eod-machine/emailer",
        "repositoryName": "the-eod-machine",
        "version": "^16.4.2",
      },
    ]
  `)
})

it('handles partial matches', async () => {
  const results = await probe({
    owner: 'ryanoglesby08',
    searchTerm: 'emotion',
    partialMatches: true,
  })

  expect(results).toMatchInlineSnapshot(`
    Array [
      Object {
        "packageName": "@the-eod-machine/ui",
        "repositoryName": "the-eod-machine",
        "version": Object {
          "emotion": "^9.2.6",
          "emotion-theming": "^9.2.6",
          "jest-emotion": "^9.2.7",
          "react-emotion": "^9.2.6",
        },
      },
      Object {
        "packageName": "ryan-oglesby-blog",
        "repositoryName": "ryanoglesby08.github.com",
        "version": Object {
          "babel-plugin-emotion": "^9.1.2",
          "emotion": "^9.1.2",
          "emotion-server": "^9.1.2",
          "gatsby-plugin-emotion": "^1.1.16",
          "react-emotion": "^9.1.2",
        },
      },
    ]
  `)
})

it('filters out partial matches that end up being empty', async () => {
  // This can happen if the package.json contains the search string, but not in the dependencies
  // Every package.json file has the word "license", but its not a dependency name
  const results = await probe({
    owner: 'ryanoglesby08',
    searchTerm: 'license',
    partialMatches: true,
  })

  expect(results).toMatchInlineSnapshot(`Array []`)
})

it('uses an access token if provided', async () => {
  /*
    This `accessToken` has been revoked so that it can be checked in.
    If this test needs to be re-recorded, generate a new one. https://github.com/settings/tokens/new
  */
  const accessToken = ' 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'

  const results = await probe({
    accessToken,
    owner: 'ryanoglesby08',
    searchTerm: 'commander',
  })

  expect(results).toMatchInlineSnapshot(`
    Array [
      Object {
        "packageName": "package-probe",
        "repositoryName": "package-probe",
        "version": "^3.0.0",
      },
    ]
  `)
})

it('requires a search term and owner', async () => {
  await expect(
    probe({
      owner: 'ryanoglesby08',
    })
  ).rejects.toThrowError(/searchTerm/)

  await expect(
    probe({
      searchTerm: 'react',
    })
  ).rejects.toThrowError(/owner/)
})

it('finds matches in dev dependencies', async () => {
  let results = await probe({
    owner: 'ryanoglesby08',
    searchTerm: 'commitizen',
  })

  expect(results).toMatchInlineSnapshot(`
    Array [
      Object {
        "packageName": "package-probe",
        "repositoryName": "package-probe",
        "version": "^4.0.0",
      },
    ]
  `)

  results = await probe({
    owner: 'ryanoglesby08',
    searchTerm: 'polly',
    partialMatches: true,
  })

  expect(results).toMatchInlineSnapshot(`
    Array [
      Object {
        "packageName": "package-probe",
        "repositoryName": "package-probe",
        "version": Object {
          "@pollyjs/adapter-fetch": "^4.0.0",
          "@pollyjs/adapter-node-http": "^2.4.0",
          "@pollyjs/core": "^4.0.0",
          "@pollyjs/persister-fs": "^4.0.0",
          "setup-polly-jest": "^0.6.0",
        },
      },
    ]
  `)
})

it('can filter on repository properties, only returning results that satisfy all "include" filters', async () => {
  const onlyMITLicenses = (githubRepo: GetRepoResponse['data']) => {
    return githubRepo.license.name.includes('MIT')
  }

  const results = await probe({
    owner: 'eslint',
    searchTerm: 'react',
    include: [onlyMITLicenses],
  })

  expect(results).toMatchInlineSnapshot(`
    Array [
      Object {
        "packageName": "eslint-website",
        "repositoryName": "cn.eslint.org",
        "version": "^16.13.1",
      },
      Object {
        "packageName": "eslint-website",
        "repositoryName": "website",
        "version": "^16.13.1",
      },
    ]
  `)
})

it('can filter on repository properties, excluding results that satisfy ANY "exclude" filters', async () => {
  const notOldRepos = (githubRepo: GetRepoResponse['data']) => {
    return new Date(githubRepo.pushed_at).getFullYear() < 2018
  }
  const notEslintNamed = (githubRepo: GetRepoResponse['data']) => {
    return githubRepo.name.includes('eslint')
  }

  const results = await probe({
    owner: 'eslint',
    searchTerm: 'react',
    exclude: [notOldRepos, notEslintNamed],
  })

  expect(results).toMatchInlineSnapshot(`
    Array [
      Object {
        "packageName": "ESLint-Playground",
        "repositoryName": "playground",
        "version": "^18.1.0",
      },
      Object {
        "packageName": "eslint-website",
        "repositoryName": "website",
        "version": "^16.13.1",
      },
    ]
  `)
})

it('can customize the output', async () => {
  const appendFieldsToOutput = (githubRepo: GetRepoResponse['data']) => ({
    description: githubRepo.description,
    lastCommit: new Date(githubRepo.pushed_at).toLocaleDateString(),
  })

  const results = await probe({
    owner: 'ryanoglesby08',
    searchTerm: 'commander',
    appendFieldsToOutput,
  })

  expect(results).toMatchInlineSnapshot(`
    Array [
      Object {
        "description": "Scan a Github organization for usage of a package",
        "lastCommit": "5/20/2022",
        "packageName": "package-probe",
        "repositoryName": "package-probe",
        "version": "^3.0.0",
      },
    ]
  `)
})

it('shows the package name in addition to the repo name', async () => {
  // to better support monorepos

  const results = await probe({
    owner: 'ryanoglesby08',
    searchTerm: 'apollo',
    partialMatches: true,
  })

  expect(results).toMatchInlineSnapshot(`
    Array [
      Object {
        "packageName": "@the-eod-machine/emailer",
        "repositoryName": "the-eod-machine",
        "version": Object {
          "apollo-cache-inmemory": "^1.2.5",
          "apollo-client": "^2.3.5",
          "apollo-link-http": "^1.5.4",
        },
      },
      Object {
        "packageName": "@the-eod-machine/ui",
        "repositoryName": "the-eod-machine",
        "version": Object {
          "apollo-boost": "^0.1.10",
          "react-apollo": "^2.1.6",
        },
      },
      Object {
        "packageName": "@the-eod-machine/api",
        "repositoryName": "the-eod-machine",
        "version": Object {
          "apollo-server": "^2.2.2",
          "apollo-server-testing": "^2.2.2",
        },
      },
    ]
  `)
})

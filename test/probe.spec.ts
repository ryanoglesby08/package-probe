import path from 'path'
import { setupPolly } from 'setup-polly-jest'
import Octokit from '@octokit/rest'

import probe from '../src/probe'

let recordReplayConfig = {}
if (process.env.CI) {
  recordReplayConfig = {
    mode: 'replay',
    recordIfMissing: false,
  }
}
setupPolly({
  ...recordReplayConfig,
  adapters: ['node-http'],
  persister: 'fs',
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
    searchTerm: 'commander',
  })

  expect(results).toMatchInlineSnapshot(`
    Array [
      Object {
        "packageName": "my-cli",
        "repositoryName": "my-cli",
        "version": "^2.14.1",
      },
      Object {
        "packageName": "package-probe",
        "repositoryName": "package-probe",
        "version": "^2.9.0",
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
  const results = await probe({
    owner: 'ryanoglesby08',
    searchTerm: 'eslint',
    partialMatches: true,
  })

  expect(results).toMatchInlineSnapshot(`
    Array [
      Object {
        "packageName": "react-bare-app",
        "repositoryName": "react-dashboard",
        "version": Object {
          "babel-eslint": "^7.2.3",
          "eslint": "^3.19.0",
          "eslint-loader": "^1.7.1",
          "eslint-plugin-react": "^7.0.0",
        },
      },
      Object {
        "packageName": "@the-eod-machine/emailer",
        "repositoryName": "the-eod-machine",
        "version": Object {
          "eslint": "^5.9.0",
          "eslint-plugin-graphql": "^3.0.1",
          "eslint-plugin-react": "^7.11.1",
        },
      },
      Object {
        "packageName": "@the-eod-machine/api",
        "repositoryName": "the-eod-machine",
        "version": Object {
          "eslint": "^5.9.0",
          "eslint-plugin-graphql": "^3.0.1",
        },
      },
      Object {
        "packageName": "react-quizzer",
        "repositoryName": "react-quizzer",
        "version": Object {
          "eslint": "^2.13.1",
          "eslint-loader": "^1.3.0",
          "eslint-plugin-react": "^5.2.2",
        },
      },
      Object {
        "packageName": "splitit",
        "repositoryName": "splitit",
        "version": Object {
          "eslint": "^3.6.0",
          "eslint-loader": "^1.5.0",
          "eslint-plugin-react": "^6.3.0",
        },
      },
      Object {
        "packageName": "ryan-oglesby-blog",
        "repositoryName": "ryanoglesby08.github.com",
        "version": Object {
          "eslint": "^4.19.1",
          "eslint-config-prettier": "^2.9.0",
          "eslint-plugin-react": "^7.7.0",
        },
      },
      Object {
        "packageName": "react-bare-app",
        "repositoryName": "react-bare-app",
        "version": Object {
          "eslint": "^3.19.0",
          "eslint-loader": "^1.7.1",
          "eslint-plugin-react": "^7.0.0",
        },
      },
      Object {
        "packageName": "@the-eod-machine/ui",
        "repositoryName": "the-eod-machine",
        "version": Object {
          "eslint-plugin-graphql": "^3.0.1",
        },
      },
      Object {
        "packageName": "xhr-env-provider",
        "repositoryName": "xhr-env-provider",
        "version": Object {
          "eslint": "^3.9.0",
        },
      },
    ]
  `)
})

it('uses an access token if provided', async () => {
  /*
    This `accessToken` has been revoked so that it can be checked in.
    If this test needs to be re-recorded, generate a new one.
  */
  const accessToken = '76cc38b56ee4e98ad2b23fb72397984081b0186c'

  const results = await probe({
    accessToken,
    owner: 'ryanoglesby08',
    searchTerm: 'commander',
  })

  expect(results).toMatchInlineSnapshot(`
    Array [
      Object {
        "packageName": "my-cli",
        "repositoryName": "my-cli",
        "version": "^2.14.1",
      },
      Object {
        "packageName": "package-probe",
        "repositoryName": "package-probe",
        "version": "^2.9.0",
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
    searchTerm: 'angular',
  })

  expect(results).toMatchInlineSnapshot(`
    Array [
      Object {
        "packageName": undefined,
        "repositoryName": "ng-inspect-watchers",
        "version": "^1.4.3",
      },
    ]
  `)

  results = await probe({
    owner: 'ryanoglesby08',
    searchTerm: 'grunt',
    partialMatches: true,
  })

  expect(results).toMatchInlineSnapshot(`
    Array [
      Object {
        "packageName": undefined,
        "repositoryName": "ng-inspect-watchers",
        "version": Object {
          "grunt": "~0.4.5",
          "grunt-contrib-compress": "~0.13.0",
          "grunt-contrib-jshint": "~1.0",
          "grunt-exec": "^0.4.6",
        },
      },
      Object {
        "packageName": "jquery-ui",
        "repositoryName": "L8-travis-build-monitor",
        "version": Object {
          "grunt": "0.4.1",
          "grunt-compare-size": "0.4.0-rc.3",
          "grunt-contrib-concat": "0.1.3",
          "grunt-contrib-csslint": "0.1.1",
          "grunt-contrib-cssmin": "0.4.2",
          "grunt-contrib-jshint": "0.7.1",
          "grunt-contrib-qunit": "0.2.0",
          "grunt-contrib-uglify": "0.1.1",
          "grunt-git-authors": "1.2.0",
          "grunt-html": "0.3.3",
        },
      },
    ]
  `)
})

it('can filter on repository properties, only returning results that satisfy all "include" filters', async () => {
  const onlyInactiveRepos = (githubRepo: Octokit.ReposGetResponse) => {
    return new Date(githubRepo.pushed_at).getFullYear() !== 2019
  }
  const onlyCssRepos = (githubRepo: Octokit.ReposGetResponse) => {
    return githubRepo.name.includes('css')
  }

  const results = await probe({
    owner: 'ryanoglesby08',
    searchTerm: 'react',
    include: [onlyInactiveRepos, onlyCssRepos],
  })

  expect(results).toMatchInlineSnapshot(`
    Array [
      Object {
        "packageName": "exposing-css-hidden-complexities",
        "repositoryName": "exposing-css-hidden-complexities",
        "version": "^16.1.1",
      },
      Object {
        "packageName": "js-hide-instead-of-by-class",
        "repositoryName": "css-playground",
        "version": "^15.4.2",
      },
    ]
  `)
})

it('can filter on repository properties, excluding results that satisfy ANY "exclude" filters', async () => {
  const notOldRepos = (githubRepo: Octokit.ReposGetResponse) => {
    return new Date(githubRepo.pushed_at).getFullYear() < 2018
  }
  const notEodMachine = (githubRepo: Octokit.ReposGetResponse) => {
    return githubRepo.name.includes('the-eod-machine')
  }

  const results = await probe({
    owner: 'ryanoglesby08',
    searchTerm: 'react',
    exclude: [notOldRepos, notEodMachine],
  })

  expect(results).toMatchInlineSnapshot(`
    Array [
      Object {
        "packageName": "movie-night",
        "repositoryName": "movie-night",
        "version": "^16.7.0-alpha.2",
      },
      Object {
        "packageName": "email-autocomplete",
        "repositoryName": "email-autocomplete",
        "version": "^16.5.2",
      },
      Object {
        "packageName": "ssr-media-queries",
        "repositoryName": "ssr-media-queries",
        "version": "^16.2.0",
      },
    ]
  `)
})

it('can customize the output', async () => {
  const appendFieldsToOutput = (githubRepo: Octokit.ReposGetResponse) => ({
    description: githubRepo.description,
    lastCommit: new Date(githubRepo.pushed_at).toLocaleDateString(),
  })

  const results = await probe({
    owner: 'ryanoglesby08',
    searchTerm: 'angular',
    appendFieldsToOutput,
  })

  expect(results).toMatchInlineSnapshot(`
    Array [
      Object {
        "description": "A Chrome Extension to inspect the watchers in an Angular app",
        "lastCommit": "6/22/2016",
        "packageName": undefined,
        "repositoryName": "ng-inspect-watchers",
        "version": "^1.4.3",
      },
    ]
  `)
})

it('shows the package/app name in addition to the repo name', async () => {
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
        "packageName": "@the-eod-machine/api",
        "repositoryName": "the-eod-machine",
        "version": Object {
          "apollo-server": "^2.2.2",
          "apollo-server-testing": "^2.2.2",
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
    ]
  `)
})

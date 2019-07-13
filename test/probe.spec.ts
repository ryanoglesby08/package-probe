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
            "lastEdit": "Sat, 06 Oct 2018 20:50:11 GMT",
            "repositoryName": "my-cli",
            "version": "^2.14.1",
          },
          Object {
            "lastEdit": "Sat, 11 May 2019 16:13:38 GMT",
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
            "lastEdit": "Sat, 04 May 2019 15:42:58 GMT",
            "repositoryName": "the-eod-machine",
            "version": Object {
              "emotion": "^9.2.6",
              "emotion-theming": "^9.2.6",
              "jest-emotion": "^9.2.7",
              "react-emotion": "^9.2.6",
            },
          },
          Object {
            "lastEdit": "Sun, 02 Dec 2018 01:31:03 GMT",
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
            "lastEdit": "Sat, 06 Oct 2018 20:50:11 GMT",
            "repositoryName": "my-cli",
            "version": "^2.14.1",
          },
          Object {
            "lastEdit": "Sat, 11 May 2019 16:13:38 GMT",
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
            "lastEdit": "Sun, 08 Oct 2017 17:31:47 GMT",
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
            "lastEdit": "Sun, 08 Oct 2017 17:31:47 GMT",
            "repositoryName": "ng-inspect-watchers",
            "version": Object {
              "grunt": "~0.4.5",
              "grunt-contrib-compress": "~0.13.0",
              "grunt-contrib-jshint": "~1.0",
              "grunt-exec": "^0.4.6",
            },
          },
          Object {
            "lastEdit": "Sun, 02 Nov 2014 18:40:29 GMT",
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
    return new Date(githubRepo.updated_at).getFullYear() !== 2019
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
            "lastEdit": "Sat, 18 Nov 2017 17:51:46 GMT",
            "repositoryName": "exposing-css-hidden-complexities",
            "version": "^16.1.1",
          },
          Object {
            "lastEdit": "Sun, 19 Mar 2017 16:34:59 GMT",
            "repositoryName": "css-playground",
            "version": "^15.4.2",
          },
        ]
    `)
})

it('can filter on repository properties, excluding results that satisfy ANY "exclude" filters', async () => {
  const notOldRepos = (githubRepo: Octokit.ReposGetResponse) => {
    return new Date(githubRepo.updated_at).getFullYear() < 2018
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
        "lastEdit": "Tue, 20 Nov 2018 23:31:30 GMT",
        "repositoryName": "movie-night",
        "version": "^16.7.0-alpha.2",
      },
      Object {
        "lastEdit": "Mon, 24 Sep 2018 00:05:10 GMT",
        "repositoryName": "email-autocomplete",
        "version": "^16.5.2",
      },
      Object {
        "lastEdit": "Wed, 14 Feb 2018 15:00:55 GMT",
        "repositoryName": "ssr-media-queries",
        "version": "^16.2.0",
      },
      Object {
        "lastEdit": "Fri, 17 Aug 2018 18:37:03 GMT",
        "repositoryName": "react-bare-app",
        "version": "^15.5.4",
      },
    ]
  `)
})

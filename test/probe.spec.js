import path from 'path'
import { setupPolly } from 'setup-polly-jest'

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
              "react-emotion": "^9.2.6",
            },
          },
          Object {
            "lastEdit": "Sun, 02 Dec 2018 01:31:03 GMT",
            "repositoryName": "ryanoglesby08.github.com",
            "version": Object {
              "emotion": "^9.1.2",
              "emotion-server": "^9.1.2",
              "gatsby-plugin-emotion": "^1.1.16",
              "react-emotion": "^9.1.2",
            },
          },
        ]
    `)
})

it('can exclude matches in specified repositories', async () => {
  const results = await probe({
    owner: 'ryanoglesby08',
    searchTerm: 'lodash',
    exclude: 'ryanoglesby08/the-eod-machine,ryanoglesby08/package-probe',
  })

  expect(results).toMatchInlineSnapshot(`
                    Array [
                      Object {
                        "lastEdit": "Sun, 02 Dec 2018 01:31:03 GMT",
                        "repositoryName": "ryanoglesby08.github.com",
                        "version": "^4.17.5",
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

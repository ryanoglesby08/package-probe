import probe from '../src/probe'
import createGithubClient, { addSearchResults } from '../src/apiClient/githubClient'

jest.mock('../src/apiClient/githubClient')

describe('Adoption checker', () => {
  beforeEach(() => {
    // Clear all instances and calls to constructor and all methods:
    createGithubClient.mockClear()
  })

  it('finds versions of a package', async () => {
    addSearchResults([
      {
        name: 'some-repo',
        fullName: 'an-owner/some-repo',
        dependencies: { babel: '^6.26.0', react: '^16.0.0' },
      },
      {
        name: 'another-repo',
        fullName: 'an-owner/another-repo',
        dependencies: { vue: '^2.0.0' },
      },
    ])

    const results = await probe({
      owner: 'an-owner',
      searchTerm: 'react',
    })

    expect(results).toEqual([
      expect.objectContaining({
        repositoryName: 'some-repo',
        version: '^16.0.0',
      }),
    ])
  })

  it('gets the last modified date of repositories', async () => {
    addSearchResults([
      {
        name: 'some-repo',
        fullName: 'an-owner/some-repo',
        lastModified: 'Mon, 17 Apr 2018 15:33:29 GMT',
        dependencies: { react: '^16.0.0' },
      },
    ])

    const results = await probe({
      owner: 'an-owner',
      searchTerm: 'react',
    })

    expect(results).toEqual([
      expect.objectContaining({
        repositoryName: 'some-repo',
        lastEdit: 'Mon, 17 Apr 2018 15:33:29 GMT',
      }),
    ])
  })

  it('handles partial matches', async () => {
    addSearchResults([
      {
        name: 'some-repo',
        fullName: 'an-owner/some-repo',
        dependencies: {
          'babel-cli': '^6.26.0',
          'babel-core': '^6.26.0',
          'babel-eslint': '^8.0.0',
          react: '^16.0.0',
        },
      },
    ])

    const results = await probe({
      owner: 'an-owner',
      searchTerm: 'babel',
      partialMatches: true,
    })

    expect(results).toEqual([
      expect.objectContaining({
        repositoryName: 'some-repo',
        version: {
          'babel-cli': '^6.26.0',
          'babel-core': '^6.26.0',
          'babel-eslint': '^8.0.0',
        },
      }),
    ])
  })

  it('can exclude matches in specified repositories', async () => {
    addSearchResults([
      {
        name: 'some-repo',
        fullName: 'an-owner/some-repo',
        dependencies: { react: '^16.0.0' },
      },
      {
        name: 'excluded-repo',
        fullName: 'an-owner/excluded-repo',
        dependencies: { react: '^16.0.0' },
      },
      {
        name: 'another-excluded-repo',
        fullName: 'an-owner/another-excluded-repo',
        dependencies: { react: '^16.0.0' },
      },
    ])

    const results = await probe({
      owner: 'an-owner',
      searchTerm: 'react',
      exclude: 'an-owner/excluded-repo,an-owner/another-excluded-repo',
    })

    expect(results).toEqual([
      expect.objectContaining({
        repositoryName: 'some-repo',
      }),
    ])
  })
})

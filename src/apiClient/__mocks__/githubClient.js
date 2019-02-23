let searchResults = []

export const addSearchResults = results => {
  searchResults = results
}

const searchCode = async searchTerm => {
  const results = searchResults.map(result => ({
    name: 'package.json',
    path: 'package.json',
    sha: 'fde77b13b7154e91fd8862680f84b499652c4586',
    url:
      'https://api.github.com/repositories/00000000/contents/package.json?ref=1c583e8b7c6de4606313c5b79d1f4876070e1556',
    repository: {
      name: result.name,
      full_name: result.fullName,
    },
  }))

  return Promise.resolve(results)
}

const getContents = async (repo, url, path) => {
  const searchResult = searchResults.find(result => result.fullName === repo)

  return Promise.resolve({
    name: searchResult.name,
    version: '1.0.0',
    description: 'A stubbed package.json file',
    dependencies: Object.assign(
      {
        'some-dependency': '^2.1.2',
        'another-dependency': '^1.0.0',
      },
      searchResult.dependencies
    ),
  })
}

const getRepo = async (owner, repo) => {
  const searchResult = searchResults.find(result => result.name === repo)

  return Promise.resolve({
    data: {},
    meta: {
      'last-modified': searchResult.lastModified,
    },
  })
}

const mock = jest.fn().mockImplementation(() => {
  return {
    searchCode,
    getContents,
    getRepo,
  }
})

export default mock

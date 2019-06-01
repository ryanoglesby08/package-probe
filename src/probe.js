import isEmpty from 'lodash/isEmpty'

import GithubApiClient from './githubApiClient'

const fetchDependencyVersion = async (
  apiClient,
  searchTerm,
  partialMatches,
  repoFullName,
  url,
  path
) => {
  const packageJson = await apiClient.getContents(repoFullName, url, path)
  const dependencies = packageJson.dependencies || {}

  let data
  if (partialMatches) {
    data = Object.keys(dependencies)
      .filter(dependency => dependency.includes(searchTerm))
      .reduce(
        (accumulator, dependency) =>
          Object.assign({}, accumulator, { [dependency]: dependencies[dependency] }),
        {}
      )
  }

  return partialMatches ? data : dependencies[searchTerm]
}

const excludeRepos = (repositories, exclude) => {
  if (!exclude) {
    return repositories
  }

  const excludedRepos = exclude.split(',')

  return repositories.filter(repository => !excludedRepos.includes(repository.repository.full_name))
}

const matchResults = async (apiClient, searchTerm, exclude, partialMatches, repositories) => {
  const matchedRepos = await Promise.all(
    excludeRepos(repositories, exclude).map(async repository => {
      const version = await fetchDependencyVersion(
        apiClient,
        searchTerm,
        partialMatches,
        repository.repository.full_name,
        repository.url,
        repository.path
      )

      return {
        repositoryName: repository.repository.name,
        version,
      }
    })
  )

  return matchedRepos.filter(repo => !isEmpty(repo.version))
}

const enhanceWithLastEdit = async (apiClient, owner, matchedRepos) => {
  return await Promise.all(
    matchedRepos.map(async repo => {
      const repoInfo = await apiClient.getRepo(owner, repo.repositoryName)
      const lastEdit = repoInfo.headers['last-modified'] || ''

      return Object.assign({}, repo, { lastEdit })
    })
  )
}

const probe = async ({ accessToken, exclude, owner, partialMatches, searchTerm }) => {
  if (isEmpty(searchTerm)) {
    throw new Error('`searchTerm` is required')
  }
  if (isEmpty(owner)) {
    throw new Error('`owner` is required')
  }

  const apiClient = new GithubApiClient(accessToken)

  const searchResults = await apiClient.searchCode(owner, searchTerm)
  const matchedRepos = await matchResults(
    apiClient,
    searchTerm,
    exclude,
    partialMatches,
    searchResults
  )

  return await enhanceWithLastEdit(apiClient, owner, matchedRepos)
}

export default probe

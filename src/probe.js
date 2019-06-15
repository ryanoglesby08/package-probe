import isEmpty from 'lodash/isEmpty'

import GithubApiClient from './githubApiClient'
import { exactMatcher, partialMatcher } from './matchers'

const fetchDependencyVersion = async (
  apiClient,
  searchTerm,
  collectMatches,
  repoFullName,
  url,
  path
) => {
  const packageJson = await apiClient.getContents(repoFullName, url, path)

  const versionMatches = collectMatches(
    packageJson.dependencies,
    packageJson.devDependencies,
    searchTerm
  )

  return versionMatches
}

const excludeRepos = (repositories, exclude) => {
  if (!exclude) {
    return repositories
  }

  const excludedRepos = exclude.split(',')

  return repositories.filter(repository => !excludedRepos.includes(repository.repository.full_name))
}

const matchResults = async (apiClient, searchTerm, collectMatches, exclude, repositories) => {
  const matchedRepos = await Promise.all(
    excludeRepos(repositories, exclude).map(async repository => {
      const version = await fetchDependencyVersion(
        apiClient,
        searchTerm,
        collectMatches,
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

      return {
        ...repo,
        lastEdit,
      }
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

  const collectMatches = partialMatches ? partialMatcher : exactMatcher

  const searchResults = await apiClient.searchCode(owner, searchTerm)
  const matchedRepos = await matchResults(
    apiClient,
    searchTerm,
    collectMatches,
    exclude,
    searchResults
  )

  return await enhanceWithLastEdit(apiClient, owner, matchedRepos)
}

export default probe

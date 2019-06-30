import { isEmpty } from 'lodash'

import GithubApiClient, {
  SearchCodeResult,
  PackageJson,
  PackageJsonDependencies,
} from './githubApiClient'
import { exactMatcher, partialMatcher, MatcherFunction } from './matchers'

interface MatchResult {
  repositoryName: string
  version: string | PackageJsonDependencies
}
export interface EnhancedMatchResult extends MatchResult {
  lastEdit: string | undefined
}

const fetchDependencyVersion = async (
  apiClient: GithubApiClient,
  searchTerm: string,
  collectMatches: MatcherFunction,
  searchCodeResult: SearchCodeResult
): Promise<string | undefined | PackageJsonDependencies> => {
  const packageJson: PackageJson = await apiClient.getContents(
    searchCodeResult.repository.full_name,
    searchCodeResult.url,
    searchCodeResult.path
  )

  const versionMatches = collectMatches(
    packageJson.dependencies,
    packageJson.devDependencies,
    searchTerm
  )

  return versionMatches
}

const excludeRepos = (
  searchCodeResults: SearchCodeResult[],
  exclude: string | undefined
): SearchCodeResult[] => {
  if (typeof exclude === 'undefined' || isEmpty(exclude)) {
    return searchCodeResults
  }

  const excludedRepos = exclude.split(',')

  return searchCodeResults.filter(
    repository => !excludedRepos.includes(repository.repository.full_name)
  )
}

const matchResults = async (
  apiClient: GithubApiClient,
  searchTerm: string,
  collectMatches: MatcherFunction,
  searchCodeResults: SearchCodeResult[]
): Promise<MatchResult[]> => {
  let matches: MatchResult[] = []

  for (const searchCodeResult of searchCodeResults) {
    const version = await fetchDependencyVersion(
      apiClient,
      searchTerm,
      collectMatches,
      searchCodeResult
    )

    if (version) {
      matches.push({
        repositoryName: searchCodeResult.repository.name,
        version,
      })
    }
  }

  return matches
}

const enhanceWithLastEdit = async (
  apiClient: GithubApiClient,
  owner: string,
  matchedRepos: MatchResult[]
): Promise<EnhancedMatchResult[]> => {
  return await Promise.all(
    matchedRepos.map(async matchResult => {
      const repoInfo = await apiClient.getRepo(owner, matchResult.repositoryName)
      const lastEdit: string | undefined = repoInfo.headers['last-modified']

      return {
        ...matchResult,
        lastEdit,
      }
    })
  )
}

interface ProbeParams {
  accessToken?: string
  exclude?: string // comma-separated
  owner?: string
  partialMatches?: boolean
  searchTerm?: string
}
const probe = async ({ accessToken, exclude, owner, partialMatches, searchTerm }: ProbeParams) => {
  if (typeof searchTerm === 'undefined' || isEmpty(searchTerm)) {
    throw new Error('`searchTerm` is required')
  }
  if (typeof owner === 'undefined' || isEmpty(owner)) {
    throw new Error('`owner` is required')
  }

  const apiClient = new GithubApiClient(accessToken)

  const collectMatches: MatcherFunction = partialMatches ? partialMatcher : exactMatcher

  const searchCodeResults: SearchCodeResult[] = await apiClient.searchCode(owner, searchTerm)
  const searchCodeResultsWithoutExcludedRepos: SearchCodeResult[] = excludeRepos(
    searchCodeResults,
    exclude
  )
  const matchedRepos: MatchResult[] = await matchResults(
    apiClient,
    searchTerm,
    collectMatches,
    searchCodeResultsWithoutExcludedRepos
  )

  return await enhanceWithLastEdit(apiClient, owner, matchedRepos)
}

export default probe

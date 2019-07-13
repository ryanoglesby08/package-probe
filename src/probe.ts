import { isEmpty } from 'lodash'
import Octokit from '@octokit/rest'

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

const createFinalResults = async (
  apiClient: GithubApiClient,
  owner: string,
  matchedRepos: MatchResult[],
  include: RepoFilterFunction[],
  exclude: RepoFilterFunction[]
): Promise<EnhancedMatchResult[]> => {
  let finalResults: EnhancedMatchResult[] = []

  for (const repo of matchedRepos) {
    const repoInfo = await apiClient.getRepo(owner, repo.repositoryName)

    const shouldInclude = include.every(filter => filter(repoInfo.data))
    const shouldExclude = exclude.some(filter => filter(repoInfo.data))

    if (!shouldExclude && shouldInclude) {
      finalResults.push({
        ...repo,
        lastEdit: repoInfo.headers['last-modified'],
      })
    }
  }

  return finalResults
}

type RepoFilterFunction = (githubRepo: Octokit.ReposGetResponse) => boolean

interface ProbeOptions {
  accessToken?: string
  exclude?: RepoFilterFunction[]
  include?: RepoFilterFunction[]
  owner?: string
  partialMatches?: boolean
  searchTerm?: string
}
const probe = async ({
  accessToken,
  exclude = [],
  include = [],
  owner,
  partialMatches,
  searchTerm,
}: ProbeOptions) => {
  if (typeof searchTerm === 'undefined' || isEmpty(searchTerm)) {
    throw new Error('`searchTerm` is required')
  }
  if (typeof owner === 'undefined' || isEmpty(owner)) {
    throw new Error('`owner` is required')
  }

  const apiClient = new GithubApiClient(accessToken)

  const collectMatches: MatcherFunction = partialMatches ? partialMatcher : exactMatcher

  const searchCodeResults: SearchCodeResult[] = await apiClient.searchCode(owner, searchTerm)
  const matchedRepos: MatchResult[] = await matchResults(
    apiClient,
    searchTerm,
    collectMatches,
    searchCodeResults
  )

  return await createFinalResults(apiClient, owner, matchedRepos, include, exclude)
}

export default probe

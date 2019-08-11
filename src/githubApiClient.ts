import Octokit from '@octokit/rest'
import fetch from 'node-fetch'
import { URL } from 'url'

// https://developer.github.com/v3/search/#search-code
export interface SearchCodeResult {
  url: string
  path: string
  repository: {
    name: string
    full_name: string
  }
}

export interface PackageJsonDependencies {
  [packageName: string]: string
}
export interface PackageJson {
  name: string
  dependencies: PackageJsonDependencies
  devDependencies: PackageJsonDependencies
}

class GithubApiClient {
  octokit: Octokit
  token: string | undefined

  constructor(githubAccessToken: string | undefined) {
    this.octokit = new Octokit({
      auth: githubAccessToken,
    })
    this.token = githubAccessToken
  }

  async searchCode(owner: string, searchTerm: string): Promise<SearchCodeResult[]> {
    const search = searchTerm.startsWith('@') ? searchTerm.slice(1) : searchTerm

    const options = this.octokit.search.code.endpoint.merge({
      q: `${search}+in:file+user:${owner}+filename:package.json`,
    })
    return this.octokit.paginate(options)
  }

  async getContents(repo: string, url: string, path: string): Promise<PackageJson> {
    const ref = new URL(url).searchParams.get('ref')

    let headers = {}
    if (this.token) {
      headers = {
        Authorization: `token ${this.token}`,
      }
    }

    // Use the raw.githubusercontent.com web url to avoid rate limiting
    const response = await fetch(`https://raw.githubusercontent.com/${repo}/${ref}/${path}`, {
      method: 'GET',
      headers,
    })
    return response.json()
  }

  async getRepo(owner: string, repo: string) {
    return this.octokit.repos.get({ owner, repo })
  }
}

export default GithubApiClient

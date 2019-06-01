import Octokit from '@octokit/rest'
import fetch from 'node-fetch'
import { URL } from 'url'

class GithubApiClient {
  constructor(githubAccessToken) {
    this.octokit = new Octokit({
      auth: githubAccessToken,
    })
    this.token = githubAccessToken
  }

  async searchCode(owner, searchTerm) {
    const search = searchTerm.startsWith('@') ? searchTerm.slice(1) : searchTerm

    const options = this.octokit.search.code.endpoint.merge({
      q: `${search}+in:file+user:${owner}+filename:package.json`,
    })
    return this.octokit.paginate(options)
  }

  async getContents(repo, url, path) {
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

  async getRepo(owner, repo) {
    return this.octokit.repos.get({ owner, repo })
  }
}

export default GithubApiClient

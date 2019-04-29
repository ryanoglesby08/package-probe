import Octokit from '@octokit/rest'
import fetch from 'node-fetch'
import { URL } from 'url'

class Client {
  constructor(octokit, token) {
    this.octokit = octokit
    this.token = token
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

    // Use the raw.githubusercontent.com web url to avoid rate limiting
    return fetch(`https://raw.githubusercontent.com/${repo}/${ref}/${path}`, {
      method: 'GET',
      headers: {
        Authorization: `token ${this.token}`,
      },
    }).then(res => res.json())
  }

  async getRepo(owner, repo) {
    return this.octokit.repos.get({ owner, repo })
  }
}

const createClient = token => {
  const octokit = new Octokit({
    auth: token,
  })

  return new Client(octokit, token)
}

export default createClient

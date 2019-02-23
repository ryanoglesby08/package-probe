import createOctokitClient from '@octokit/rest'
import fetch from 'node-fetch'
import { URL } from 'url'

const paginate = async (octokit, apiCall, params) => {
  let response = await apiCall(params)
  let items = response.data.items

  while (octokit.hasNextPage(response)) {
    response = await octokit.getNextPage(response)
    items = items.concat(response.data.items)
  }

  return items
}

class Client {
  constructor(octokit, token) {
    this.octokit = octokit
    this.token = token
  }

  async searchCode(owner, searchTerm) {
    const search = searchTerm.startsWith('@') ? searchTerm.slice(1) : searchTerm

    return paginate(this.octokit, this.octokit.search.code, {
      q: `${search}+in:file+user:${owner}+filename:package.json`,
      per_page: 100,
    })
  }

  async getContents(repo, url, path) {
    const ref = new URL(url).searchParams.get('ref')

    return fetch(`https://raw.githubusercontent.com/${repo}/${ref}/${path}`, {
      method: 'GET',
      headers: {
        Authorization: `token ${this.token}`,
      },
    }).then(res => res.json())
  }

  // Use the raw.githubusercontent.com web url to avoid rate limiting
  // async getContents(owner, repo, path) {
  //   return this.octokit.repos.getContent({
  //     owner,
  //     repo,
  //     path,
  //     headers: {
  //       accept: 'application/vnd.github.v3.raw',
  //     },
  //   })
  // }

  async getRepo(owner, repo) {
    return this.octokit.repos.get({ owner, repo })
  }
}

const createClient = token => {
  const octokit = createOctokitClient()

  octokit.authenticate({
    type: 'token',
    token,
  })

  return new Client(octokit, token)
}

export default createClient

import stubSearchCode from './stubs/searchCode'
import stubContents from './stubs/getContents'
import stubRepo from './stubs/getRepo'

class Client {
  async searchCode() {
    const response = await Promise.resolve(stubSearchCode)
    return response.data.items
  }

  async getContents() {
    return Promise.resolve(stubContents)
  }

  async getRepo() {
    return Promise.resolve(stubRepo)
  }
}

const createClient = () => new Client()

export default createClient

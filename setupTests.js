import { Polly } from '@pollyjs/core'
import NodeHttpAdapter from '@pollyjs/adapter-node-http'
import FetchAdapter from '@pollyjs/adapter-fetch'
import FSPersister from '@pollyjs/persister-fs'

Polly.register(NodeHttpAdapter)
Polly.register(FetchAdapter)
Polly.register(FSPersister)

import { Polly } from '@pollyjs/core'
import NodeHttpAdapter from '@pollyjs/adapter-node-http'
import FSPersister from '@pollyjs/persister-fs'

Polly.register(NodeHttpAdapter)
Polly.register(FSPersister)

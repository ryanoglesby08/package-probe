import { pickBy } from 'lodash'

import { PackageJsonDependencies } from './githubApiClient'

export type MatcherFunction = (
  dependencies: PackageJsonDependencies,
  devDependencies: PackageJsonDependencies,
  searchTerm: string
) => string | undefined | PackageJsonDependencies

export const exactMatcher: MatcherFunction = (
  dependencies = {},
  devDependencies = {},
  searchTerm
): string | undefined => {
  const devDependencyVersion: string | undefined = devDependencies[searchTerm]
  const dependencyVersion: string | undefined = dependencies[searchTerm]

  return devDependencyVersion || dependencyVersion
}

export const partialMatcher: MatcherFunction = (
  dependencies = {},
  devDependencies = {},
  searchTerm
): PackageJsonDependencies => {
  const devDependencyVersions: PackageJsonDependencies = pickBy(devDependencies, (_, packageName) =>
    packageName.includes(searchTerm)
  )
  const dependencyVersions: PackageJsonDependencies = pickBy(dependencies, (_, packageName) =>
    packageName.includes(searchTerm)
  )

  return { ...devDependencyVersions, ...dependencyVersions }
}

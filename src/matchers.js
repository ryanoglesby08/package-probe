export const exactMatcher = (dependencies = {}, devDependencies = {}, searchTerm) => {
  const devDependencyVersion = devDependencies[searchTerm]
  const dependencyVersion = dependencies[searchTerm]

  return devDependencyVersion || dependencyVersion
}

const findPartialMatches = (dependencies, searchTerm) => {
  return Object.keys(dependencies)
    .filter(dependency => dependency.includes(searchTerm))
    .reduce((accumulator, dependency) => {
      return {
        ...accumulator,
        [dependency]: dependencies[dependency],
      }
    }, {})
}

export const partialMatcher = (dependencies = {}, devDependencies = {}, searchTerm) => {
  const devDependencyVersions = findPartialMatches(devDependencies, searchTerm)
  const dependencyVersions = findPartialMatches(dependencies, searchTerm)

  return { ...devDependencyVersions, ...dependencyVersions }
}

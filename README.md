# Package Probe 🛰

Scan a Github organization for usage of a package.

Package Probe can help you answer questions such as "Which repositories in my organization are using React?" or "Which version of internal dependency X are my organization's projects using?"

## Installation

```bash
$ npm install -g package-probe
```

## Set up (one time)

Package Probe uses the Github API to scan for a package. You will need to generate a "Personal access token" that has access to your organization and pass it to Package Probe on each scan.

- Generate a [Github Personal access token](https://github.com/settings/tokens) in your Github profile developer settings
- Grant the `repo` scope to the token (_Package Probe reads information and does not store any of your data_)
- Copy the token! You will pass it as a parameter to Package Probe. (If you forget your token you must create a new one)

## Command line usage

```
$ package-probe --help

  Usage: cli [options]

  Options:

    --access-token <token>    Github personal access token
    --search-term <term>      Search term
    --exclude <repositories>  Exclude repositories by these names. Comma-separated.
    --owner <owner>           Owner or organization to search.
    --json                    Output results as json. Default output is a table.
    --partial-matches         Return results for partial matches of the search term.
    --stub                    Turn on response stubs for testing.
    -V, --version             output the version number
    -h, --help                output usage information
```

## JavaScript usage

```js
import probe from 'package-probe'

const results = await probe({
  accessToken: ACCESS_TOKEN
  searchTerm: 'react'
})

console.log(results)
```

## Example

Searching my Github repositories for usage of React.

```
package-probe --access-token <my access token> --search-term react --owner ryanoglesby08

┌──────────────────────────────────┬─────────────────┬───────────────────────────────┐
│ movie-night                      │ ^16.7.0-alpha.2 │ Tue, 20 Nov 2018 23:31:30 GMT │
├──────────────────────────────────┼─────────────────┼───────────────────────────────┤
│ email-autocomplete               │ ^16.5.2         │ Mon, 24 Sep 2018 00:05:10 GMT │
├──────────────────────────────────┼─────────────────┼───────────────────────────────┤
│ splitit                          │ ^15.3.2         │ Fri, 28 Oct 2016 16:56:33 GMT │
├──────────────────────────────────┼─────────────────┼───────────────────────────────┤
│ react-dashboard                  │ ^15.5.4         │ Tue, 06 Jun 2017 00:23:55 GMT │
├──────────────────────────────────┼─────────────────┼───────────────────────────────┤
│ exposing-css-hidden-complexities │ ^16.1.1         │ Sat, 18 Nov 2017 17:51:46 GMT │
├──────────────────────────────────┼─────────────────┼───────────────────────────────┤
│ ssr-media-queries                │ ^16.2.0         │ Wed, 14 Feb 2018 15:00:55 GMT │
├──────────────────────────────────┼─────────────────┼───────────────────────────────┤
│ react-quizzer                    │ ^15.1.0         │ Wed, 29 Jun 2016 20:41:09 GMT │
├──────────────────────────────────┼─────────────────┼───────────────────────────────┤
│ javascript-workshop              │ ^15.4.1         │ Tue, 07 Feb 2017 00:28:22 GMT │
├──────────────────────────────────┼─────────────────┼───────────────────────────────┤
│ javascript-workshop              │ ^15.4.1         │ Tue, 07 Feb 2017 00:28:22 GMT │
├──────────────────────────────────┼─────────────────┼───────────────────────────────┤
│ javascript-workshop              │ ^15.4.1         │ Tue, 07 Feb 2017 00:28:22 GMT │
├──────────────────────────────────┼─────────────────┼───────────────────────────────┤
│ javascript-workshop              │ ^15.4.1         │ Tue, 07 Feb 2017 00:28:22 GMT │
├──────────────────────────────────┼─────────────────┼───────────────────────────────┤
│ css-playground                   │ ^15.4.2         │ Sun, 19 Mar 2017 16:34:59 GMT │
├──────────────────────────────────┼─────────────────┼───────────────────────────────┤
│ react-bare-app                   │ ^15.5.4         │ Fri, 17 Aug 2018 18:37:03 GMT │
└──────────────────────────────────┴─────────────────┴───────────────────────────────┘
Total: 13
```

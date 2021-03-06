# Contributions Welcome!

This repository is part of the Fabric project.
Please consult [Fabric's CONTRIBUTING documentation](http://hyperledger-fabric.readthedocs.io/en/latest/CONTRIBUTING.html) as the basis on how to contribute to this repository.

## To code contributors

The following check-list is for code contributors to make sure their commits are compliant and avoid time wasted in rejected pull requests:

Check the coding styles, run the following command and make sure no ESLint violations are present:
* `npm run lint`

Run the full test bucket and make sure 100% are passing.  You can also run each test individually to isolate any failures:
* `npm test`

## Test Delivery

The Fabric-SDK-Node repository contains unit, integration and scenario tests to ensure correct code functionality and guard against regressions. The published packages are tested in an additional repository ([Fabric-Test](https://github.com/hyperledger/fabric-test)), which tests the interoperability of the Fabric-SDK-Node packages with all other Hyperledger Fabric repositories.

### Unit Tests
Unit tests for each package are held locally under a `package/test` directory that mirrors the `package/lib` directory. Tests within these directories are written in Mocha, and may be run locally with the corresponding npm task: `npm run unitTest:<packageName>`. We make use of the following dependencies within the unit tests:
- [Sinon](https://sinonjs.org/) for test spies, stubs and mocks
- [Rewire](https://github.com/jhnns/rewire) for greater control of the component under test
- [Istanbul](https://istanbul.js.org/) for code coverage reports

It is expected that new code deliveries come with unit tests that:
- are isolated - all unit tests should be capable of being run indiviually as well as in the suite(s)
- are meaningful - all unit tests should test the code intention, and validate with assertions
- test golden path and failure path
- provide 100% line coverage

### Functional Tests
Functional tests are held at the repository level under the `~/test/integration` directory and target a Fabric network that has been created based upon information within the `~/test/fixtures` directory.

The functional tests are currently written in [Tape]('https://github.com/substack/tape'), with the intention of testing the Fabric-SDK-Node packages from a user perspective against a live Hyperledger Fabric Network.


<a rel="license" href="http://creativecommons.org/licenses/by/4.0/"><img alt="Creative Commons License" style="border-width:0" src="https://i.creativecommons.org/l/by/4.0/88x31.png" /></a><br />This work is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by/4.0/">Creative Commons Attribution 4.0 International License</a>.
s

# [1.8.0](https://github.com/robbeverhelst/observation-explorer/compare/v1.7.0...v1.8.0) (2025-07-06)


### Features

* add CSS variables for theming and enhance dark mode styles ([0af8593](https://github.com/robbeverhelst/observation-explorer/commit/0af85935013813fb6f979516033c6559d8ecb4d0))
* refine CSS variable definitions and improve shadow styles for better theming ([c8e0923](https://github.com/robbeverhelst/observation-explorer/commit/c8e0923799af0e051a744f35a553ee9c488d5192))
* update gha secrets ([8ff777d](https://github.com/robbeverhelst/observation-explorer/commit/8ff777d5770483a63f8bc6174f4679f73974ef42))

# [1.7.0](https://github.com/robbeverhelst/observation-explorer/compare/v1.6.0...v1.7.0) (2025-07-06)


### Features

* update Redis storage class to 'truenas-hdd-mirror-iscsi' and enhance Bash command permissions ([b4f2b9e](https://github.com/robbeverhelst/observation-explorer/commit/b4f2b9ec64a4e7c4d17eb14999f62de8ef6f71e8))

# [1.6.0](https://github.com/robbeverhelst/observation-explorer/compare/v1.5.1...v1.6.0) (2025-07-06)


### Features

* increase Redis persistence size to 10Gi and add storage class ([eb5657e](https://github.com/robbeverhelst/observation-explorer/commit/eb5657e89dca0b1ee2e671dbdf22c33b9be8cba2))

## [1.5.1](https://github.com/robbeverhelst/observation-explorer/compare/v1.5.0...v1.5.1) (2025-07-06)


### Bug Fixes

* remove unused import and update CI script to include infrastructure build ([2577f1e](https://github.com/robbeverhelst/observation-explorer/commit/2577f1e3f276e88cd4907ba487aaea2ad0d8b4d5))

# [1.5.0](https://github.com/robbeverhelst/observation-explorer/compare/v1.4.1...v1.5.0) (2025-07-06)


### Features

* trigger deployment pipeline ([5f45f6e](https://github.com/robbeverhelst/observation-explorer/commit/5f45f6e02c45e8d8f9a9f10b01b827eed732fde0))

## [1.4.1](https://github.com/robbeverhelst/observation-explorer/compare/v1.4.0...v1.4.1) (2025-07-05)


### Bug Fixes

* comment out unsupported platforms in CI workflow ([9c2838d](https://github.com/robbeverhelst/observation-explorer/commit/9c2838d30f30d824ee0132a026e70bce923f9751))

# [1.4.0](https://github.com/robbeverhelst/observation-explorer/compare/v1.3.0...v1.4.0) (2025-07-05)

### Bug Fixes

- update CI workflow to improve semantic release logging and adjust CI command ([3ba7113](https://github.com/robbeverhelst/observation-explorer/commit/3ba7113e17a80bf1b511b1e40dcc9e85c28e3495))

### Features

- enhance semantic release logging and output handling ([de5f368](https://github.com/robbeverhelst/observation-explorer/commit/de5f368ed075895d36daf1c20df53196a7ec793c))

# [1.3.0](https://github.com/robbeverhelst/observation-explorer/compare/v1.2.0...v1.3.0) (2025-07-04)

### Features

- trigger deployment pipeline ([281c135](https://github.com/robbeverhelst/observation-explorer/commit/281c135f5eb221ce7927d94b76d7ec86871b5773))
- trigger deployment pipeline ([d32b8de](https://github.com/robbeverhelst/observation-explorer/commit/d32b8deb8b7d85b8d3608db04fb57b272fe10348))

# [1.2.0](https://github.com/robbeverhelst/observation-explorer/compare/v1.1.0...v1.2.0) (2025-07-04)

### Features

- refactor infrastructure setup and enhance environment variable handling ([32fdae0](https://github.com/robbeverhelst/observation-explorer/commit/32fdae08f6e4bed88ee2d09e51f0af277c2d3a6f))

# [1.1.0](https://github.com/robbeverhelst/observation-explorer/compare/v1.0.0...v1.1.0) (2025-07-03)

### Bug Fixes

- update dashboard port in README and CI command in package.json ([b52cd79](https://github.com/robbeverhelst/observation-explorer/commit/b52cd79383a2fa3393a41f562ca746497613b2cb))

### Features

- add caching and instrumentation for API responses, enhance health and metrics endpoints ([6c1b9f4](https://github.com/robbeverhelst/observation-explorer/commit/6c1b9f42cf64f217f09247b061e81c8fe2884b21))

# 1.0.0 (2025-07-02)

### Bug Fixes

- correct syntax in CI workflow for runner configuration ([27239a1](https://github.com/robbeverhelst/observation-explorer/commit/27239a10735407547f0255414f4602f087f6ebde))
- exclude 'infra' directory from TypeScript compilation ([704add8](https://github.com/robbeverhelst/observation-explorer/commit/704add86e9e2ae4798481b0ebfb14830fb275007))

### Features

- add Docker support with Dockerfiles and docker-compose configurations ([9687e86](https://github.com/robbeverhelst/observation-explorer/commit/9687e86388d4d40ff26130d01c95cc992ea41d3f))
- add new API routes for groups and enhance error handling in existing routes ([44e51f3](https://github.com/robbeverhelst/observation-explorer/commit/44e51f3f149602cf2dfca9c01bf5020953c7e7ac))
- add new UI components and API routes for observations, countries, and regions ([816e7c0](https://github.com/robbeverhelst/observation-explorer/commit/816e7c0c1b4667b8075749ed3b2f314c9831bf66))
- add Pulumi infrastructure setup for Observation Explorer with Redis integration ([ecebb2c](https://github.com/robbeverhelst/observation-explorer/commit/ecebb2c543f31e34ec72367dfdd9ac541e33dcc0))
- initialize Next.js dashboard with observation-js API, shadcn/ui, TypeScript, and GitHub Actions CI/CD ([983b54e](https://github.com/robbeverhelst/observation-explorer/commit/983b54eafc02406f75febf88a65891f278d5d7e5))
- integrate Redis caching for API responses and add Redis service to Docker setup ([1666835](https://github.com/robbeverhelst/observation-explorer/commit/1666835be054dfc42502b7da00f7cb032ea22f25))

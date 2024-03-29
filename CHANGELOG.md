# Changelog

## [3.2.0](https://github.com/gravity-ui/unipika/compare/v3.1.0...v3.2.0) (2024-02-08)


### Features

* yql_null should be normal-style and  uppercase ([a704975](https://github.com/gravity-ui/unipika/commit/a704975a33efa71a2ca6320bf7e27a78eeb7187d))

## [3.1.0](https://github.com/gravity-ui/unipika/compare/v3.0.0...v3.1.0) (2023-10-27)


### Features

* **format:** add html title for incomplete strings ([c69382c](https://github.com/gravity-ui/unipika/commit/c69382c4ecb2f6d42417e758064dc826a85faded))


### Bug Fixes

* tests ([da85816](https://github.com/gravity-ui/unipika/commit/da85816869602746f09a2a3e33ed9ef9570a376c))

## [3.0.0](https://github.com/gravity-ui/unipika/compare/v2.0.2...v3.0.0) (2023-10-05)


### ⚠ BREAKING CHANGES

- [unipika.utils.format.hidereferrer](https://github.com/gravity-ui/unipika/blob/a35528d190e6b8e2a57bfba97d482083fc0c1647/lib/utils/format.js#L92-L94) is removed. As result wrapping of urls by 'https://h.yandex-team.ru' is removed, and if you need it you have to provide corresponding value for `settings.normalizeUrl`-option.

### Features

* add settings.normalizeUrl ([eef8e96](https://github.com/gravity-ui/unipika/commit/eef8e9667fd077d2f63e1572368162991fa9b9b4))
* **converters:** add support for PgType ([fa7316d](https://github.com/gravity-ui/unipika/commit/fa7316d365be939f834f77088d9c67f4f58cac02))

## [2.0.2](https://github.com/gravity-ui/unipika/compare/v2.0.1...v2.0.2) (2023-05-05)


### Bug Fixes

* should validate only AsTagged with url source ([06cdb96](https://github.com/gravity-ui/unipika/commit/06cdb9642b795d912537441aeccd721f8df94d1f))

## [2.0.1](https://github.com/gravity-ui/unipika/compare/v2.0.0...v2.0.1) (2023-04-27)


### Bug Fixes

* add src url validation if value is not StructType ([e499304](https://github.com/gravity-ui/unipika/commit/e49930442c800729cc13c09e8bf68d77a4d7a859))

## [2.0.0](https://github.com/gravity-ui/unipika/compare/v1.0.2...v2.0.0) (2023-04-25)


### ⚠ BREAKING CHANGES

* add setting validateDomain.\

### Features

* add setting validateDomain.\ ([72c7fc9](https://github.com/gravity-ui/unipika/commit/72c7fc98ce2dcf890cc49f4b7bf5d45cd70eb494))

## [1.0.2](https://github.com/gravity-ui/unipika/compare/v1.0.1...v1.0.2) (2023-04-19)


### Bug Fixes

* tagged type with invalid structure ([e28bdad](https://github.com/gravity-ui/unipika/commit/e28bdad6e5c50689c993d45eeaa914dda61f6d6c))

## [1.0.1](https://github.com/gravity-ui/unipika/compare/v1.0.0...v1.0.1) (2023-03-23)


### Bug Fixes

* **truncateLargeString:** truncate binary strings properly ([2096af3](https://github.com/gravity-ui/unipika/commit/2096af3eaeab5c8e3dc1f50bc1db8f26b45dce45))

## 1.0.0 (2023-02-22)


### Features

* first release ([924b91b](https://github.com/gravity-ui/unipika/commit/924b91b32986ed9f0142e384f02632d3cc6b496e))

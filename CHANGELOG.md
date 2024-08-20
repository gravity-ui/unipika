# Changelog

## [5.2.1](https://github.com/gravity-ui/unipika/compare/v5.2.0...v5.2.1) (2024-08-20)


### Bug Fixes

* negative wide dates format ([#44](https://github.com/gravity-ui/unipika/issues/44)) ([cfc3227](https://github.com/gravity-ui/unipika/commit/cfc32275f9bc64e993f71211688592ad7dec26af))

## [5.2.0](https://github.com/gravity-ui/unipika/compare/v5.1.0...v5.2.0) (2024-07-02)


### Features

* support tzdate32, tzdatetime64, tztimestamp64 [YQLFRONT-2732] ([#42](https://github.com/gravity-ui/unipika/issues/42)) ([2d34a84](https://github.com/gravity-ui/unipika/commit/2d34a843bf5f63e5c76323c6cbebc55ee2659c77))

## [5.1.0](https://github.com/gravity-ui/unipika/compare/v5.0.0...v5.1.0) (2024-06-19)


### Features

* date32 datetime64 timestamp64 interval64 [YTFRONT-4087] ([#38](https://github.com/gravity-ui/unipika/issues/38)) ([9e3c84b](https://github.com/gravity-ui/unipika/commit/9e3c84b075e1231089a6106601990ae9e1d0915d))

## [5.0.0](https://github.com/gravity-ui/unipika/compare/v4.0.1...v5.0.0) (2024-05-06)


### ⚠ BREAKING CHANGES

* move to node 18 and add linters ([#35](https://github.com/gravity-ui/unipika/issues/35))

### Features

* move to node 18 and add linters ([#35](https://github.com/gravity-ui/unipika/issues/35)) ([46e5fee](https://github.com/gravity-ui/unipika/commit/46e5fee52ccbf0add26a8826ff43f3b554edfe15))
* **YQL:** use pg categories for colorizing result [YQLFRONT-2386] ([#34](https://github.com/gravity-ui/unipika/issues/34)) ([478d78c](https://github.com/gravity-ui/unipika/commit/478d78c4f5e6db56ff10c3431c516b537971c649))


### Bug Fixes

* use node 18 in github actions ([#36](https://github.com/gravity-ui/unipika/issues/36)) ([3921895](https://github.com/gravity-ui/unipika/commit/3921895844d6ba13af0c88dc8234da2dbffeddac))

## [4.0.1](https://github.com/gravity-ui/unipika/compare/v4.0.0...v4.0.1) (2024-04-26)


### Bug Fixes

* convert yql jsondocument [CLOUDFRONT-27245] ([b749f9c](https://github.com/gravity-ui/unipika/commit/b749f9cada880ee92c2cda0967eb75a7a8d4ab06))

## [4.0.0](https://github.com/gravity-ui/unipika/compare/v3.2.1...v4.0.0) (2024-04-10)


### ⚠ BREAKING CHANGES

* add `settings.treatValAsData` to operate with incomplete data

### Features

* add `settings.treatValAsData` to operate with incomplete data ([e0e7ca7](https://github.com/gravity-ui/unipika/commit/e0e7ca70d7f6797df69642232ae41c00b0f68966))

## [3.2.1](https://github.com/gravity-ui/unipika/compare/v3.2.0...v3.2.1) (2024-04-02)


### Bug Fixes

* escape title for incomplete strings ([327c181](https://github.com/gravity-ui/unipika/commit/327c181b7577f48c41b61c20b3a8b3b159d936db))

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

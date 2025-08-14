# Changelog

## v1.2.1 (14-08-2025)

### Changed

- Added missing information as stated in the developer info for MagicMirror² modules

## v1.2.0 (07-01-2025)

### Fixed

- Reinstated the List view (with enhanced design)
- Added proper user experience (loading screen and animation)
- Much much code clean up

## v1.1.1 (05-01-2025)

### Changed

- Reinstated old default values

### Fixed

- Fixed bug that ignored the language configuration in 1.1.0

## v1.1.0 (23-11-2024)

### Changed

- Removed the list option as the visual for it not very apealing.
- Changed and simplified the way in which movies were being fetched and displayed

### Fixed

- Fixed issue with cast which was not updating for each new movie passed in

## v1.0.0 (19-01-2018)

### Changed

- The Movie DB has made changes to the way in which they authenticate the different API used by the module. The API key now no longer supports all APi's. As such, the module has been updated to make use of the API Read Access Token instead.
- Have removed request and updated to make use of the internal fetch module instead.
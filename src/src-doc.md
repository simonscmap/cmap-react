# Overview of `/src` contents

- `index.js` is the application bootstrap, wiring the the store (redux) provider with the app's main root component
- `App.js` is the root react component, and contains the application router and theme definition
- `constants.js` contains application constants

## What goes where?

### [src/Utility/](Utility)

General utils. Discriminating between helpers and utils is often subjective, the general rule, however, is that if a helper is used by more than one component, it should be considered as a candidate for a utility. But the multiple-use rule is really an external measure, which can help identify a function of sufficient generality, that it can be of general utility. For exapmle, helpers that are oriented specificially to views should be kept close to their view components, even if they are used by several views. Ideally a perusal of the utilities directory can serve as a tour of the domain, showing what kinds of data and data transformations the application is built for.

### [src/Stylesheets/](Stylesheets)

Most styles are declared inline according to the MUI framework. A few separate stylesheets are declared in this directory. For the most part it is a good idea to stick with MUI.

### [src/enums/](enums)

NOTE: enums is misnamed and will be integrated into constants.js

### [src/Tests/](Tests)

The Tests directory currently contains a few smoke tests, which check that components can render without error, but there are no functional or unit tests.

### [src/Redux/](Redux)

Modules pertaining to state management, including sagas.

### [src/Components/](Components)

Everything responsible for rendering views

### [src/api/](api)

API definitions; wrappers around api calls. Sometimes these also perform transforms on response data.

### [src/Services/](Services)

Application services, such as the persistence service, which provides an interface with local storage. Services handle work outside of the scope of views.

### [src/assets/](assets)

Media assets, such as logos.

# [Up to README](../README.md)

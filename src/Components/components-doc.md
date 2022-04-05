# Overview of `components` contents

Components include react.js implementations of the component (i.e., constituent) renders of application views.

The web app has three major functional sections with corresponding views: the Catalog, Visulization , and Data Submission. Note that "Visualization" is split into "Charts and Plots" and "Explore Cruises."

Minor top-level routes are Community, Documentation, and an About page. Note that the "about" page is currently handled outside react. This will change soon.

The app also has three top-level concerns which are not route specific: Help, UI, and User. [Help](Help) can be enabled on various pages, and is accessed through the navigation bar. [UI](UI) includes global UI concerns, such as the loading overlay and the navigation bar. [User](User) includes user login, registration, etc.

# [Up to /src](../src-doc.md)

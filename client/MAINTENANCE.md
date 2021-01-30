# Maintenance Tips
## File Structure
Client side file structure was carefully prepared to be as intuitive as possible, below the structure will be explained.
```
src/
├─ assets/
├─ components/
│  ├─ commons/
├─ context/
├─ routes/
│  ├─ profile/
│  │  ├─ subroutes/
├─ ui/
├─ utils/
├─ App.js
```
* **`src/assets/`** - Place for all project related assets (i.e. CSS, Images, SVGs, Fonts)
* **`src/components/`** - Place for React Components that are used across the project.
    
    Putting Components **directly inside this folder should be avoided**, if possible put Components based on route
    it is being used in.
    
    If a Component is `BoardRoute` related it is a good idea to put it inside `src/components/board/`
    
    * **`src/components/commons/`** - Place for common code used across several React Components in `src/components` folder
      this can include other Components or JavaScript Code.
      
      The difference between `src/components/commons/` and `src/components/` is that Components in `src/components/commons/`
      are imported only by Components in `src/components/` (exception Subroutes, they act both as Routes and Components) while Components inside `src/components/` can
      also be imported by Routes and other parts of the code.
* **`src/context/`** - Place for React Context elements
* **`src/routes/`** - Place for React-Router Routes (i.e. pages that use Components to create particular view for user)
    * **`src/routes/profile/`** - Example folder for ProfileRoute location
    * **`src/routes/profile/subroutes`** - Place for Subroutes of ProfileRoute
    
        Subroute is a Route inside a Route for example if page allows user to view more than 2 subpages they should
        be treated as Subroutes (eg. https://app.feedbacky.net/me/settings where `/me` is ProfileRoute and
        `/me/settings` is a subroute of ProfileRoute)
* **`src/ui/`** - Place for User Interface elements that don't directly implement client side logic (eg. state management).
* **`src/utils/`** - Place for JavaScript Code utilities used across the project
* **`src/App.js`** - Project main file where every Route is registered and other common code parts are included (eg. theming).

## File Naming
React components should be `UpperCased` while JavaScript Code uses `kebab-case`.
Other assets have no defined case styles but should use them consistently.

## Components
Component props should contain curly brackets for all types of values (string, object, number)
eg.

(GOOD) `<Component prop={"My text"} number={15}/>`

(WRONG) `<Component prop="My text" number={15}/>` Only `number` prop does use curly brackets

## Imports
Imports should be sorted by modules so they're sorted alphabetically.

User Interface elements located in `src/ui/` should contain export in `index.js` file and should be importable only from this file.
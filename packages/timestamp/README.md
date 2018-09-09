# timestamp
Timestamp builder for Angular build facade.  
This builder is an example from the Medium article [Angular CLI 6 under the hood — builders demystified](https://medium.com/@meltedspark/angular-cli-6-under-the-hood-builders-demystified-f0690ebcf01).

## Usage

  1. In the root of your Angular application:
        ```
        npm i -D @angular-builders/timestamp
        ```
  2. In your _angular.json_ add the following to _architect_ section of the relevant project:
  
        ```
        "timestamp": {
          "builder": "@angular-builders/timestamp:file",
          "options": {}
        },
        ```
  3. Run: `ng run [relevant-project]:timestamp`
     Where _[relevant-project]_ is the project to which you've added the target 

## Options

 - `path` - path to the file with timestamp, defaults to `./timestamp`
 - `format` - timestamp date format, defaults to `dd/mm/yyyy`

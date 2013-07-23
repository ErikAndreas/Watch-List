* Install Node.js
* Install ruby (for sass) and run ```gem install sass```

    $ npm install

    $ grunt

There's a ```grunt dist``` target which builds to dist. Setup a gh-pages branch:

    $ git checkout --orphan gh-pages
    Switched to a new branch 'gh-pages'

    $ git rm -rf .
    $ checkout master

And push to github pages.

    $ git subtree push --prefix dist origin gh-pages

See [github pages](https://help.github.com/articles/creating-pages-with-the-automatic-generator) and [yeoman dist](https://github.com/yeoman/yeoman/wiki/Deployment)

TODO: proper logging, see https://coderwall.com/p/_zporq, http://www.emadibrahim.com/2013/06/26/error-logging-with-angular-and-log4javascript/

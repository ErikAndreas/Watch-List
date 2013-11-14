unhosted (being static html/js) web app for monitoring stuff on Spotify. Artist news and or specific artist album. Connect with Dropbox to keep your data in sync on multiple devices/clients.

Recently changed backing (backend) service from remoteStorage.io to Dropbox since (sadly) there are very few remoteStorage end user data storage providers as well as my need for an Android SDK for my WatchList poller, an Android app running background service polling this app's data and notifying findings. Will add poller source in separate repo later...

Also, no longer using github pages for "hosting" the web app, Dropbox requires https so I got me a free SSL cert at StartSSL and hosting it on my own.

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

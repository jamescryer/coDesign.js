caper.js
========

*Still early stage development, not ready for public use*

A simple tool for creative fun collaboration. Originally an experiment with HTML5 canvas,
caper.js is built for the co-creation of low-fidelity designs in realtime with others across the Web.

It's designed to be extensible and configurable (Though I've made a lot of short cuts for a first release.); brushes and complex colors are defined with JSON objects.
For realtime support each user action is abstracted into a command or message which is then interpretted on each client. It's important to keep messages small, sending pixel data would never work.

Third party color picker from http://acko.net/dev/farbtastic

Author
------
James Cryer / Huddle.com

TODO:
-----

+ Smoother UX (color picking and eraser)
+ Documentation
+ Save as image
+ Link to better realtime example

Licence
-------

Do what you like, just don't be an arsehole.
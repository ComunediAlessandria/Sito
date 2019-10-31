#|/bin/bash

export jqv=jquery-ui-1.7.1

rm -f jquery.js jqui.js jqui.css jquery.pack.js

ln -s $jqv.custom/development-bundle/jquery-1.3.2.js		jquery.js
ln -s $jqv.custom/development-bundle/jquery-1.3.2.js		jquery.pack.js
ln -s $jqv.custom/development-bundle/ui/$jqv.custom.js		jqui.js
ln -s $jqv.custom/css/redmond/$jqv.custom.css				jqui.css

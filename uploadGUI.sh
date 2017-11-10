#!/bin/bash

for i in $(ls); do
    if [ "$i" != 'LICENSE' ] && [ "$i" != 'README.md' ] && [ "$i" != '.git' ] && [ "$i" != '.gitignored' ] && [ "$i" != 'uploadGUI.sh' ]; then
        echo "$i"
        mos put ./$i gui/$i
    fi
done

echo "Done."

#!/bin/bash

for i in $(ls gui); do
    if [ "$i" != 'LICENSE' ] && [ "$i" != 'README.md' ] && [ "$i" != '.git' ] && [ "$i" != '.gitignored' ]; then
        echo "$i"
        mos put ./$i gui/$i
    fi
done

echo "Done."

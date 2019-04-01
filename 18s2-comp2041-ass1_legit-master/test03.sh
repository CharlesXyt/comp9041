#!/bin/sh
#test for subset 1 (part 1)

./legit.pl init
touch a b c d e f
./legit.pl commit -a -m "first"
touch g
./legit.pl add g
echo line 1 >> a
echo line 2 >> b
./legit.pl commit -a -m "second"
echo line 4 >> c
rm d
./legit.pl rm f
./legit.pl rm --cached a e
./legit.pl tm --force b
./legit.pl log

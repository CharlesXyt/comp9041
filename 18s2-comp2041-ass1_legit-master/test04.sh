#!/bin/sh
#test for subset 1 (part 2)

./legit.pl init
touch a b c d e f
./legit.pl commit -a -m "first"
touch g
./legit.pl add g
echo line 1 >> a
echo line 2 >> b
./legit.pl commit -a -m "second"
echo line 4 >> c
./legit.pl rm f
echo line 5 >> f
./legit.pl rm --force e
./legit.pl commit -a -m "third"
rm c
./legit.pl rm --cached --force b
./legit.pl status

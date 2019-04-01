#!/bin/sh
#test for subset 0 and 1

./legit.pl init
./legit.pl add a
touch a b
./legit.pl commit -a -m "first"
touch c d e f
echo line1 > a
./legit.pl commit -a -m "second"
echo line 2 >>a
./legit.pl add a
rm e
./legit.pl rm d
./legit.pl rm --cached a
./legit.pl rm --force --cached a
./legit.pl show 0:a
./legit.pl show :a
./legit.pl log
./legit.pl status


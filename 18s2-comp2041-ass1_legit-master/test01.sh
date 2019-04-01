#!/bin/sh
#test for subset 1 (part 2)

./legit.pl init
echo line 1 > a
echo line 2 > b
./legit.pl add a b
./legit.pl commit -m "first commit"
echo line 2 >> a
./legit.pl add a b
./legit.pl commit -m "second commit"
./legit.pl add b
./legit.pl commit -m "third commit"
./legit.pl log

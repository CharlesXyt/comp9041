#!/bin/sh
#test for subset 0(part 3)

./legit.pl init
echo line 1 > a
echo line 2 > b
./legit.pl commit -m "first commit"
echo line 2 >> a
./legit.pl add a b
./legit.pl commit -m "second commit"
echo line 3 >> b
./legit.pl add a b
./legit.pl commit -m "third commit"
echo line 4 >> a
./legit.pl add a b
./legit.pl commit -m "forth commit"
echo line 5 >> a
./legit.pl log
./legit.pl show 0:a
./legit.pl show 2:b
./legit.pl show :b

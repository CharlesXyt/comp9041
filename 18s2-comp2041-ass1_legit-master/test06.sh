#!/bin/sh
#test for subset 2(part 1)

./legit.pl init
echo line 1 > a
./legit.pl commit -a -m "first"
./legit.pl branch friend
./legit.pl checkout b1
echo line 3 > a
./legit.pl commit -a -m "friend"
./legit.pl checkout master

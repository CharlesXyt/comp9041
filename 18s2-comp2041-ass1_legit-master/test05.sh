#!/bin/sh
#test for subset 1 (part 3)

./legit.pl init
touch a b c d e f g h
./legit.pl add a b c d e f
./legit.pl commit -m 'first commit'
echo hello >a
echo hello >b
echo hello >c
./legit.pl add a b
echo world >a
rm d
./legit.pl rm e
./legit.pl add g
./legit.pl status

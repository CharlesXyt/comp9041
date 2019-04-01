#!/bin/sh
#test for challenge

./legit.pl init
seq 1 1000000 >million_line_file.txt
./legit.pl add million_line_file.txt
./legit.pl commit -m commit1
du -bs .legit
echo extra line >>million_line_file.txt
./legit.pl commit -a -m commit2
du -bs .legit
sed -i 500000d  million_line_file.txt
./legit.pl commit -a -m commit3
du -bs .legit

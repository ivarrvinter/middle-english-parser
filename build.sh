#!/bin/bash
cd Parse;
python 00.Groups.py $1
python 00.Groups.Test.py
python 01.Strip.py
python 01.Strip.Test.py
echo "Finished !"
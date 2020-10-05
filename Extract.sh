#!/bin/bash
cd Parse;
python 00.Group.py $1
python 00.Group.Test.py
python 01.Strip.py
python 01.Strip.Test.py
python 02.OrganizeGroups.py
python 02.OrganizeGroups.Test.py
echo "Finished !"
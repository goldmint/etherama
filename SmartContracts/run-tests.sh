#! /bin/bash

# Please run this one in parallel:
#   ./node_modules/.bin/testrpc --port 8989 --gasLimit 1000000000

env ETH_NODE=http://localhost:8989 mocha --reporter spec -t 90000 -g "ETHERARAMA"


#-g "Price"




